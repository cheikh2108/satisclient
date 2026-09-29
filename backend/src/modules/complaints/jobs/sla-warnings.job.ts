import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';

/**
 * Cron Job: Avertissements SLA
 *
 * Fréquence: Toutes les heures
 * Action:
 * - Trouve les réclamations avec slaDueDate dans les prochaines 24h
 * - Envoie alerte à l'agent assigné + superviseur
 */
@Injectable()
export class SlaWarningsJob {
  private readonly logger = new Logger(SlaWarningsJob.name);
  private processedWarnings = new Set<string>(); // Cache pour éviter les doublons

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envoyer warnings SLA chaque heure
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendSlaWarnings() {
    const startTime = Date.now();
    this.logger.log('⏰ [CRON] SLA Warnings - START');

    try {
      const now = new Date();
      const warningThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

      // Trouver réclamations approchant du SLA
      const upcomingSla = await this.prisma.complaint.findMany({
        where: {
          slaDueDate: {
            gte: now,
            lte: warningThreshold,
          },
          status: {
            notIn: [ComplaintStatus.resolved, ComplaintStatus.closed],
          },
          isOverdue: false,
        },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(
        `📊 Found ${upcomingSla.length} complaints approaching SLA deadline`,
      );

      let warningsSent = 0;

      for (const complaint of upcomingSla) {
        // Vérifier si warning déjà envoyé (éviter doublons)
        const cacheKey = `${complaint.id}-${complaint.slaDueDate!.getTime()}`;
        if (this.processedWarnings.has(cacheKey)) {
          continue;
        }

        const hoursRemaining = Math.floor(
          (complaint.slaDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60),
        );

        // TODO: Émettre événement pour notification email/SMS
        // this.eventEmitter.emit('complaint.sla.warning', { ... });

        this.logger.warn({
          event: 'complaint.sla.warning',
          ticketNumber: complaint.ticketNumber,
          priority: complaint.priority,
          slaDueDate: complaint.slaDueDate,
          hoursRemaining,
          assignedTo: complaint.assignee?.email,
        });

        console.log(`⏰ [SLA WARNING] ${complaint.ticketNumber}`);
        console.log(`   Temps restant: ${hoursRemaining}h`);
        console.log(`   Priorité: ${complaint.priority}`);
        console.log(`   Assigné: ${complaint.assignee?.firstName} ${complaint.assignee?.lastName}`);
        console.log(`   Email: ${complaint.assignee?.email}`);

        // Marquer comme traité
        this.processedWarnings.add(cacheKey);
        warningsSent++;
      }

      // Nettoyer le cache (garder seulement les 1000 derniers)
      if (this.processedWarnings.size > 1000) {
        const toDelete = Array.from(this.processedWarnings).slice(0, 500);
        toDelete.forEach((key) => this.processedWarnings.delete(key));
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ [CRON] SLA Warnings completed: ${warningsSent} warnings sent (${duration}ms)`,
      );
    } catch (error) {
      this.logger.error({
        event: 'cron.sla_warnings.error',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Nettoyer le cache de warnings chaque jour à minuit
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanWarningsCache() {
    const size = this.processedWarnings.size;
    this.processedWarnings.clear();
    this.logger.log(`🧹 [CRON] Cleaned warnings cache (${size} entries)`);
  }
}
