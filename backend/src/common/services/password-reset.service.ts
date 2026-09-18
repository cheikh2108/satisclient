import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { PasswordService } from './password.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly TOKEN_EXPIRY_HOURS = 1; // 1 heure pour reset password
  private readonly MAX_ATTEMPTS_PER_DAY = 3;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private passwordService: PasswordService,
  ) {}

  /**
   * Demande de reset de mot de passe
   */
  async requestPasswordReset(email: string, ipAddress: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    // Ne pas révéler si l'email existe (sécurité)
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Vérifier le rate limiting (max 3 demandes/jour)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentRequests = await this.prisma.passwordReset.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentRequests >= this.MAX_ATTEMPTS_PER_DAY) {
      this.logger.warn(
        `[SECURITY] Too many password reset requests - email: ${email}, ip: ${ipAddress}`,
      );
      throw new BadRequestException(
        'Trop de demandes de réinitialisation. Réessayez dans 24h.',
      );
    }

    // Générer token
    const token = this.encryptionService.generateToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress,
      },
    });

    // TODO: Envoyer email avec le token
    this.logger.log(`Password reset requested for: ${email}`);
    this.logger.debug(`Reset URL: /reset-password?token=${token}`);
  }

  /**
   * Réinitialise le mot de passe avec le token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset) {
      throw new BadRequestException('Token de réinitialisation invalide');
    }

    if (reset.isUsed) {
      throw new BadRequestException('Ce token a déjà été utilisé');
    }

    if (reset.expiresAt < new Date()) {
      await this.prisma.passwordReset.delete({ where: { id: reset.id } });
      throw new BadRequestException('Token de réinitialisation expiré');
    }

    // Valider le nouveau mot de passe
    const validation = this.passwordService.validateStrength(newPassword);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Nouveau mot de passe trop faible',
        errors: validation.feedback,
      });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await this.passwordService.hash(newPassword);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    // Marquer le token comme utilisé
    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Révoquer tous les refresh tokens (forcer re-login)
    await this.prisma.refreshToken.updateMany({
      where: { userId: reset.userId },
      data: { isRevoked: true },
    });

    this.logger.log(`Password reset successful for user: ${reset.user.email}`);

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        action: 'password_reset',
        entityType: 'user',
        entityId: reset.userId,
        userId: reset.userId,
        userEmail: reset.user.email,
        ipAddress: reset.ipAddress,
        success: true,
      },
    });
  }

  /**
   * Nettoie les tokens expirés (tâche planifiée)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordReset.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true, usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} old password reset tokens`);
    }

    return result.count;
  }
}
