import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/services/password.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        role: true,
        status: true,
        organizationId: true,
        preferences: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        emailVerifiedAt: true,
        assignedSiteIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(organizationId: string, params?: { skip?: number; take?: number; role?: string }) {
    const { skip = 0, take = 50, role } = params ?? {};
    const where: any = { organizationId, deletedAt: null };
    if (role) where.role = role;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page: Math.floor(skip / take) + 1, pageSize: take } };
  }

  async findPlatformAdmins(params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params ?? {};
    const where = {
      role: 'org_admin' as const,
      deletedAt: null,
      organization: { isPlatform: false, deletedAt: null },
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          organizationId: true,
          lastLoginAt: true,
          createdAt: true,
          organization: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page: Math.floor(skip / take) + 1, pageSize: take } };
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
      twoFactorEnabled?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const passwordValidation = this.passwordService.validateStrength(newPassword || '');
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.feedback.join(' '));
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user || !(await this.passwordService.verify(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.passwordService.hash(newPassword) },
    });
    return { message: 'Mot de passe modifié avec succès' };
  }

  async updatePreferences(userId: string, preferences: Record<string, unknown>) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const current = (user?.preferences as Record<string, unknown>) ?? {};
    const merged = { ...current, ...preferences };
    return this.prisma.user.update({
      where: { id: userId },
      data: { preferences: merged as any },
      select: { id: true, preferences: true, updatedAt: true },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      select: { id: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, tokenId: string) {
    const token = await this.prisma.refreshToken.findFirst({ where: { id: tokenId, userId } });
    if (!token) throw new NotFoundException('Session non trouvée');
    await this.prisma.refreshToken.update({ where: { id: tokenId }, data: { isRevoked: true } });
    return { message: 'Session révoquée' };
  }

  async getPlatformStats() {
    const [
      totalOrgs,
      activeOrgs,
      trialOrgs,
      suspiredOrgs,
      totalUsers,
      activeUsers,
      pendingUsers,
      totalSites,
      activeSites,
      totalFeedbacks,
      totalComplaints,
    ] = await Promise.all([
      this.prisma.organization.count({ where: { isPlatform: false } }),
      this.prisma.organization.count({
        where: { isPlatform: false, subscriptionStatus: 'active' },
      }),
      this.prisma.organization.count({ where: { isPlatform: false, subscriptionStatus: 'trial' } }),
      this.prisma.organization.count({
        where: { isPlatform: false, subscriptionStatus: 'suspended' },
      }),
      this.prisma.user.count({ where: { deletedAt: null, organization: { isPlatform: false } } }),
      this.prisma.user.count({
        where: { status: 'active', deletedAt: null, organization: { isPlatform: false } },
      }),
      this.prisma.user.count({
        where: { status: 'pending', deletedAt: null, organization: { isPlatform: false } },
      }),
      this.prisma.site.count({ where: { organization: { isPlatform: false } } }),
      this.prisma.site.count({ where: { isActive: true, organization: { isPlatform: false } } }),
      this.prisma.feedback.count({ where: { organization: { isPlatform: false } } }),
      this.prisma.complaint.count({ where: { organization: { isPlatform: false } } }),
    ]);

    return {
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        trial: trialOrgs,
        suspended: suspiredOrgs,
      },
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers },
      sites: { total: totalSites, active: activeSites },
      activity: { totalFeedbacks, totalComplaints },
    };
  }

  async getStats(organizationId: string) {
    const where = { organizationId, deletedAt: null };

    const [total, active, pending, suspended, byRole] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, status: 'active' } }),
      this.prisma.user.count({ where: { ...where, status: 'pending' } }),
      this.prisma.user.count({ where: { ...where, status: 'suspended' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where,
        _count: true,
      }),
    ]);

    const adminRoles = ['super_admin', 'org_admin'];
    const admins = byRole
      .filter((r) => adminRoles.includes(r.role))
      .reduce((sum, r) => sum + r._count, 0);

    return {
      total,
      active,
      pending,
      suspended,
      admins,
      byRole: byRole.reduce(
        (acc, r) => ({ ...acc, [r.role]: r._count }),
        {} as Record<string, number>,
      ),
    };
  }

  async getPlatformAdminStats() {
    const where = {
      role: 'org_admin' as const,
      deletedAt: null,
      organization: { isPlatform: false, deletedAt: null },
    };

    const [total, active, pending, suspended] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, status: 'active' } }),
      this.prisma.user.count({ where: { ...where, status: 'pending' } }),
      this.prisma.user.count({ where: { ...where, status: 'suspended' } }),
    ]);

    return { total, active, pending, suspended, admins: total, byRole: { org_admin: total } };
  }
}
