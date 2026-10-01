import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une nouvelle organisation
   * - Génère automatiquement le slug depuis le nom
   * - Initialise le trial (7 jours)
   * - Configure les limites selon le plan
   */
  async create(createDto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    const slug = this.generateSlug(createDto.name);

    // Vérifier si le slug existe déjà
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Une organisation avec ce nom existe déjà (slug: ${slug})`);
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await this.prisma.organization.findFirst({
      where: { email: createDto.email },
    });

    if (existingEmail) {
      throw new ConflictException(`Une organisation avec cet email existe déjà`);
    }

    // Calculer les limites selon le plan
    const limits = this.getPlanLimits(createDto.subscriptionPlan || 'essentialiel');

    // Calculer la date de fin du trial (7 jours)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    try {
      const organization = await this.prisma.organization.create({
        data: {
          name: createDto.name,
          slug,
          email: createDto.email,
          phone: createDto.phone,
          logoUrl: createDto.logoUrl,
          primaryColor: createDto.primaryColor || '#3B82F6',
          welcomeMessage: createDto.welcomeMessage,
          subscriptionPlan: createDto.subscriptionPlan || 'essentialiel',
          subscriptionStatus: 'trial',
          trialEndsAt,
          maxSites: limits.maxSites,
          maxUsers: limits.maxUsers,
          maxMonthlyFeedbacks: limits.maxMonthlyFeedbacks,
        },
      });

      this.logger.log(`Organisation créée: ${organization.id} (${organization.name})`);

      return plainToInstance(OrganizationResponseDto, organization);
    } catch (error) {
      this.logger.error(`Erreur création organisation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer toutes les organisations
   * - Pagination
   * - Filtre par statut
   * - Inclut les statistiques d'utilisation
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: string;
    includeStats?: boolean;
  }): Promise<OrganizationResponseDto[]> {
    const { skip = 0, take = 50, status, includeStats = false } = params || {};

    const where: any = {
      deletedAt: null, // Exclure les supprimés (soft delete)
      isPlatform: false,
    };

    if (status) {
      where.subscriptionStatus = status;
    }

    const organizations = await this.prisma.organization.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: includeStats
        ? {
            _count: {
              select: {
                sites: true,
                users: true,
                feedbacks: true,
              },
            },
          }
        : undefined,
    });

    return organizations.map((org) => {
      const dto = plainToInstance(OrganizationResponseDto, org);

      if (includeStats && '_count' in org) {
        dto.currentSitesCount = (org as any)._count.sites;
        dto.currentUsersCount = (org as any)._count.users;
        dto.currentMonthlyFeedbacks = (org as any)._count.feedbacks; // TODO: filtrer par mois
      }

      return dto;
    });
  }

  /**
   * Récupérer une organisation par ID
   * - Lance NotFoundException si non trouvée
   * - Exclut les organisations supprimées
   */
  async findOne(id: string): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            sites: true,
            users: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organisation non trouvée (id: ${id})`);
    }

    const dto = plainToInstance(OrganizationResponseDto, organization);
    dto.currentSitesCount = (organization as any)._count.sites;
    dto.currentUsersCount = (organization as any)._count.users;
    dto.currentMonthlyFeedbacks = (organization as any)._count.feedbacks;

    return dto;
  }

  /**
   * Récupérer une organisation par slug
   */
  async findBySlug(slug: string): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(`Organisation non trouvée (slug: ${slug})`);
    }

    return plainToInstance(OrganizationResponseDto, organization);
  }

  /**
   * Mettre à jour une organisation
   */
  async update(id: string, updateDto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    // Vérifier que l'organisation existe
    await this.findOne(id);

    // Si le nom change, régénérer le slug
    let slug: string | undefined;
    if (updateDto.name) {
      slug = this.generateSlug(updateDto.name);

      // Vérifier que le nouveau slug n'existe pas déjà
      const existing = await this.prisma.organization.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(`Une organisation avec ce nom existe déjà (slug: ${slug})`);
      }
    }

    // Si le plan change, mettre à jour les limites
    let limits: any = {};
    if (updateDto.subscriptionPlan) {
      limits = this.getPlanLimits(updateDto.subscriptionPlan);
    }

    try {
      const organization = await this.prisma.organization.update({
        where: { id },
        data: {
          ...updateDto,
          slug,
          ...limits,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Organisation mise à jour: ${id}`);

      return plainToInstance(OrganizationResponseDto, organization);
    } catch (error) {
      this.logger.error(`Erreur mise à jour organisation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer une organisation (soft delete)
   * - Marque deletedAt
   * - Ne supprime pas physiquement (auditabilité)
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que l'organisation existe
    await this.findOne(id);

    // Vérifier qu'il n'y a pas de dépendances critiques
    const hasUsers = await this.prisma.user.count({
      where: { organizationId: id },
    });

    if (hasUsers > 0) {
      throw new BadRequestException(
        `Impossible de supprimer: ${hasUsers} utilisateur(s) associé(s)`,
      );
    }

    try {
      await this.prisma.organization.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          subscriptionStatus: 'suspended',
        },
      });

      this.logger.warn(`Organisation supprimée (soft): ${id}`);

      return { message: 'Organisation supprimée avec succès' };
    } catch (error) {
      this.logger.error(`Erreur suppression organisation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier si une organisation peut créer un nouveau site
   */
  async canCreateSite(organizationId: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: { sites: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organisation non trouvée');
    }

    return (org as any)._count.sites < org.maxSites;
  }

  /**
   * Vérifier si une organisation peut créer un nouvel utilisateur
   */
  async canCreateUser(organizationId: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organisation non trouvée');
    }

    return (org as any)._count.users < org.maxUsers;
  }

  /**
   * Retourner l'usage et les infos d'abonnement d'une organisation
   */
  async getUsage(organizationId: string) {
    const [org, sitesCount, usersCount, feedbacksThisMonth, campaignPacks] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          name: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          maxSites: true,
          maxUsers: true,
          maxMonthlyFeedbacks: true,
          subscriptionStartsAt: true,
          subscriptionEndsAt: true,
        },
      }),
      this.prisma.site.count({ where: { organizationId } }),
      this.prisma.user.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.feedback.count({
        where: {
          organizationId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.campaignPack.findMany({
        where: {
          organizationId,
          remaining: { gt: 0 },
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          packageCode: true,
          remaining: true,
          totalCampaigns: true,
          expiresAt: true,
        },
        orderBy: { expiresAt: 'asc' },
      }),
    ]);

    if (!org) throw new NotFoundException('Organisation non trouvée');

    const daysRemainingTrial = org.trialEndsAt
      ? Math.max(
          0,
          Math.ceil((new Date(org.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : null;

    return {
      plan: org.subscriptionPlan,
      status: org.subscriptionStatus,
      trialEndsAt: org.trialEndsAt,
      daysRemainingTrial,
      limits: {
        sites: { used: sitesCount, max: org.maxSites },
        users: { used: usersCount, max: org.maxUsers },
        feedbacksThisMonth: { used: feedbacksThisMonth, max: org.maxMonthlyFeedbacks },
      },
      subscriptionStartsAt: org.subscriptionStartsAt,
      subscriptionEndsAt: org.subscriptionEndsAt,
      campaignPacks,
    };
  }

  // ===========================
  // HELPERS PRIVÉS
  // ===========================

  /**
   * Générer un slug URL-friendly depuis le nom
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Enlever accents
      .replace(/[^a-z0-9\s-]/g, '') // Enlever caractères spéciaux
      .trim()
      .replace(/\s+/g, '-') // Espaces -> tirets
      .replace(/-+/g, '-'); // Tirets multiples -> tiret simple
  }

  /**
   * Obtenir les limites selon le plan d'abonnement
   */
  private getPlanLimits(plan: string) {
    const limits = {
      essentialiel: {
        maxSites: 1,
        maxUsers: 3,
        maxMonthlyFeedbacks: 1000,
      },
      pro: {
        maxSites: 5,
        maxUsers: 10,
        maxMonthlyFeedbacks: 5000,
      },
      business: {
        maxSites: 20,
        maxUsers: 50,
        maxMonthlyFeedbacks: 25000,
      },
      institution: {
        maxSites: 100,
        maxUsers: 200,
        maxMonthlyFeedbacks: 100000,
      },
    };

    return limits[plan] || limits.essentialiel;
  }
}
