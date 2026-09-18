import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { SuggestionResponseDto } from './dto/suggestion-response.dto';
import { VoteSuggestionDto } from './dto/vote-suggestion.dto';
import { AssignSuggestionDto } from './dto/assign-suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, SuggestionStatus } from '@prisma/client';

@ApiTags('Suggestions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
    UserRole.client,
  )
  @ApiOperation({
    summary: 'Créer une suggestion',
    description: 'Soumettre une idée d\'amélioration (tous les rôles)',
  })
  @ApiResponse({
    status: 201,
    description: 'Suggestion créée',
    type: SuggestionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body() createDto: CreateSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.create(createDto);
  }

  @Get()
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Liste suggestions',
    description: 'Récupère la liste des suggestions avec filtres et tri',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Filtrer par organisation',
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
    description: 'Filtrer par site',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SuggestionStatus,
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrer par catégorie',
  })
  @ApiQuery({
    name: 'submittedBy',
    required: false,
    description: 'Filtrer par auteur',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['recent', 'popular', 'score'],
    description: 'Tri: recent (défaut), popular (plus de votes), score (upvotes-downvotes)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des suggestions',
    type: [SuggestionResponseDto],
  })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: SuggestionStatus,
    @Query('category') category?: string,
    @Query('submittedBy') submittedBy?: string,
    @Query('sortBy') sortBy?: 'recent' | 'popular' | 'score',
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ): Promise<SuggestionResponseDto[]> {
    return this.suggestionsService.findAll({
      organizationId,
      siteId,
      status,
      category,
      submittedBy,
      sortBy,
      skip,
      take,
    });
  }

  @Get('stats')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Statistiques suggestions',
    description: 'Stats globales: par statut, catégorie, top suggestions, taux implémentation',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 125 },
        byStatus: {
          type: 'object',
          example: { submitted: 25, approved: 30, implemented: 15 },
        },
        byCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'product' },
              count: { type: 'number', example: 42 },
            },
          },
        },
        totalVotes: { type: 'number', example: 523 },
        topSuggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              score: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
        implementationRate: { type: 'number', example: 12.5 },
      },
    },
  })
  async getStats(
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.suggestionsService.getStats({ organizationId, siteId });
  }

  @Get(':id')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Détail suggestion',
    description: 'Récupère une suggestion avec ses votes et assignations',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Suggestion trouvée',
    type: SuggestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Suggestion non trouvée' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Modifier suggestion',
    description: 'Met à jour une suggestion (contenu, statut, notes)',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Suggestion modifiée',
    type: SuggestionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Transition de statut invalide' })
  @ApiResponse({ status: 404, description: 'Suggestion non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.update(id, updateDto);
  }

  @Post(':id/assign')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Assigner suggestion',
    description: 'Assigne une suggestion à un responsable (change le statut en reviewing)',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Suggestion assignée',
    type: SuggestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Suggestion ou utilisateur non trouvé' })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.assign(id, assignDto.userId);
  }

  @Post(':id/vote')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
    UserRole.client,
  )
  @ApiOperation({
    summary: 'Voter pour une suggestion',
    description: 'Upvote ou downvote (tous les rôles peuvent voter)',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Vote enregistré',
    type: SuggestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Suggestion non trouvée' })
  async vote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() voteDto: VoteSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.vote(id, voteDto);
  }

  @Post(':id/implement')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Marquer comme implémenté',
    description: 'Change le statut en implemented avec notes et preuves',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({
    status: 200,
    description: 'Suggestion marquée implémentée',
    type: SuggestionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Statut invalide pour implémentation',
  })
  async markAsImplemented(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { notes?: string; proofUrls?: string[] },
  ): Promise<SuggestionResponseDto> {
    return this.suggestionsService.markAsImplemented(
      id,
      body.notes,
      body.proofUrls,
    );
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Supprimer suggestion',
    description: 'Soft delete d\'une suggestion (admin uniquement)',
  })
  @ApiParam({ name: 'id', description: 'ID de la suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion supprimée' })
  @ApiResponse({ status: 404, description: 'Suggestion non trouvée' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suggestionsService.remove(id);
  }
}
