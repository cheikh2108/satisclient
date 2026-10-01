import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurveyDto, SurveyType } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { SurveyResponseDto, SurveyResponseItemDto } from './dto/survey-response.dto';
import {
  SurveyAnalyticsDto,
  NPSAnalytics,
  CSATAnalytics,
  CESAnalytics,
} from './dto/survey-analytics.dto';
import { plainToInstance } from 'class-transformer';
import { Question, QuestionType } from './entities/question.entity';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un questionnaire
   */
  async create(createDto: CreateSurveyDto, userId?: string): Promise<SurveyResponseDto> {
    // Valider les questions
    this.validateQuestions(createDto.questions);

    const surveyType = createDto.surveyType || SurveyType.ONE_TIME;
    if (surveyType === SurveyType.CONTINUOUS && createDto.campaignPackId) {
      throw new BadRequestException(
        "Une enquête continue est couverte par l'abonnement et ne peut pas utiliser un pack campagne",
      );
    }
    if (surveyType !== SurveyType.CONTINUOUS && !createDto.campaignPackId) {
      throw new BadRequestException(
        'Un crédit campagne est requis pour une enquête ponctuelle ou récurrente',
      );
    }

    // Vérifier que les sites existent
    if (createDto.targetSiteIds.length > 0) {
      const sites = await this.prisma.site.findMany({
        where: {
          id: { in: createDto.targetSiteIds },
          organizationId: createDto.organizationId,
        },
      });

      if (sites.length !== createDto.targetSiteIds.length) {
        throw new BadRequestException('Certains sites sont invalides');
      }
    }

    const survey = await this.prisma.$transaction(async (tx) => {
      if (createDto.campaignPackId) {
        const pack = await tx.campaignPack.findFirst({
          where: {
            id: createDto.campaignPackId,
            organizationId: createDto.organizationId,
            remaining: { gt: 0 },
            expiresAt: { gt: new Date() },
          },
        });
        if (!pack) throw new ForbiddenException('Aucun crédit de campagne disponible');

        const consumed = await tx.campaignPack.updateMany({
          where: { id: pack.id, remaining: { gt: 0 }, expiresAt: { gt: new Date() } },
          data: { remaining: { decrement: 1 } },
        });
        if (consumed.count !== 1) throw new ForbiddenException('Crédit de campagne déjà utilisé');
      }

      return tx.survey.create({
        data: {
          organizationId: createDto.organizationId,
          campaignPackId: createDto.campaignPackId,
          title: createDto.title,
          description: createDto.description,
          questions: createDto.questions as any,
          targetSiteIds: createDto.targetSiteIds,
          surveyType,
          startDate: createDto.startDate ? new Date(createDto.startDate) : null,
          endDate: createDto.endDate ? new Date(createDto.endDate) : null,
          settings: (createDto.settings || {}) as any,
          createdBy: userId,
        },
        include: {
          organization: { select: { id: true, name: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });

    this.logger.log({
      event: 'survey.created',
      surveyId: survey.id,
      title: survey.title,
      questionsCount: createDto.questions.length,
    });

    return plainToInstance(SurveyResponseDto, survey);
  }

  /**
   * Liste des questionnaires
   */
  async findAll(params?: {
    organizationId?: string;
    isActive?: boolean;
    surveyType?: string;
    skip?: number;
    take?: number;
  }): Promise<SurveyResponseDto[]> {
    const { organizationId, isActive, surveyType, skip = 0, take = 50 } = params || {};

    const where: any = {};

    if (organizationId) where.organizationId = organizationId;
    if (isActive !== undefined) where.isActive = isActive;
    if (surveyType) where.surveyType = surveyType;

    const surveys = await this.prisma.survey.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return surveys.map((s) => plainToInstance(SurveyResponseDto, s));
  }

  async getPublicSurvey(id: string, qrCode?: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            primaryColor: true,
            welcomeMessage: true,
            subscriptionStatus: true,
          },
        },
        campaignPack: {
          select: { remaining: true, expiresAt: true },
        },
      },
    });

    if (!survey) throw new NotFoundException('Questionnaire non trouvé');
    if (!survey.isActive) throw new BadRequestException('Questionnaire inactif');
    const campaignIsValid = Boolean(
      survey.campaignPack && survey.campaignPack.expiresAt > new Date(),
    );
    if (
      survey.organization.subscriptionStatus === 'suspended' ||
      (survey.organization.subscriptionStatus === 'expired' && !campaignIsValid)
    ) {
      throw new BadRequestException("Ce questionnaire n'est plus disponible");
    }

    const now = new Date();
    if (survey.startDate && survey.startDate > now) {
      throw new BadRequestException("Le questionnaire n'a pas encore commencé");
    }
    if (survey.endDate && survey.endDate < now) {
      throw new BadRequestException('Le questionnaire est terminé');
    }

    let siteId = survey.targetSiteIds[0] || null;
    if (qrCode) {
      const qr = await this.prisma.qrCode.findFirst({ where: { code: qrCode } });
      if (!qr || !qr.isActive || qr.targetType !== 'survey' || qr.targetId !== survey.id) {
        throw new BadRequestException('QR code non valide pour ce questionnaire');
      }
      if (qr.expiresAt && qr.expiresAt < now) throw new BadRequestException('Ce QR code a expiré');
      if (qr.organizationId !== survey.organizationId) {
        throw new BadRequestException('QR code non valide pour cette organisation');
      }
      siteId = qr.siteId || siteId;
    }

    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
      organizationId: survey.organizationId,
      organizationName: survey.organization.name,
      logoUrl: survey.organization.logoUrl,
      primaryColor: survey.organization.primaryColor || '#3a5a40',
      welcomeMessage: survey.organization.welcomeMessage,
      siteId,
      settings: survey.settings,
    };
  }

  /**
   * Récupérer un questionnaire
   */
  async findOne(id: string): Promise<SurveyResponseDto> {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException(`Questionnaire non trouvé (id: ${id})`);
    }

    return plainToInstance(SurveyResponseDto, survey);
  }

  /**
   * Mettre à jour un questionnaire
   */
  async update(id: string, updateDto: UpdateSurveyDto): Promise<SurveyResponseDto> {
    await this.findOne(id);

    if (updateDto.questions) {
      this.validateQuestions(updateDto.questions);
    }

    const dataToUpdate: any = {
      updatedAt: new Date(),
    };

    if (updateDto.title !== undefined) dataToUpdate.title = updateDto.title;
    if (updateDto.description !== undefined) dataToUpdate.description = updateDto.description;
    if (updateDto.questions !== undefined) dataToUpdate.questions = updateDto.questions as any;
    if (updateDto.targetSiteIds !== undefined) dataToUpdate.targetSiteIds = updateDto.targetSiteIds;
    if (updateDto.surveyType !== undefined) dataToUpdate.surveyType = updateDto.surveyType;
    if (updateDto.isActive !== undefined) dataToUpdate.isActive = updateDto.isActive;
    if (updateDto.startDate !== undefined)
      dataToUpdate.startDate = updateDto.startDate ? new Date(updateDto.startDate) : null;
    if (updateDto.endDate !== undefined)
      dataToUpdate.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    if (updateDto.settings !== undefined) dataToUpdate.settings = updateDto.settings as any;

    const updated = await this.prisma.survey.update({
      where: { id },
      data: dataToUpdate,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'survey.updated',
      surveyId: id,
    });

    return plainToInstance(SurveyResponseDto, updated);
  }

  /**
   * Supprimer un questionnaire
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.survey.delete({
      where: { id },
    });

    this.logger.warn({
      event: 'survey.deleted',
      surveyId: id,
    });

    return { message: 'Questionnaire supprimé avec succès' };
  }

  /**
   * Soumettre une réponse
   */
  async submitResponse(createDto: CreateSurveyResponseDto): Promise<SurveyResponseItemDto> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: createDto.surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Questionnaire non trouvé');
    }

    if (createDto.organizationId !== survey.organizationId) {
      throw new BadRequestException('Organisation invalide pour ce questionnaire');
    }

    if (createDto.siteId && !survey.targetSiteIds.includes(createDto.siteId)) {
      throw new BadRequestException('Établissement non ciblé par ce questionnaire');
    }

    if (!survey.isActive) {
      throw new BadRequestException('Questionnaire inactif');
    }

    // Vérifier dates
    const now = new Date();
    if (survey.startDate && survey.startDate > now) {
      throw new BadRequestException("Le questionnaire n'a pas encore commencé");
    }
    if (survey.endDate && survey.endDate < now) {
      throw new BadRequestException('Le questionnaire est terminé');
    }

    // Vérifier limite réponses par user
    if (createDto.userId && (survey.settings as any)?.maxResponsesPerUser) {
      const existingCount = await this.prisma.surveyResponse.count({
        where: {
          surveyId: createDto.surveyId,
          userId: createDto.userId,
        },
      });

      if (existingCount >= (survey.settings as any).maxResponsesPerUser) {
        throw new ForbiddenException(
          'Vous avez atteint la limite de réponses pour ce questionnaire',
        );
      }
    }

    // Valider réponses
    this.validateAnswers(survey.questions as unknown as Question[], createDto.answers);

    // Créer réponse
    const response = await this.prisma.surveyResponse.create({
      data: {
        surveyId: createDto.surveyId,
        organizationId: createDto.organizationId,
        siteId: createDto.siteId,
        userId: createDto.userId,
        isAnonymous: createDto.isAnonymous || false,
        respondentEmail: createDto.respondentEmail,
        answers: createDto.answers,
        completionTimeSeconds: createDto.completionTimeSeconds,
        ipAddress: createDto.ipAddress,
        userAgent: createDto.userAgent,
        isCompleted: true,
      },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
          },
        },
        site: {
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
            email: true,
          },
        },
      },
    });

    // Mettre à jour stats du survey
    await this.updateSurveyStats(createDto.surveyId);

    this.logger.log({
      event: 'survey_response.submitted',
      surveyId: createDto.surveyId,
      responseId: response.id,
      completionTime: createDto.completionTimeSeconds,
    });

    return plainToInstance(SurveyResponseItemDto, response);
  }

  /**
   * Récupérer réponses d'un questionnaire
   */
  async getResponses(
    surveyId: string,
    params?: {
      skip?: number;
      take?: number;
      siteId?: string;
    },
  ): Promise<SurveyResponseItemDto[]> {
    const { skip = 0, take = 50, siteId } = params || {};

    const where: any = { surveyId };
    if (siteId) where.siteId = siteId;

    const responses = await this.prisma.surveyResponse.findMany({
      where,
      skip,
      take,
      orderBy: { submittedAt: 'desc' },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
          },
        },
        site: {
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
            email: true,
          },
        },
      },
    });

    return responses.map((r) => plainToInstance(SurveyResponseItemDto, r));
  }

  /**
   * Analytics d'un questionnaire
   */
  async getAnalytics(surveyId: string): Promise<SurveyAnalyticsDto> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Questionnaire non trouvé');
    }

    const responses = await this.prisma.surveyResponse.findMany({
      where: { surveyId, isCompleted: true },
    });

    const totalResponses = responses.length;
    const completedResponses = responses.filter((r) => r.isCompleted).length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    const avgCompletionTime =
      responses.length > 0
        ? responses.reduce((sum, r) => sum + (r.completionTimeSeconds || 0), 0) / responses.length
        : 0;

    const questions = survey.questions as unknown as Question[];

    // Analytics par type de question
    let nps: NPSAnalytics | undefined;
    let csat: CSATAnalytics | undefined;
    let ces: CESAnalytics | undefined;

    const npsQuestion = questions.find((q) => q.type === QuestionType.NPS);
    if (npsQuestion) {
      nps = this.calculateNPS(responses, npsQuestion.id);
    }

    const csatQuestion = questions.find((q) => q.type === QuestionType.CSAT);
    if (csatQuestion) {
      csat = this.calculateCSAT(responses, csatQuestion.id);
    }

    const cesQuestion = questions.find((q) => q.type === QuestionType.CES);
    if (cesQuestion) {
      ces = this.calculateCES(responses, cesQuestion.id);
    }

    // Analytics par question
    const questionAnalytics: Record<string, any> = {};
    for (const question of questions) {
      questionAnalytics[question.id] = this.calculateQuestionAnalytics(question, responses);
    }

    return {
      surveyId,
      title: survey.title,
      totalResponses,
      completedResponses,
      completionRate: Math.round(completionRate * 100) / 100,
      avgCompletionTime: Math.round(avgCompletionTime),
      nps,
      csat,
      ces,
      questionAnalytics,
      startDate: survey.startDate || undefined,
      endDate: survey.endDate || undefined,
    };
  }

  /**
   * Calculer NPS
   */
  private calculateNPS(responses: any[], questionId: string): NPSAnalytics {
    const npsResponses = responses
      .map((r) => r.answers[questionId])
      .filter((v) => v !== undefined && v !== null);

    const totalResponses = npsResponses.length;
    if (totalResponses === 0) {
      return {
        score: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        totalResponses: 0,
      };
    }

    const promoters = npsResponses.filter((v) => v >= 9).length;
    const passives = npsResponses.filter((v) => v >= 7 && v <= 8).length;
    const detractors = npsResponses.filter((v) => v <= 6).length;

    const promotersPct = (promoters / totalResponses) * 100;
    const detractorsPct = (detractors / totalResponses) * 100;
    const score = Math.round(promotersPct - detractorsPct);

    return {
      score,
      promoters,
      passives,
      detractors,
      totalResponses,
    };
  }

  /**
   * Calculer CSAT
   */
  private calculateCSAT(responses: any[], questionId: string): CSATAnalytics {
    const csatResponses = responses
      .map((r) => r.answers[questionId])
      .filter((v) => v !== undefined && v !== null);

    const totalResponses = csatResponses.length;
    if (totalResponses === 0) {
      return {
        averageScore: 0,
        satisfiedPercentage: 0,
        totalResponses: 0,
        distribution: {},
      };
    }

    const sum = csatResponses.reduce((acc, v) => acc + Number(v), 0);
    const averageScore = sum / totalResponses;

    const satisfied = csatResponses.filter((v) => v >= 4).length;
    const satisfiedPercentage = (satisfied / totalResponses) * 100;

    const distribution: Record<string, number> = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i.toString()] = csatResponses.filter((v) => v === i).length;
    }

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      satisfiedPercentage: Math.round(satisfiedPercentage * 100) / 100,
      totalResponses,
      distribution,
    };
  }

  /**
   * Calculer CES
   */
  private calculateCES(responses: any[], questionId: string): CESAnalytics {
    const cesResponses = responses
      .map((r) => r.answers[questionId])
      .filter((v) => v !== undefined && v !== null);

    const totalResponses = cesResponses.length;
    if (totalResponses === 0) {
      return {
        averageScore: 0,
        lowEffortPercentage: 0,
        totalResponses: 0,
      };
    }

    const sum = cesResponses.reduce((acc, v) => acc + Number(v), 0);
    const averageScore = sum / totalResponses;

    const lowEffort = cesResponses.filter((v) => v <= 3).length;
    const lowEffortPercentage = (lowEffort / totalResponses) * 100;

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      lowEffortPercentage: Math.round(lowEffortPercentage * 100) / 100,
      totalResponses,
    };
  }

  /**
   * Analytics par question
   */
  private calculateQuestionAnalytics(question: Question, responses: any[]): any {
    const answers = responses
      .map((r) => r.answers[question.id])
      .filter((v) => v !== undefined && v !== null);

    const totalResponses = answers.length;

    if (totalResponses === 0) {
      return { type: question.type, totalResponses: 0 };
    }

    switch (question.type) {
      case QuestionType.SCALE:
      case QuestionType.RATING:
      case QuestionType.NPS:
      case QuestionType.CSAT:
      case QuestionType.CES:
        const sum = answers.reduce((acc, v) => acc + Number(v), 0);
        const avgScore = sum / totalResponses;
        const distribution: Record<string, number> = {};
        answers.forEach((v) => {
          const key = v.toString();
          distribution[key] = (distribution[key] || 0) + 1;
        });
        return {
          type: question.type,
          avgScore: Math.round(avgScore * 100) / 100,
          distribution,
          totalResponses,
        };

      case QuestionType.SINGLE_CHOICE:
      case QuestionType.YES_NO:
        const singleDistribution: Record<string, number> = {};
        answers.forEach((v) => {
          const key = v.toString();
          singleDistribution[key] = (singleDistribution[key] || 0) + 1;
        });
        return {
          type: question.type,
          distribution: singleDistribution,
          totalResponses,
        };

      case QuestionType.MULTIPLE_CHOICE:
        const multiDistribution: Record<string, number> = {};
        answers.forEach((v) => {
          if (Array.isArray(v)) {
            v.forEach((option) => {
              const key = option.toString();
              multiDistribution[key] = (multiDistribution[key] || 0) + 1;
            });
          }
        });
        return {
          type: question.type,
          distribution: multiDistribution,
          totalResponses,
        };

      case QuestionType.TEXT:
      case QuestionType.EMAIL:
      case QuestionType.PHONE:
      case QuestionType.DATE:
        return {
          type: question.type,
          totalResponses,
        };

      default:
        return {
          type: question.type,
          totalResponses,
        };
    }
  }

  /**
   * Valider les questions
   */
  private validateQuestions(questions: Question[]): void {
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Au moins une question est requise');
    }

    const questionIds = new Set<string>();
    for (const question of questions) {
      if (questionIds.has(question.id)) {
        throw new BadRequestException(`ID de question en double: ${question.id}`);
      }
      questionIds.add(question.id);

      if (
        question.type === QuestionType.SINGLE_CHOICE ||
        question.type === QuestionType.MULTIPLE_CHOICE
      ) {
        if (!question.options || question.options.length < 2) {
          throw new BadRequestException(
            `La question "${question.title}" nécessite au moins 2 options`,
          );
        }
      }
    }
  }

  /**
   * Valider les réponses
   */
  private validateAnswers(questions: Question[], answers: Record<string, any>): void {
    for (const question of questions) {
      if (question.required && !(question.id in answers)) {
        throw new BadRequestException(`Réponse requise pour: ${question.title}`);
      }

      if (question.id in answers) {
        const answer = answers[question.id];

        if (question.type === QuestionType.MULTIPLE_CHOICE) {
          if (!Array.isArray(answer)) {
            throw new BadRequestException(
              `Réponse invalide pour: ${question.title} (array attendu)`,
            );
          }
        }

        if (question.type === QuestionType.NPS || question.type === QuestionType.SCALE) {
          const min = question.config?.min || 0;
          const max = question.config?.max || 10;
          if (answer < min || answer > max) {
            throw new BadRequestException(
              `Réponse invalide pour: ${question.title} (${min}-${max})`,
            );
          }
        }
      }
    }
  }

  /**
   * Mettre à jour stats du survey
   */
  private async updateSurveyStats(surveyId: string): Promise<void> {
    const [totalResponses, avgTime] = await Promise.all([
      this.prisma.surveyResponse.count({
        where: { surveyId, isCompleted: true },
      }),
      this.prisma.surveyResponse.aggregate({
        where: { surveyId, isCompleted: true, completionTimeSeconds: { not: null } },
        _avg: { completionTimeSeconds: true },
      }),
    ]);

    await this.prisma.survey.update({
      where: { id: surveyId },
      data: {
        totalResponses,
        avgCompletionTime: avgTime._avg.completionTimeSeconds
          ? Math.round(avgTime._avg.completionTimeSeconds)
          : null,
      },
    });
  }
}
