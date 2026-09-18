import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto, FeedbackStatus } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { plainToInstance } from 'class-transformer';
import { Sentiment } from '@prisma/client';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau feedback
   * - Vérifie que le site existe
   * - Détecte automatiquement le sentiment si non fourni
   * - Statut initial: NEW
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

    // 3. Détection automatique du sentiment si non fourni
    let sentiment = createDto.sentiment;
    if (!sentiment && createDto.message) {
      sentiment = this.detectSentiment(createDto.message, createDto.rating);
    } else if (!sentiment && createDto.rating) {
      sentiment = this.getSentimentFromRating(createDto.rating);
    } else {
      sentiment = Sentiment.unknown;
    }

    // 4. Créer le feedback
    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          ...createDto,
          sentiment,
          status: FeedbackStatus.NEW,
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

      this.logger.log(
        `Feedback créé: ${feedback.id} - Site: ${createDto.siteId} - Sentiment: ${sentiment}`,
      );

      return plainToInstance(FeedbackResponseDto, feedback);
    } catch (error) {
      this.logger.error(`Erreur création feedback: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer tous les feedbacks
   * - Filtre par organisation/site/sentiment/statut
   * - Pagination
   * - Inclut les relations
   */
  async findAll(params?: {
    organizationId?: string;
    siteId?: string;
    sentiment?: string;
    status?: string;
    rating?: number;
    skip?: number;
    take?: number;
    includeRelations?: boolean;
  }): Promise<FeedbackResponseDto[]> {
    const {
      organizationId,
      siteId,
      sentiment,
      status,
      rating,
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
      where.sentiment = sentiment;
    }

    if (status) {
      where.status = status;
    }

    if (rating !== undefined) {
      where.rating = rating;
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
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          }
        : undefined,
    });

    return feedbacks.map((feedback) => plainToInstance(FeedbackResponseDto, feedback));
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
        assignedTo: {
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
   * Mettre à jour un feedback (traitement)
   */
  async update(id: string, updateDto: UpdateFeedbackDto): Promise<FeedbackResponseDto> {
    // Vérifier que le feedback existe
    await this.findOne(id);

    // Si on ajoute une réponse, marquer respondedAt
    const data: any = { ...updateDto };
    if (updateDto.responseMessage && !data.respondedAt) {
      data.respondedAt = new Date();
    }

    // Si on change le statut en RESOLVED ou CLOSED, on peut auto-marquer respondedAt
    if (
      (updateDto.status === FeedbackStatus.RESOLVED ||
        updateDto.status === FeedbackStatus.CLOSED) &&
      !data.respondedAt
    ) {
      data.respondedAt = new Date();
    }

    try {
      const feedback = await this.prisma.feedback.update({
        where: { id },
        data: {
          ...data,
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
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(`Feedback mis à jour: ${id} - Statut: ${feedback.status}`);

      return plainToInstance(FeedbackResponseDto, feedback);
    } catch (error) {
      this.logger.error(`Erreur mise à jour feedback: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assigner un feedback à un utilisateur
   */
  async assign(id: string, userId: string): Promise<FeedbackResponseDto> {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur non trouvé (id: ${userId})`);
    }

    return this.update(id, {
      assignedToId: userId,
      status: FeedbackStatus.ASSIGNED,
    });
  }

  /**
   * Supprimer un feedback (physique)
   * Note: Rarement utilisé, préférer archiver ou fermer
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que le feedback existe
    await this.findOne(id);

    try {
      await this.prisma.feedback.delete({
        where: { id },
      });

      this.logger.warn(`Feedback supprimé: ${id}`);

      return { message: 'Feedback supprimé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur suppression feedback: ${error.message}`);
      throw error;
    }
  }

  /**
   * Statistiques globales
   */
  async getStats(params: { organizationId?: string; siteId?: string; period?: string }) {
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
      by: ['sentiment'],
      where,
      _count: true,
    });

    // Par statut
    const byStatus = await this.prisma.feedback.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    // Note moyenne
    const avgRating = await this.prisma.feedback.aggregate({
      where: {
        ...where,
        rating: { not: null },
      },
      _avg: { rating: true },
    });

    // Temps moyen de réponse
    const responseTimeResult = await this.prisma.feedback.aggregate({
      where: {
        ...where,
        respondedAt: { not: null },
      },
      _avg: {
        // TODO: Calculer la différence entre createdAt et respondedAt
      },
    });

    return {
      period,
      total,
      bySentiment: bySentiment.reduce((acc, item) => {
        acc[item.sentiment] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      averageRating: avgRating._avg.rating
        ? Math.round(avgRating._avg.rating * 10) / 10
        : null,
    };
  }

  // ===========================
  // HELPERS PRIVÉS
  // ===========================

  /**
   * Détection basique du sentiment depuis le message
   * Note: Version simple, pourrait être améliorée avec IA
   */
  private detectSentiment(message: string, rating?: number): Sentiment {
    if (rating) {
      return this.getSentimentFromRating(rating);
    }

    const lowerMessage = message.toLowerCase();

    // Mots positifs
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
    ];

    const positiveCount = positiveWords.filter((word) => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter((word) => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) {
      return Sentiment.positive;
    } else if (negativeCount > positiveCount) {
      return Sentiment.negative;
    } else {
      return Sentiment.neutral;
    }
  }

  /**
   * Sentiment depuis la note
   */
  private getSentimentFromRating(rating: number): Sentiment {
    if (rating >= 4) return Sentiment.positive;
    if (rating <= 2) return Sentiment.negative;
    return Sentiment.neutral;
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
