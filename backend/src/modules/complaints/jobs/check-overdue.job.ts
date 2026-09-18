import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';
import { ComplaintOverdueEvent } from '../../../events/complaint.events';

/**
 * Cron Job: Vérifier les réclamations en retard (SLA dépassé)
 *
 * Fréquence: Toutes les heures
 * Action:
 * - Trouve les réclamations avec slaDueDate < now et status != resolved/closed
 * - Marque isOverdue = true
 * - Émet événement complaint.overdue pour notifications
 */
@Injectable()
export class CheckOverdueJob {
  private readonly logger = new Logger(CheckOverdueJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Check overdue complaints chaque heure
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueComplaints() {
    const startTime = Date.now();
    this.logger.log('🕐 [CRON] Check overdue complaints - START');

    try {
      const now = new Date();

      // Trouver réclamations overdue
      const overdueComplaints = await this.prisma.complaint.findMany({
        where: {
          slaDueDate: { lt: now },
          status: {
            notIn: [ComplaintStatus.resolved, ComplaintStatus.closed],
          },
          isOverdue: false, // Seulement celles pas encore marquées
        },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        `📊 Found ${overdueComplaints.length} overdue complaints`,
      );

      let updatedCount = 0;

      for (const complaint of overdueComplaints) {
        // Marquer comme overdue
        await this.prisma.complaint.update({
          where: { id: complaint.id },
          data: { isOverdue: true },
        });

        // Émettre événement pour notifications
        this.eventEmitter.emit(
          'complaint.overdue',
          new ComplaintOverdueEvent(
            complaint.id,
            complaint.ticketNumber,
            complaint.slaDueDate,
            complaint.priority,
            complaint.assignedTo,
            complaint.assignee?.email,
          ),
        );

        updatedCount++;

        this.logger.warn({
          event: 'complaint.overdue.detected',
          ticketNumber: complaint.ticketNumber,
          priority: complaint.priority,
          slaDueDate: complaint.slaDueDate,
          daysOverdue: Math.floor(
            (now.getTime() - complaint.slaDueDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        });
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ [CRON] Check overdue completed: ${updatedCount} marked as overdue (${duration}ms)`,
      );
    } catch (error) {
      this.logger.error({
        event: 'cron.check_overdue.error',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Auto-escalade pour réclamations critiques overdue
   * Fréquence: Toutes les 4 heures
   */
  @Cron(CronExpression.EVERY_4_HOURS)
  async autoEscalateCriticalOverdue() {
    this.logger.log('🚨 [CRON] Auto-escalate critical overdue - START');

    try {
      // Trouver réclamations urgent/high overdue non escaladées
      const criticalOverdue = await this.prisma.complaint.findMany({
        where: {
          isOverdue: true,
          isEscalated: false,
          priority: { in: ['urgent', 'high'] },
          status: {
            notIn: [ComplaintStatus.resolved, ComplaintStatus.closed],
          },
        },
        take: 50, // Limiter pour éviter la surcharge
      });

      this.logger.log(
        `📊 Found ${criticalOverdue.length} critical overdue complaints to escalate`,
      );

      let escalatedCount = 0;

      for (const complaint of criticalOverdue) {
        // TODO: Logique pour trouver le superviseur
        // Pour l'instant, on marque juste comme escaladé
        await this.prisma.complaint.update({
          where: { id: complaint.id },
          data: {
            isEscalated: true,
            escalatedAt: new Date(),
            // escalatedTo: supervisorId, // TODO
          },
        });

        escalatedCount++;

        this.logger.warn({
          event: 'complaint.auto_escalated',
          ticketNumber: complaint.ticketNumber,
          priority: complaint.priority,
        });
      }

      this.logger.log(
        `✅ [CRON] Auto-escalate completed: ${escalatedCount} escalated`,
      );
    } catch (error) {
      this.logger.error({
        event: 'cron.auto_escalate.error',
        error: error.message,
      });
    }
  }
}
