import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteResponseDto } from './dto/site-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sites')
@Controller('sites')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@ApiBearerAuth('JWT')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau site',
    description:
      'Crée un site pour une organisation. ' +
      'Vérifie automatiquement le quota maxSites. ' +
      'Génère un code unique URL-friendly.',
  })
  @ApiResponse({
    status: 201,
    description: 'Site créé avec succès',
    type: SiteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Quota maxSites atteint ou accès refusé',
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation non trouvée',
  })
  create(@Request() req, @Body() createSiteDto: CreateSiteDto): Promise<SiteResponseDto> {
    return this.sitesService.create({ ...createSiteDto, organizationId: createSiteDto.organizationId || req.user?.organizationId });
  }

  @Get('stats')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({ summary: 'Statistiques des sites' })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  async getStats(@Request() req, @Query('organizationId') organizationId?: string) {
    const orgId = organizationId || req.user?.organizationId;
    return this.sitesService.getStats(orgId);
  }

  @Get()
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Liste tous les sites',
    description:
      'Filtre par organisation, type, statut actif. ' +
      'Pagination disponible. ' +
      'Peut inclure les statistiques.',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
    description: 'Filtrer par organisation (UUID)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments à ignorer (pagination)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments à récupérer',
    example: 50,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filtrer par type (organization, region, agency, service, point)',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut actif',
  })
  @ApiQuery({
    name: 'includeStats',
    required: false,
    type: Boolean,
    description: 'Inclure les statistiques (feedbacks, complaints, etc.)',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des sites',
    type: [SiteResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé',
  })
  findAll(
    @Request() req,
    @Query('organizationId') organizationId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
    @Query('includeStats') includeStats?: boolean,
  ): Promise<SiteResponseDto[]> {
    const orgId = organizationId || req.user?.organizationId;
    return this.sitesService.findAll({
      organizationId: orgId,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      type,
      isActive: isActive !== undefined ? isActive === true : undefined,
      includeStats: includeStats === true,
    });
  }

  @Get(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Récupérer un site par ID',
    description: 'Inclut les statistiques (feedbacks, note moyenne, sous-sites).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du site',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Site trouvé',
    type: SiteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé',
  })
  @ApiResponse({
    status: 404,
    description: 'Site non trouvé',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<SiteResponseDto> {
    return this.sitesService.findOne(id);
  }

  @Get('code/:code')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Récupérer un site par code',
    description: 'Utile pour les URLs publiques (code URL-friendly).',
  })
  @ApiParam({
    name: 'code',
    description: 'Code unique du site',
    example: 'agence-dakar-plateau',
  })
  @ApiResponse({
    status: 200,
    description: 'Site trouvé',
    type: SiteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Site non trouvé',
  })
  findByCode(@Param('code') code: string): Promise<SiteResponseDto> {
    return this.sitesService.findByCode(code);
  }

  @Get(':id/children')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Récupérer tous les sous-sites',
    description: 'Liste tous les sites enfants d\'un site parent (hiérarchie).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du site parent',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des sous-sites',
    type: [SiteResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Site parent non trouvé',
  })
  findChildren(@Param('id', new ParseUUIDPipe()) id: string): Promise<SiteResponseDto[]> {
    return this.sitesService.findChildren(id);
  }

  @Get('organization/:organizationId')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Récupérer tous les sites d\'une organisation',
    description: 'Liste avec statistiques.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'UUID de l\'organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des sites de l\'organisation',
    type: [SiteResponseDto],
  })
  findByOrganization(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ): Promise<SiteResponseDto[]> {
    return this.sitesService.findByOrganization(organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Mettre à jour un site',
    description:
      'Permet de modifier toutes les informations du site. ' +
      'Vérifie la hiérarchie si parentId est modifié.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du site',
  })
  @ApiResponse({
    status: 200,
    description: 'Site mis à jour',
    type: SiteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé',
  })
  @ApiResponse({
    status: 404,
    description: 'Site non trouvé',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ): Promise<SiteResponseDto> {
    return this.sitesService.update(id, updateSiteDto);
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un site',
    description:
      'Suppression physique. ' +
      'Échoue si le site a des sous-sites ou des feedbacks. ' +
      'Recommandation: désactiver (isActive=false) plutôt que supprimer.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du site',
  })
  @ApiResponse({
    status: 200,
    description: 'Site supprimé',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Site supprimé avec succès' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer (dépendances)',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé',
  })
  @ApiResponse({
    status: 404,
    description: 'Site non trouvé',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
    return this.sitesService.remove(id);
  }
}
