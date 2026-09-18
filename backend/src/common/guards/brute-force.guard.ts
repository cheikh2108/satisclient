import { Injectable, CanActivate, ExecutionContext, HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BruteForceGuard implements CanActivate {
  private readonly logger = new Logger(BruteForceGuard.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.body?.email;
    const ipAddress = request.ip || request.connection.remoteAddress;

    if (!email) {
      return true; // Skip si pas d'email dans le body
    }

    try {
      // Vérifier les tentatives échouées récentes
      const recentAttempts = await this.countRecentFailedAttempts(email);

      if (recentAttempts >= this.MAX_ATTEMPTS) {
        this.logger.warn(`[SECURITY] Account lockout - Email: ${email}, IP: ${ipAddress}`);

        // Log dans audit logs
        await this.logSecurityEvent('account_lockout', email, ipAddress);

        throw new HttpException(
          {
            statusCode: 429,
            message: `Compte temporairement verrouillé après ${this.MAX_ATTEMPTS} tentatives échouées. Réessayez dans ${this.LOCKOUT_DURATION_MINUTES} minutes.`,
            error: 'Too Many Requests',
            retryAfter: this.LOCKOUT_DURATION_MINUTES * 60,
          },
          429,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error in BruteForceGuard:', error);
      return true; // Fail open en cas d'erreur
    }
  }

  private async countRecentFailedAttempts(email: string): Promise<number> {
    const lockoutStart = new Date(Date.now() - this.LOCKOUT_DURATION_MINUTES * 60 * 1000);

    // Note: Cette table sera créée dans une prochaine migration
    // Pour l'instant, retourner 0
    try {
      const count = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE action = 'login_failed'
        AND user_email = ${email}
        AND created_at >= ${lockoutStart}
      `;

      return Number(count[0]?.count || 0);
    } catch (error) {
      this.logger.warn('Failed to count login attempts (table may not exist yet)');
      return 0;
    }
  }

  private async logSecurityEvent(type: string, email: string, ipAddress: string): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: type,
          entityType: 'auth',
          userEmail: email,
          ipAddress,
          success: false,
          errorMessage: `${this.MAX_ATTEMPTS} failed login attempts`,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }
}
