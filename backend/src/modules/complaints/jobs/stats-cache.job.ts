import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Cron Job: Mise à jour du cache des statistiques
 *
 * Fréquence: Chaque nuit à 1h
 * Action:
 * - Pré-calcule les stats dashboard pour chaque organisation
 * - Stocke dans Redis/DB pour accès rapide
 * - Améliore performance des dashboards
 */
@Injectable()
export class StatsCacheJob {
  private readonly logger = new Logger(StatsCacheJob.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mettre à jour le cache des stats chaque nuit
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateStatsCache() {
    const startTime = Date.now();
    this.logger.log('📊 [CRON] Update Stats Cache - START');

    try {
      // Récupérer toutes les organisations actives
      const organizations = await this.prisma.organization.findMany({
        where: {
          subscriptionStatus: { in: ['trial', 'active'] },
          deletedAt: null,
        },
        select: { id: true, name: true },
      });

      this.logger.log(`📊 Processing ${organizations.length} organizations`);

      for (const org of organizations) {
        await this.updateOrgStats(org.id);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ [CRON] Stats cache updated for ${organizations.length} orgs (${duration}ms)`,
      );
    } catch (error) {
      this.logger.error({
        event: 'cron.stats_cache.error',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Mettre à jour les stats d'une organisation
   */
  private async updateOrgStats(organizationId: string) {
    try {
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Stats Complaints
      const complaintsStats = await this.prisma.complaint.groupBy({
        by: ['status', 'priority'],
        where: {
          organizationId,
          createdAt: { gte: last30Days },
        },
        _count: true,
      });

      // Stats Feedbacks
      const feedbacksStats = await this.prisma.feedback.groupBy({
        by: ['commentSentiment'],
        where: {
          organizationId,
          createdAt: { gte: last30Days },
        },
        _count: true,
        _avg: { overallRating: true },
      });

      // Compter overdue
      const overdueCount = await this.prisma.complaint.count({
        where: {
          organizationId,
          isOverdue: true,
          status: { notIn: ['resolved', 'closed'] },
        },
      });

      // TODO: Stocker dans Redis ou table stats_cache
      // await this.redis.set(`stats:${organizationId}:complaints`, JSON.stringify(complaintsStats), 'EX', 86400);
      // await this.redis.set(`stats:${organizationId}:feedbacks`, JSON.stringify(feedbacksStats), 'EX', 86400);

      this.logger.debug({
        event: 'stats.cached',
        organizationId,
        complaintsCount: complaintsStats.reduce((sum, s) => sum + s._count, 0),
        feedbacksCount: feedbacksStats.reduce((sum, s) => sum + s._count, 0),
        overdueCount,
      });
    } catch (error) {
      this.logger.error({
        event: 'stats.cache_org.error',
        organizationId,
        error: error.message,
      });
    }
  }

  /**
   * Nettoyer les anciennes données chaque semaine
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanOldData() {
    this.logger.log('🧹 [CRON] Clean Old Data - START');

    try {
      const retentionDays = 365; // 1 an
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Soft delete des anciennes réclamations fermées
      const deletedComplaints = await this.prisma.complaint.updateMany({
        where: {
          status: 'closed',
          closedAt: { lt: cutoffDate },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Nettoyer l'historique ancien (>2 ans)
      const historyRetentionDays = 730; // 2 ans
      const historyCutoff = new Date();
      historyCutoff.setDate(historyCutoff.getDate() - historyRetentionDays);

      const deletedHistory = await this.prisma.complaintHistory.deleteMany({
        where: {
          createdAt: { lt: historyCutoff },
        },
      });

      this.logger.log(
        `✅ [CRON] Cleaned: ${deletedComplaints.count} complaints, ${deletedHistory.count} history entries`,
      );
    } catch (error) {
      this.logger.error({
        event: 'cron.clean_old_data.error',
        error: error.message,
      });
    }
  }
}
