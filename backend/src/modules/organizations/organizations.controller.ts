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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@ApiBearerAuth('JWT')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserRole.super_admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle organisation',
    description:
      'Seuls les super_admin peuvent créer des organisations. ' +
      'Le slug est généré automatiquement. ' +
      'Le trial commence automatiquement (14 jours).',
  })
  @ApiResponse({
    status: 201,
    description: 'Organisation créée avec succès',
    type: OrganizationResponseDto,
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
    description: 'Accès refusé (rôle insuffisant)',
  })
  @ApiResponse({
    status: 409,
    description: 'Organisation avec ce nom ou email existe déjà',
  })
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Liste toutes les organisations',
    description:
      'super_admin: voit toutes les organisations. ' +
      'org_admin: voit uniquement la sienne (filtré par middleware).',
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
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrer par statut (active, suspended, trial, expired)',
    example: 'active',
  })
  @ApiQuery({
    name: 'includeStats',
    required: false,
    type: Boolean,
    description: 'Inclure les statistiques d\'utilisation',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des organisations',
    type: [OrganizationResponseDto],
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
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('includeStats') includeStats?: boolean,
  ): Promise<OrganizationResponseDto[]> {
    return this.organizationsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      status,
      includeStats: includeStats === true,
    });
  }

  @Get(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Récupérer une organisation par ID',
    description: 'Inclut les statistiques d\'utilisation (sites, users, feedbacks).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'organisation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Organisation trouvée',
    type: OrganizationResponseDto,
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
    description: 'Organisation non trouvée',
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.findOne(id);
  }

  @Get('slug/:slug')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Récupérer une organisation par slug',
    description: 'Utile pour les URLs publiques (slug URL-friendly).',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug de l\'organisation',
    example: 'acme-corporation',
  })
  @ApiResponse({
    status: 200,
    description: 'Organisation trouvée',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation non trouvée',
  })
  findBySlug(@Param('slug') slug: string): Promise<OrganizationResponseDto> {
    return this.organizationsService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Mettre à jour une organisation',
    description:
      'super_admin: peut tout modifier. ' +
      'org_admin: peut modifier uniquement certains champs de sa propre organisation.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Organisation mise à jour',
    type: OrganizationResponseDto,
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
    description: 'Organisation non trouvée',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflit (slug ou email déjà utilisé)',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.super_admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une organisation (soft delete)',
    description:
      'Seuls les super_admin peuvent supprimer. ' +
      'Soft delete: marque deletedAt sans supprimer physiquement. ' +
      'Échoue si des utilisateurs sont associés.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Organisation supprimée',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Organisation supprimée avec succès' },
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
    description: 'Organisation non trouvée',
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.organizationsService.remove(id);
  }

  @Get(':id/can-create-site')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Vérifier si l\'organisation peut créer un nouveau site',
    description: 'Vérifie si la limite maxSites n\'est pas atteinte.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Quota vérifié',
    schema: {
      type: 'object',
      properties: {
        canCreate: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation non trouvée',
  })
  async canCreateSite(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ canCreate: boolean }> {
    const canCreate = await this.organizationsService.canCreateSite(id);
    return { canCreate };
  }

  @Get(':id/can-create-user')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Vérifier si l\'organisation peut créer un nouvel utilisateur',
    description: 'Vérifie si la limite maxUsers n\'est pas atteinte.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l\'organisation',
  })
  @ApiResponse({
    status: 200,
    description: 'Quota vérifié',
    schema: {
      type: 'object',
      properties: {
        canCreate: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organisation non trouvée',
  })
  async canCreateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ canCreate: boolean }> {
    const canCreate = await this.organizationsService.canCreateUser(id);
    return { canCreate };
  }
}
