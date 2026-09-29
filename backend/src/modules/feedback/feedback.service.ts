import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FeedbackCreatedEvent,
  FeedbackNegativeEvent,
  FeedbackProcessedEvent,
} from '../../events/feedback.events';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { plainToInstance } from 'class-transformer';
import { Sentiment, Feedback } from '@prisma/client';

@Injectable()
export class FeedbackService {
  private static readonly DAYS_IN_WEEK = 7;
  private static readonly DAYS_IN_MONTH = 30;
  private static readonly DAYS_IN_QUARTER = 90;
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Créer un nouveau feedback
   * - Vérifie que le site existe et est actif
   * - Détecte automatiquement le sentiment
   * - Extrait les mots-clés du commentaire
   */
  async create(createDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    // 1. Vérifier que le site existe et est actif
    const site = await this.prisma.site.findUnique({
      where: { id: createDto.siteId },
      include: { organization: true },
    });

    if (!site) {
      throw new NotFoundException(`Site non trouvé (id: ${createDto.siteId})`);
    }

    // Vérifier le quota mensuel de feedbacks
    const org = site.organization;
    if (org && org.maxMonthlyFeedbacks) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthlyCount = await this.prisma.feedback.count({
        where: { organizationId: org.id, createdAt: { gte: startOfMonth } },
      });
      if (monthlyCount >= org.maxMonthlyFeedbacks) {
        throw new BadRequestException(
          `Quota mensuel atteint: ${monthlyCount}/${org.maxMonthlyFeedbacks} feedbacks ce mois. Passez à un plan supérieur.`,
        );
      }
    }

    if (!site.isActive) {
      throw new BadRequestException('Le site est désactivé');
    }

    // 2. Valider que l'organisation correspond
    if (site.organizationId !== createDto.organizationId) {
      throw new BadRequestException('organizationId ne correspond pas au site');
    }

    // 3. Détection automatique du sentiment
    const commentSentiment = this.detectSentiment(
      createDto.comment,
      createDto.overallRating,
    );

    // 4. Extraction des mots-clés
    const commentKeywords = createDto.comment
      ? this.extractKeywords(createDto.comment)
      : [];

