import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { SuggestionResponseDto } from './dto/suggestion-response.dto';
import { VoteSuggestionDto, VoteType } from './dto/vote-suggestion.dto';
import { plainToInstance } from 'class-transformer';
import { SuggestionStatus } from '@prisma/client';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une suggestion
   */
  async create(createDto: CreateSuggestionDto): Promise<SuggestionResponseDto> {
    const site = await this.prisma.site.findUnique({
      where: { id: createDto.siteId },
    });

    if (!site) {
      throw new NotFoundException('Site non trouvé');
    }

    if (site.organizationId !== createDto.organizationId) {
      throw new BadRequestException('organizationId ne correspond pas au site');
    }

    const suggestion = await this.prisma.suggestion.create({
      data: {
        organizationId: createDto.organizationId,
        siteId: createDto.siteId,
        title: createDto.title,
        description: createDto.description,
        category: createDto.category,
        expectedImpact: createDto.expectedImpact,
        submittedBy: createDto.submittedBy,
        submitterName: createDto.submitterName,
        submitterEmail: createDto.submitterEmail,
        isAnonymous: createDto.isAnonymous || false,
        status: SuggestionStatus.submitted,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'suggestion.created',
      suggestionId: suggestion.id,
      title: suggestion.title,
      category: suggestion.category,
    });

    return plainToInstance(SuggestionResponseDto, suggestion);
  }

  /**
   * Liste des suggestions
   */
  async findAll(params?: {
    organizationId?: string;
    siteId?: string;
    status?: SuggestionStatus;
    category?: string;
    submittedBy?: string;
    skip?: number;
    take?: number;
    sortBy?: 'recent' | 'popular' | 'score';
  }): Promise<SuggestionResponseDto[]> {
    const {
      organizationId,
      siteId,
      status,
      category,
      submittedBy,
      skip = 0,
      take = 50,
      sortBy = 'recent',
    } = params || {};

    const where: any = { deletedAt: null };

    if (organizationId) where.organizationId = organizationId;
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    if (category) where.category = category;
    if (submittedBy) where.submittedBy = submittedBy;

    let orderBy: any;
    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' };
        break;
      case 'score':
        // Pas de tri direct sur score calculé, on trie par upvotes
        orderBy = { upvotes: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const suggestions = await this.prisma.suggestion.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return suggestions.map((s) => plainToInstance(SuggestionResponseDto, s));
  }

  /**
   * Récupérer une suggestion
   */
  async findOne(id: string): Promise<SuggestionResponseDto> {
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!suggestion || suggestion.deletedAt) {
      throw new NotFoundException(`Suggestion non trouvée (id: ${id})`);
    }

    return plainToInstance(SuggestionResponseDto, suggestion);
  }

  /**
   * Mettre à jour une suggestion
   */
  async update(
    id: string,
    updateDto: UpdateSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    await this.findOne(id);

    // Valider transitions de statut
    if (updateDto.status) {
      await this.validateStatusTransition(id, updateDto.status);
    }

    const updated = await this.prisma.suggestion.update({
      where: { id },
      data: {
        ...updateDto,
        implementedAt:
          updateDto.status === SuggestionStatus.implemented
            ? new Date()
            : undefined,
        updatedAt: new Date(),
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'suggestion.updated',
      suggestionId: id,
      status: updated.status,
    });

    return plainToInstance(SuggestionResponseDto, updated);
  }

  /**
   * Assigner une suggestion
   */
  async assign(id: string, userId: string): Promise<SuggestionResponseDto> {
    const suggestion = await this.findOne(id);

    // Vérifier que le user existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updated = await this.prisma.suggestion.update({
      where: { id },
      data: {
        assignedTo: userId,
        assignedAt: new Date(),
        status:
          suggestion.status === SuggestionStatus.submitted
            ? SuggestionStatus.reviewing
            : suggestion.status,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'suggestion.assigned',
      suggestionId: id,
      assignedTo: userId,
    });

    return plainToInstance(SuggestionResponseDto, updated);
  }

  /**
   * Voter pour une suggestion
   */
  async vote(id: string, voteDto: VoteSuggestionDto): Promise<SuggestionResponseDto> {
    await this.findOne(id);

    const fieldToIncrement = voteDto.voteType === VoteType.UPVOTE ? 'upvotes' : 'downvotes';

    const updated = await this.prisma.suggestion.update({
      where: { id },
      data: {
        [fieldToIncrement]: { increment: 1 },
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'suggestion.voted',
      suggestionId: id,
      voteType: voteDto.voteType,
      userId: voteDto.userId,
    });

    return plainToInstance(SuggestionResponseDto, updated);
  }

  /**
   * Marquer comme implémenté
   */
  async markAsImplemented(
    id: string,
    notes?: string,
    proofUrls?: string[],
  ): Promise<SuggestionResponseDto> {
    const suggestion = await this.findOne(id);

    if (suggestion.status === SuggestionStatus.implemented) {
      throw new BadRequestException('Suggestion déjà implémentée');
    }

    if (![SuggestionStatus.approved, SuggestionStatus.in_progress].includes(suggestion.status)) {
      throw new BadRequestException(
        'La suggestion doit être approuvée ou en cours pour être implémentée',
      );
    }

    const updated = await this.prisma.suggestion.update({
      where: { id },
      data: {
        status: SuggestionStatus.implemented,
        implementedAt: new Date(),
        implementationNotes: notes,
        implementationProofUrls: proofUrls || [],
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log({
      event: 'suggestion.implemented',
      suggestionId: id,
    });

    return plainToInstance(SuggestionResponseDto, updated);
  }

  /**
   * Supprimer une suggestion (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.suggestion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.warn({
      event: 'suggestion.deleted',
      suggestionId: id,
    });

    return { message: 'Suggestion supprimée avec succès' };
  }

  /**
   * Statistiques
   */
  async getStats(params: {
    organizationId?: string;
    siteId?: string;
  }): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Array<{ category: string; count: number }>;
    totalVotes: number;
    topSuggestions: Array<{
      id: string;
      title: string;
      score: number;
      status: string;
    }>;
    implementationRate: number;
  }> {
    const where: any = { deletedAt: null };
    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.siteId) where.siteId = params.siteId;

    const [total, suggestions] = await Promise.all([
      this.prisma.suggestion.count({ where }),
      this.prisma.suggestion.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          upvotes: true,
          downvotes: true,
        },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    let totalVotes = 0;

    suggestions.forEach((s) => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      if (s.category) {
        categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
      }
      totalVotes += s.upvotes + s.downvotes;
    });

    const byCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));

    const topSuggestions = suggestions
      .map((s) => ({
        id: s.id,
        title: s.title,
        score: s.upvotes - s.downvotes,
        status: s.status,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const implemented = byStatus[SuggestionStatus.implemented] || 0;
    const implementationRate = total > 0 ? (implemented / total) * 100 : 0;

    return {
      total,
      byStatus,
      byCategory,
      totalVotes,
      topSuggestions,
      implementationRate: Math.round(implementationRate * 100) / 100,
    };
  }

  /**
   * Valider transition de statut
   */
  private async validateStatusTransition(
    id: string,
    newStatus: SuggestionStatus,
  ): Promise<void> {
    const suggestion = await this.prisma.suggestion.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!suggestion) return;

    const validTransitions: Record<SuggestionStatus, SuggestionStatus[]> = {
      [SuggestionStatus.submitted]: [
        SuggestionStatus.reviewing,
        SuggestionStatus.rejected,
      ],
      [SuggestionStatus.reviewing]: [
        SuggestionStatus.approved,
        SuggestionStatus.rejected,
        SuggestionStatus.submitted,
      ],
      [SuggestionStatus.approved]: [
        SuggestionStatus.in_progress,
        SuggestionStatus.rejected,
      ],
      [SuggestionStatus.in_progress]: [
        SuggestionStatus.implemented,
        SuggestionStatus.approved,
      ],
      [SuggestionStatus.implemented]: [SuggestionStatus.archived],
      [SuggestionStatus.rejected]: [
        SuggestionStatus.archived,
        SuggestionStatus.submitted,
      ],
      [SuggestionStatus.archived]: [],
    };

    const allowedTransitions = validTransitions[suggestion.status] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transition invalide: ${suggestion.status} → ${newStatus}`,
      );
    }
  }
}
