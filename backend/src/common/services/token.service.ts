import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly MAX_SESSIONS_PER_USER = 5;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Génère un access token JWT
   */
  generateAccessToken(userId: string, email: string, organizationId: string, role: string): string {
    const payload = {
      sub: userId,
      email,
      organizationId,
      role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Génère un refresh token et le stocke en BDD
   */
  async generateRefreshToken(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    // Nettoyer les anciennes sessions si limite dépassée
    await this.cleanupOldSessions(userId);

    // Générer token sécurisé
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Stocker en BDD
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
      },
    });

    return token;
  }

  /**
   * Valide et rafraîchit un refresh token (rotation)
   */
  async refreshAccessToken(
    refreshToken: string,
    deviceInfo: DeviceInfo,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Récupérer le token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Vérifications
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.isRevoked) {
      // Token révoqué - sécurité compromise, révoquer tous les tokens de l'utilisateur
      await this.revokeAllUserTokens(storedToken.userId);
      this.logger.warn(`[SECURITY] Revoked token used - userId: ${storedToken.userId}`);
      throw new UnauthorizedException('Token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      // Token expiré
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    if (storedToken.user.status !== 'active') {
      throw new UnauthorizedException(`Account ${storedToken.user.status}`);
    }

    // ROTATION: Révoquer l'ancien token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Générer nouveau access token
    const accessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.organizationId,
      storedToken.user.role,
    );

    // Générer nouveau refresh token
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId, deviceInfo);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Révoque un refresh token spécifique
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Révoque tous les refresh tokens d'un utilisateur (logout all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    this.logger.log(`All tokens revoked for user: ${userId}`);
  }

  /**
   * Nettoie les anciennes sessions si limite dépassée
   */
  private async cleanupOldSessions(userId: string): Promise<void> {
    const activeSessions = await this.prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });

    if (activeSessions.length >= this.MAX_SESSIONS_PER_USER) {
      // Supprimer les plus anciennes
      const tokensToDelete = activeSessions.slice(this.MAX_SESSIONS_PER_USER - 1);
      await this.prisma.refreshToken.deleteMany({
        where: {
          id: { in: tokensToDelete.map((t) => t.id) },
        },
      });

      this.logger.log(
        `Cleaned up ${tokensToDelete.length} old sessions for user: ${userId}`,
      );
    }
  }

  /**
   * Liste les sessions actives d'un utilisateur
   */
  async getActiveSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  /**
   * Révoque une session spécifique
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Nettoie les tokens expirés (tâche planifiée)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
    }

    return result.count;
  }
}
