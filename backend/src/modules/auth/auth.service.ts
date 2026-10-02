import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../../common/services/password.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResendEmailService } from '../../common/services/resend-email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private resendEmailService: ResendEmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verify(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    // Vérifier que le compte est actif
    if (user.status !== 'active') {
      throw new UnauthorizedException(`Compte ${user.status}`);
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.generateRefreshToken(user.id),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: user.ipAddress || null },
      }),
      this.logLoginAttempt(user.email, user.id, user.organizationId, true, null),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: { select: { id: true, email: true, organizationId: true, role: true, status: true } },
      },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (stored.user.status !== 'active') {
      throw new UnauthorizedException(`Compte ${stored.user.status}`);
    }

    const payload = {
      email: stored.user.email,
      sub: stored.user.id,
      organizationId: stored.user.organizationId,
      role: stored.user.role,
    };

    // Rotation : révoquer l'ancien, créer un nouveau
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.generateRefreshToken(stored.user.id),
      this.prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
    return { message: 'Déconnecté avec succès' };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresInDays = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d').replace('d', ''),
    );
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt, ipAddress: '', userAgent: '' },
    });
    return token;
  }

  async createAccount(data: {
    orgName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    // Vérifier email unique
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new BadRequestException('Un compte avec cet email existe déjà');

    const passwordValidation = this.passwordService.validateStrength(data.password);
    if (!passwordValidation.valid)
      throw new BadRequestException({
        message: 'Mot de passe trop faible',
        errors: passwordValidation.feedback,
      });

    const passwordHash = await this.passwordService.hash(data.password);

    // Créer org + user atomiquement
    const slug =
      data.orgName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 50) +
      '-' +
      Date.now().toString(36);

    const [org] = await Promise.all([
      this.prisma.organization.create({
        data: {
          name: data.orgName,
          slug,
          email: data.email,
          subscriptionPlan: 'essentialiel',
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxSites: 1,
          maxUsers: 3,
          maxMonthlyFeedbacks: 1000,
        },
      }),
    ]);

    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'org_admin',
        status: 'active',
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    this.logger.log(`New account created: ${user.email} / org: ${org.name}`);
    return { message: 'Compte créé avec succès', user };
  }

  async register(registerDto: RegisterDto) {
    // Vérifier que l'email n'existe pas
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Un compte avec cet email existe déjà');
    }

    // Vérifier que l'organisation existe
    const org = await this.prisma.organization.findUnique({
      where: { id: registerDto.organizationId, deletedAt: null },
    });
    if (!org) {
      throw new BadRequestException('Organisation non trouvée');
    }
    if (org.subscriptionStatus === 'suspended' || org.subscriptionStatus === 'expired') {
      throw new BadRequestException('Organisation inactive');
    }

    // Vérifier le quota maxUsers
    const currentUsers = await this.prisma.user.count({
      where: { organizationId: registerDto.organizationId, deletedAt: null },
    });
    if (currentUsers >= org.maxUsers) {
      throw new BadRequestException(
        `Quota atteint: ${currentUsers}/${org.maxUsers} utilisateurs. Passez à un plan supérieur pour en ajouter.`,
      );
    }

    // Valider la force du mot de passe
    const passwordValidation = this.passwordService.validateStrength(registerDto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'Mot de passe trop faible',
        errors: passwordValidation.feedback,
      });
    }

    // Hasher le mot de passe
    const passwordHash = await this.passwordService.hash(registerDto.password);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        organizationId: registerDto.organizationId,
        role: 'agent', // Rôle par défaut
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'Compte créé avec succès',
      user,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, email: true, firstName: true },
    });

    // Anti-énumération : ne rien révéler si l'user n'existe pas
    if (!user) return;

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await this.prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Créer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    await this.resendEmailService.sendPasswordResetEmail(user.email, user.firstName, token);
    this.logger.log(`[RESET PASSWORD] Email de réinitialisation préparé pour ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.prisma.passwordReset.findFirst({
      where: { token, expiresAt: { gt: new Date() }, isUsed: false },
      include: { user: true },
    });

    if (!reset) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const validation = this.passwordService.validateStrength(newPassword);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Mot de passe trop faible',
        errors: validation.feedback,
      });
    }

    const passwordHash = await this.passwordService.hash(newPassword);

    await Promise.all([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.delete({ where: { id: reset.id } }),
      // Révoquer tous les refresh tokens de l'utilisateur par sécurité
      this.prisma.refreshToken.updateMany({
        where: { userId: reset.userId },
        data: { isRevoked: true },
      }),
    ]);

    this.logger.log(`[RESET PASSWORD] Mot de passe réinitialisé pour userId: ${reset.userId}`);
  }

  private async logLoginAttempt(
    email: string,
    userId: string | null,
    organizationId: string | null,
    success: boolean,
    reason: string | null,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: success ? 'login_success' : 'login_failed',
          entityType: 'auth',
          entityId: userId,
          userId,
          userEmail: email,
          organizationId: organizationId ?? undefined,
          success,
          errorMessage: reason,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log login attempt:', error);
    }
  }
}
