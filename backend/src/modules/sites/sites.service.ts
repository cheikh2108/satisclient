import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteResponseDto } from './dto/site-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau site
   * - Vérifie que l'organisation existe
   * - Vérifie le quota maxSites
   * - Génère un code unique
   * - Vérifie la hiérarchie (parentId)
   */
  async create(createDto: CreateSiteDto): Promise<SiteResponseDto> {
    // 1. Vérifier que l'organisation existe
    const organization = await this.prisma.organization.findUnique({
      where: { id: createDto.organizationId },
      include: {
        _count: {
          select: { sites: true },
        },
      },
    });

    if (!organization || organization.deletedAt) {
      throw new NotFoundException(
        `Organisation non trouvée (id: ${createDto.organizationId})`,
      );
    }

    // 2. Vérifier le quota maxSites
    const currentSitesCount = (organization as any)._count.sites;
    if (currentSitesCount >= organization.maxSites) {
      throw new ForbiddenException(
        `Quota atteint: ${currentSitesCount}/${organization.maxSites} sites. ` +
        `Upgradez votre plan pour créer plus de sites.`,
      );
    }

    // 3. Vérifier que le parent existe et appartient à la même organisation
    if (createDto.parentId) {
      const parent = await this.prisma.site.findUnique({
        where: { id: createDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Site parent non trouvé (id: ${createDto.parentId})`);
      }

      if (parent.organizationId !== createDto.organizationId) {
        throw new BadRequestException(
          'Le site parent doit appartenir à la même organisation',
        );
      }
    }

    // 4. Générer un code unique
    const code = await this.generateUniqueCode(createDto.name);

    // 5. Créer le site
    try {
      const site = await this.prisma.site.create({
        data: {
          ...createDto,
          code,
          isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        },
      });

      this.logger.log(
        `Site créé: ${site.id} (${site.name}) - Organisation: ${createDto.organizationId}`,
      );

      return plainToInstance(SiteResponseDto, site);
    } catch (error) {
      this.logger.error(`Erreur création site: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer tous les sites
   * - Filtre par organisation (multi-tenant)
   * - Pagination
   * - Filtres (type, isActive)
   * - Inclut les statistiques si demandé
   */
  async findAll(params?: {
    organizationId?: string;
    skip?: number;
    take?: number;
    type?: string;
    isActive?: boolean;
    includeStats?: boolean;
  }): Promise<SiteResponseDto[]> {
    const { organizationId, skip = 0, take = 50, type, isActive, includeStats = false } = params || {};

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const sites = await this.prisma.site.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: includeStats
        ? {
            _count: {
              select: {
                feedbacks: true,
                complaints: true,
                suggestions: true,
                children: true,
              },
            },
          }
        : undefined,
    });

    return sites.map((site) => {
      const dto = plainToInstance(SiteResponseDto, site);

      if (includeStats && '_count' in site) {
        dto.feedbacksCount = (site as any)._count.feedbacks;
        dto.complaintsCount = (site as any)._count.complaints;
        dto.suggestionsCount = (site as any)._count.suggestions;
        dto.childrenCount = (site as any)._count.children;
      }

      return dto;
    });
  }

  async getStats(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    const [total, active, inactive, byType] = await Promise.all([
      this.prisma.site.count({ where }),
      this.prisma.site.count({ where: { ...where, isActive: true } }),
      this.prisma.site.count({ where: { ...where, isActive: false } }),
      this.prisma.site.groupBy({ by: ['type'], where, _count: true }),
    ]);

    return {
      total,
      active,
      inactive,
      byType: byType.reduce((acc, t) => ({ ...acc, [t.type]: t._count }), {} as Record<string, number>),
    };
  }

  /**
   * Récupérer un site par ID
   * - Inclut les statistiques
   * - Lance NotFoundException si non trouvé
   */
  async findOne(id: string): Promise<SiteResponseDto> {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            feedbacks: true,
            complaints: true,
            suggestions: true,
            children: true,
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site non trouvé (id: ${id})`);
    }

    const dto = plainToInstance(SiteResponseDto, site);
    dto.feedbacksCount = (site as any)._count.feedbacks;
    dto.complaintsCount = (site as any)._count.complaints;
    dto.suggestionsCount = (site as any)._count.suggestions;
    dto.childrenCount = (site as any)._count.children;

    // Calculer la note moyenne si des feedbacks existent
    if (dto.feedbacksCount! > 0) {
      const avgResult = await this.prisma.feedback.aggregate({
        where: { siteId: id, overallRating: { not: null } },
        _avg: { overallRating: true },
      });
      dto.averageRating = avgResult._avg.overallRating
        ? Math.round(avgResult._avg.overallRating * 10) / 10
        : undefined;
    }

    return dto;
  }

  /**
   * Récupérer un site par code
   */
  async findByCode(code: string): Promise<SiteResponseDto> {
    const site = await this.prisma.site.findFirst({
      where: { code },
    });

    if (!site) {
      throw new NotFoundException(`Site non trouvé (code: ${code})`);
    }

    return plainToInstance(SiteResponseDto, site);
  }

  /**
   * Mettre à jour un site
   */
  async update(id: string, updateDto: UpdateSiteDto): Promise<SiteResponseDto> {
    // Vérifier que le site existe
    await this.findOne(id);

    // Si parentId change, vérifier la nouvelle hiérarchie
    if (updateDto.parentId) {
      const parent = await this.prisma.site.findUnique({
        where: { id: updateDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Site parent non trouvé (id: ${updateDto.parentId})`);
      }

      // Empêcher les boucles infinies
      if (updateDto.parentId === id) {
        throw new BadRequestException('Un site ne peut pas être son propre parent');
      }

      // TODO: Vérifier qu'on ne crée pas une boucle dans la hiérarchie
    }

    try {
      const site = await this.prisma.site.update({
        where: { id },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Site mis à jour: ${id}`);

      return plainToInstance(SiteResponseDto, site);
    } catch (error) {
      this.logger.error(`Erreur mise à jour site: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer un site
   * - Vérifie qu'il n'y a pas de sous-sites
   * - Vérifie qu'il n'y a pas de feedbacks (ou les archive)
   */
  async remove(id: string): Promise<{ message: string }> {
    // Vérifier que le site existe
    await this.findOne(id);

    // Vérifier qu'il n'y a pas de sous-sites
    const childrenCount = await this.prisma.site.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer: ${childrenCount} sous-site(s) associé(s)`,
      );
    }

    // Vérifier qu'il n'y a pas de feedbacks
    const feedbacksCount = await this.prisma.feedback.count({
      where: { siteId: id },
    });

    if (feedbacksCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer: ${feedbacksCount} feedback(s) associé(s). ` +
        `Archivez-les ou désactivez le site à la place.`,
      );
    }

    try {
      await this.prisma.site.delete({
        where: { id },
      });

      this.logger.warn(`Site supprimé: ${id}`);

      return { message: 'Site supprimé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur suppression site: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer tous les sous-sites d'un site
   */
  async findChildren(id: string): Promise<SiteResponseDto[]> {
    // Vérifier que le site parent existe
    await this.findOne(id);

    const children = await this.prisma.site.findMany({
      where: { parentId: id },
      orderBy: { name: 'asc' },
    });

    return children.map((site) => plainToInstance(SiteResponseDto, site));
  }

  /**
   * Récupérer tous les sites d'une organisation (avec hiérarchie)
   */
  async findByOrganization(organizationId: string): Promise<SiteResponseDto[]> {
    return this.findAll({ organizationId, includeStats: true });
  }

  // ===========================
  // HELPERS PRIVÉS
  // ===========================

  /**
   * Générer un code unique URL-friendly
   */
  private async generateUniqueCode(name: string): Promise<string> {
    // Nettoyer le nom pour créer une base de code
    let baseCode = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Enlever accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces, tirets
      .trim()
      .replace(/\s+/g, '-') // Espaces -> tirets
      .replace(/-+/g, '-') // Tirets multiples -> tiret simple
      .substring(0, 30); // Max 30 caractères

    // Vérifier l'unicité
    let code = baseCode;
    let suffix = 1;

    while (await this.codeExists(code)) {
      code = `${baseCode}-${suffix}`;
      suffix++;
    }

    return code;
  }

  /**
   * Vérifier si un code existe déjà
   */
  private async codeExists(code: string): Promise<boolean> {
    const existing = await this.prisma.site.findFirst({
      where: { code },
    });
    return !!existing;
  }
}
