import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly TOKEN_EXPIRY_HOURS = 24;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Génère un token de vérification d'email
   */
  async generateVerificationToken(userId: string): Promise<string> {
    // Supprimer les anciens tokens
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Générer nouveau token
    const token = this.encryptionService.generateToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Vérifie un email avec le token
   */
  async verifyEmail(token: string): Promise<void> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (verification.expiresAt < new Date()) {
      await this.prisma.emailVerification.delete({ where: { id: verification.id } });
      throw new BadRequestException('Token de vérification expiré');
    }

    // Mettre à jour l'utilisateur
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    });

    // Supprimer le token utilisé
    await this.prisma.emailVerification.delete({ where: { id: verification.id } });

    this.logger.log(`Email verified for user: ${verification.user.email}`);
  }

  /**
   * Renvoie un email de vérification
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email déjà vérifié');
    }

    const token = await this.generateVerificationToken(user.id);

    // TODO: Envoyer email avec le token
    this.logger.log(`Verification email sent to: ${email}`);
    this.logger.debug(`Verification URL: /verify-email?token=${token}`);
  }
}