    // 5. Créer le feedback
    try {
      const feedback = await this.prisma.feedback.create({
        data: this.buildFeedbackCreateData(createDto, commentSentiment, commentKeywords),
        include: {
          site: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log({
        event: 'feedback.created',
        feedbackId: feedback.id,
        organizationId: feedback.organizationId,
        siteId: feedback.siteId,
        sentiment: commentSentiment,
        channel: feedback.feedbackChannel,
      });

      this.emitFeedbackEvents(feedback, site.name, createDto.qrCode);

      return plainToInstance(FeedbackResponseDto, feedback);
    } catch (error) {
      this.logger.error({
        event: 'feedback.create.error',
        error: error.message,
      });
      throw error;
    }
  }

  private buildFeedbackCreateData(
    createDto: CreateFeedbackDto,
    commentSentiment: Sentiment,
    commentKeywords: string[],
  ) {
    return {
      organizationId: createDto.organizationId,
      siteId: createDto.siteId,
      overallRating: createDto.overallRating,
      criteriaRatings: createDto.criteriaRatings || {},
      comment: createDto.comment,
      commentSentiment,
      commentKeywords,
      userId: createDto.userId,
      isAnonymous: createDto.isAnonymous ?? false,
      respondentName: createDto.respondentName,
      respondentEmail: createDto.respondentEmail,
      respondentPhone: createDto.respondentPhone,
      serviceDate: createDto.serviceDate ? new Date(createDto.serviceDate) : null,
      feedbackChannel: createDto.feedbackChannel || 'web',
      needsResponse: createDto.needsResponse ?? false,
      ipAddress: createDto.ipAddress,
      userAgent: createDto.userAgent,
    };
  }

  private emitFeedbackEvents(
    feedback: Feedback,
    siteName: string,
    qrCode?: string,
  ): void {
    this.eventEmitter.emit(
      'feedback.created',
      new FeedbackCreatedEvent(
        feedback.id,
        feedback.organizationId,
        feedback.siteId,
        siteName,
        feedback.overallRating ?? undefined,
        feedback.comment || undefined,
        feedback.commentSentiment,
        feedback.respondentEmail || undefined,
        feedback.respondentName || undefined,
        feedback.feedbackChannel,
        feedback.needsResponse,
        qrCode,
      ),
    );

    if (
      (feedback.overallRating && feedback.overallRating <= 2) ||
      feedback.commentSentiment === 'negative'
    ) {
      this.eventEmitter.emit(
        'feedback.negative',
        new FeedbackNegativeEvent(
          feedback.id,
          feedback.organizationId,
          feedback.siteId,
          siteName,
          feedback.overallRating ?? undefined,
          feedback.comment || undefined,
          feedback.respondentEmail || undefined,
          feedback.respondentName || undefined,
        ),
      );
    }
  }

  /**
   * Récupérer tous les feedbacks
   * - Filtre par organisation/site/sentiment
   * - Pagination
   */
  async findAll(params?: {
    organizationId?: string;
    siteId?: string;
    sentiment?: string;
    minRating?: number;
    maxRating?: number;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
    includeRelations?: boolean;
  }): Promise<FeedbackResponseDto[]> {
    const {
      organizationId,
      siteId,
      sentiment,
      minRating,
      maxRating,
      startDate,
      endDate,
      skip = 0,
      take = 50,
      includeRelations = false,
    } = params || {};

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (siteId) {
      where.siteId = siteId;
    }

    if (sentiment) {
      where.commentSentiment = sentiment;
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.overallRating = {};
      if (minRating !== undefined) {
        where.overallRating.gte = minRating;
      }
      if (maxRating !== undefined) {
        where.overallRating.lte = maxRating;
      }
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: includeRelations
        ? {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          }
        : undefined,
    });

    return feedbacks.map((feedback) =>
      plainToInstance(FeedbackResponseDto, feedback),
    );
  }

  /**
   * Récupérer un feedback par ID
   */
  async findOne(id: string): Promise<FeedbackResponseDto> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback non trouvé (id: ${id})`);
    }

    return plainToInstance(FeedbackResponseDto, feedback);
  }

  /**
   * Mettre à jour un feedback (traitement simple)
   */
  async update(
    id: string,
    updateDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    // Vérifier que le feedback existe
    await this.findOne(id);

    try {
      const feedback = await this.prisma.feedback.update({
        where: { id },
        data: {
          isProcessed: updateDto.isProcessed,
          processedAt: updateDto.processedAt
            ? new Date(updateDto.processedAt)
            : undefined,
          responseSentAt: updateDto.responseSentAt
            ? new Date(updateDto.responseSentAt)
            : undefined,
          updatedAt: new Date(),
        },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log({
        event: 'feedback.updated',
        feedbackId: id,
        isProcessed: feedback.isProcessed,
      });

      // Si marqué comme traité, émettre événement
      if (updateDto.isProcessed && !updateDto.processedAt) {
        this.eventEmitter.emit(
          'feedback.processed',
          new FeedbackProcessedEvent(
            id,
            feedback.organizationId,
            feedback.siteId,
            feedback.respondentEmail || undefined,
          ),
        );
      }

      return plainToInstance(FeedbackResponseDto, feedback);
    } catch (error) {
      this.logger.error({
        event: 'feedback.update.error',
        feedbackId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Supprimer un feedback (physique)
   * Note: Rarement utilisé
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que le feedback existe
    await this.findOne(id);

    try {
      await this.prisma.feedback.delete({
        where: { id },
      });

      this.logger.warn({
        event: 'feedback.deleted',
        feedbackId: id,
      });

      return { message: 'Feedback supprimé avec succès' };
    } catch (error) {
      this.logger.error({
        event: 'feedback.delete.error',
        feedbackId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Statistiques globales
   */
  async getStats(params: {
    organizationId?: string;
    siteId?: string;
    period?: string;
  }) {
    const { organizationId, siteId, period = '30d' } = params;

    // Calculer la date de début selon la période
    const startDate = this.getStartDateFromPeriod(period);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (siteId) {
      where.siteId = siteId;
    }

    const [total, bySentiment, avgRating, totalWithResponse, unprocessed, needsResponse] =
      await Promise.all([
        this.prisma.feedback.count({ where }),
        this.prisma.feedback.groupBy({ by: ['commentSentiment'], where, _count: true }),
        this.prisma.feedback.aggregate({ where: { ...where, overallRating: { not: null } }, _avg: { overallRating: true } }),
        this.prisma.feedback.count({ where: { ...where, responseSentAt: { not: null } } }),
        this.prisma.feedback.count({ where: { ...where, isProcessed: false } }),
        this.prisma.feedback.count({ where: { ...where, needsResponse: true, responseSentAt: null } }),
      ]);

    return {
      period,
      total,
      bySentiment: bySentiment.reduce((acc, item) => {
        acc[item.commentSentiment] = item._count;
        return acc;
      }, {} as Record<string, number>),
      averageRating: avgRating._avg.overallRating
        ? Math.round(avgRating._avg.overallRating * 10) / 10
        : null,
      responseRate: total > 0 ? Math.round((totalWithResponse / total) * 1000) / 10 : 0,
      unprocessed,
      needsResponse,
    };
  }

  // ===========================
  // HELPERS PRIVÉS
  // ===========================

  /**
   * Détection du sentiment depuis le commentaire + rating
   */
  private detectSentiment(comment?: string, rating?: number): Sentiment {
    // 1. Si rating fourni, priorité au rating
    if (rating) {
      if (rating >= 4) return Sentiment.positive;
      if (rating <= 2) return Sentiment.negative;
      return Sentiment.neutral;
    }

    // 2. Sinon analyse du commentaire
    if (!comment) {
      return Sentiment.unknown;
    }

    const lowerComment = comment.toLowerCase();

    // Mots positifs (français)
    const positiveWords = [
      'excellent',
      'parfait',
      'super',
      'génial',
      'bravo',
      'merci',
      'satisfait',
      'content',
      'rapide',
      'professionnel',
      'bon',
      'bien',
      'agréable',
      'efficace',
      'formidable',
    ];

    // Mots négatifs
    const negativeWords = [
      'mauvais',
      'nul',
      'horrible',
      'déçu',
      'lent',
      'incompétent',
      'problème',
      'erreur',
      'jamais',
      'pire',
      'attendre',
      'retard',
      'médiocre',
      'insatisfait',
    ];

    const positiveCount = positiveWords.filter((word) =>
      lowerComment.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerComment.includes(word),
    ).length;

    if (positiveCount > negativeCount) {
      return Sentiment.positive;
    } else if (negativeCount > positiveCount) {
      return Sentiment.negative;
    } else {
      return Sentiment.neutral;
    }
  }

  async getTimeseries(params: {
    organizationId?: string;
    siteId?: string;
    days?: number;
  }) {
    const { organizationId, siteId, days = 30 } = params;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: any = { createdAt: { gte: startDate } };
    if (organizationId) where.organizationId = organizationId;
    if (siteId) where.siteId = siteId;

    const feedbacks = await this.prisma.feedback.findMany({
      where,
      select: { createdAt: true, commentSentiment: true },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par jour
    const byDay = new Map<string, { count: number; positive: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split('T')[0];
      byDay.set(key, { count: 0, positive: 0 });
    }

    for (const fb of feedbacks) {
      const key = fb.createdAt.toISOString().split('T')[0];
      if (byDay.has(key)) {
        const entry = byDay.get(key)!;
        entry.count++;
        if (fb.commentSentiment === 'positive') entry.positive++;
      }
    }

    return Array.from(byDay.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      positive: data.positive,
      satisfactionRate: data.count > 0 ? Math.round((data.positive / data.count) * 100) : 0,
    }));
  }

  /**
   * Extraction basique de mots-clés
   */
  private extractKeywords(comment: string): string[] {
    const words = comment
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4); // Mots de plus de 4 lettres

    // Supprimer les doublons
    return Array.from(new Set(words)).slice(0, 10); // Max 10 mots-clés
  }

  /**
   * Date de début selon la période
   */
  private getStartDateFromPeriod(period: string): Date {
    const { DAYS_IN_WEEK, DAYS_IN_MONTH, DAYS_IN_QUARTER, MS_PER_DAY } = FeedbackService;

    switch (period) {
      case '7d':
        return new Date(Date.now() - DAYS_IN_WEEK * MS_PER_DAY);
      case '30d':
        return new Date(Date.now() - DAYS_IN_MONTH * MS_PER_DAY);
      case '90d':
        return new Date(Date.now() - DAYS_IN_QUARTER * MS_PER_DAY);
      case '1y': {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      default:
        return new Date(Date.now() - DAYS_IN_MONTH * MS_PER_DAY);
    }
  }
}
