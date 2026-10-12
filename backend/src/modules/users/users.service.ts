import * as crypto from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/services/password.service';
import { ResendEmailService } from '../../common/services/resend-email.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private resendEmailService: ResendEmailService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        organization: { deletedAt: null },
      },
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

  private assertCanManage(actor: { role: string; organizationId: string }, organizationId: string) {
    if (actor.role !== 'super_admin' && actor.role !== 'org_admin') {
      throw new ForbiddenException('Accès refusé');
    }
    if (actor.role !== 'super_admin' && organizationId !== actor.organizationId) {
      throw new ForbiddenException('Accès refusé');
    }
  }

  private async issueResetToken(
    client: Pick<PrismaService, 'passwordReset'>,
    userId: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await client.passwordReset.deleteMany({ where: { userId } });
    await client.passwordReset.create({
      data: { userId, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    return token;
  }

  async findOneManaged(actor: { role: string; organizationId: string }, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        organizationId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    this.assertCanManage(actor, user.organizationId);
    return user;
  }

  async createUser(
    actor: { role: string; organizationId: string },
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
      organizationId?: string;
    },
  ) {
    const organizationId =
      actor.role === 'super_admin'
        ? dto.organizationId || actor.organizationId
        : actor.organizationId;
    this.assertCanManage(actor, organizationId);

    if (actor.role !== 'super_admin' && dto.role === 'super_admin') {
      throw new ForbiddenException('Rôle non autorisé');
    }
    const email = dto.email?.trim();
    if (!email || !dto.firstName?.trim() || !dto.lastName?.trim() || !dto.role) {
      throw new BadRequestException('Prénom, nom, email et rôle sont requis');
    }

    const existing = await this.prisma.user.findFirst({
      where: { organizationId, email },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    // Mot de passe aléatoire inutilisable : l'utilisateur définit le sien via le lien reçu par mail
    const passwordHash = await this.passwordService.hash(crypto.randomBytes(24).toString('base64'));

    const { user, token } = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          organizationId,
          email,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: dto.role,
          status: 'active',
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          organizationId: true,
          createdAt: true,
        },
      });
      return { user: created, token: await this.issueResetToken(tx, created.id) };
    });

    try {
      await this.resendEmailService.sendPasswordResetEmail(user.email, user.firstName, token);
    } catch (error) {
      this.logger.warn(`Email d'activation non envoyé pour ${user.id}: ${error.message}`);
    }
    return user;
  }

  async deleteUser(actor: { id: string; role: string; organizationId: string }, id: string) {
    const target = await this.findOneManaged(actor, id);
    if (target.id === actor.id) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }
    if (actor.role !== 'super_admin' && target.role === 'super_admin') {
      throw new ForbiddenException('Accès refusé');
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        // Libère l'email pour une éventuelle recréation (contrainte unique organisation + email)
        data: {
          deletedAt: now,
          status: 'inactive',
          email: `deleted+${now.getTime()}+${target.email}`,
        },
      }),
      this.prisma.refreshToken.updateMany({ where: { userId: id }, data: { isRevoked: true } }),
    ]);
    return { message: 'Utilisateur supprimé' };
  }

  async updateUser(
    actor: { id: string; role: string; organizationId: string },
    targetId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: UserRole;
      status?: UserStatus;
    },
  ) {
    if (actor.role !== 'super_admin' && actor.role !== 'org_admin') {
      throw new ForbiddenException('Accès refusé');
    }

    const target = await this.prisma.user.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, email: true, firstName: true, role: true, organizationId: true },
    });
    if (!target) throw new NotFoundException('Utilisateur non trouvé');
    if (actor.role !== 'super_admin' && target.organizationId !== actor.organizationId) {
      throw new ForbiddenException('Accès refusé');
    }
    if (
      actor.role !== 'super_admin' &&
      (target.role === 'super_admin' || dto.role === 'super_admin')
    ) {
      throw new ForbiddenException('Accès refusé');
    }

    const { email: rawEmail, ...rest } = dto;
    const newEmail = rawEmail?.trim();
    const emailChanged = !!newEmail && newEmail !== target.email;

    if (emailChanged) {
      const taken = await this.prisma.user.findFirst({
        where: { organizationId: target.organizationId, email: newEmail, id: { not: targetId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Cet email est déjà utilisé');
    }

    const token = emailChanged ? crypto.randomBytes(32).toString('hex') : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: targetId },
        data: { ...rest, ...(emailChanged ? { email: newEmail, emailVerifiedAt: null } : {}) },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      if (token) {
        await tx.passwordReset.deleteMany({ where: { userId: targetId } });
        await tx.passwordReset.create({
          data: { userId: targetId, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
        });
        // L'ancienne adresse ne doit plus donner accès : on coupe les sessions ouvertes
        await tx.refreshToken.updateMany({
          where: { userId: targetId },
          data: { isRevoked: true },
        });
      }
      return user;
    });

    if (token) {
      try {
        await this.resendEmailService.sendPasswordResetEmail(
          updated.email,
          updated.firstName,
          token,
        );
      } catch (error) {
        this.logger.warn(`Email de réinitialisation non envoyé pour ${targetId}: ${error.message}`);
      }
    }

    return updated;
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
      this.prisma.organization.count({ where: { isPlatform: false, deletedAt: null } }),
      this.prisma.organization.count({
        where: { isPlatform: false, deletedAt: null, subscriptionStatus: 'active' },
      }),
      this.prisma.organization.count({
        where: { isPlatform: false, deletedAt: null, subscriptionStatus: 'trial' },
      }),
      this.prisma.organization.count({
        where: { isPlatform: false, deletedAt: null, subscriptionStatus: 'suspended' },
      }),
      this.prisma.user.count({
        where: { deletedAt: null, organization: { isPlatform: false, deletedAt: null } },
      }),
      this.prisma.user.count({
        where: {
          status: 'active',
          deletedAt: null,
          organization: { isPlatform: false, deletedAt: null },
        },
      }),
      this.prisma.user.count({
        where: {
          status: 'pending',
          deletedAt: null,
          organization: { isPlatform: false, deletedAt: null },
        },
      }),
      this.prisma.site.count({
        where: { organization: { isPlatform: false, deletedAt: null } },
      }),
      this.prisma.site.count({
        where: { isActive: true, organization: { isPlatform: false, deletedAt: null } },
      }),
      this.prisma.feedback.count({
        where: { organization: { isPlatform: false, deletedAt: null } },
      }),
      this.prisma.complaint.count({
        where: { organization: { isPlatform: false, deletedAt: null } },
      }),
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
