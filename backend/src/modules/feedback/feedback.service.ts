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
import { Sentiment } from '@prisma/client';

@Injectable()
export class FeedbackService {
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
        data: {
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
          serviceDate: createDto.serviceDate
            ? new Date(createDto.serviceDate)
            : null,
          feedbackChannel: createDto.feedbackChannel || 'web',
          needsResponse: createDto.needsResponse ?? false,
          ipAddress: createDto.ipAddress,
          userAgent: createDto.userAgent,
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
        event: 'feedback.created',
        feedbackId: feedback.id,
        organizationId: feedback.organizationId,
        siteId: feedback.siteId,
        sentiment: commentSentiment,
        channel: feedback.feedbackChannel,
      });

      // Émettre événement feedback.created
      this.eventEmitter.emit(
        'feedback.created',
        new FeedbackCreatedEvent(
          feedback.id,
          feedback.organizationId,
          feedback.siteId,
          site.name,
          feedback.overallRating,
          feedback.comment,
          feedback.commentSentiment,
          feedback.respondentEmail,
          feedback.respondentName,
          feedback.feedbackChannel,
          feedback.needsResponse,
          createDto.qrCode,
        ),
      );

      // Si feedback négatif, émettre événement spécifique
      if (
        (feedback.overallRating && feedback.overallRating <= 2) ||
        commentSentiment === 'negative'
      ) {
        this.eventEmitter.emit(
          'feedback.negative',
          new FeedbackNegativeEvent(
            feedback.id,
            feedback.organizationId,
            feedback.siteId,
            site.name,
            feedback.overallRating,
            feedback.comment,
            feedback.respondentEmail,
            feedback.respondentName,
          ),
        );
      }

      return plainToInstance(FeedbackResponseDto, feedback);
    } catch (error) {
      this.logger.error({
        event: 'feedback.create.error',
        error: error.message,
      });
      throw error;
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
            feedback.respondentEmail,
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

    // Total feedbacks
    const total = await this.prisma.feedback.count({ where });

    // Par sentiment
    const bySentiment = await this.prisma.feedback.groupBy({
      by: ['commentSentiment'],
      where,
      _count: true,
    });

    // Note moyenne
    const avgRating = await this.prisma.feedback.aggregate({
      where: {
        ...where,
        overallRating: { not: null },
      },
      _avg: { overallRating: true },
    });

    // Taux de réponse
    const totalWithResponse = await this.prisma.feedback.count({
      where: {
        ...where,
        responseSentAt: { not: null },
      },
    });

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
      responseRate: total > 0 ? Math.round((totalWithResponse / total) * 100) / 100 : 0,
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
    const now = new Date();

    switch (period) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }
}
