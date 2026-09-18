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
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
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
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { SurveyResponseDto, SurveyResponseItemDto } from './dto/survey-response.dto';
import { SurveyAnalyticsDto } from './dto/survey-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Créer un questionnaire',
    description: 'Créer un nouveau questionnaire avec questions (NPS, CSAT, CES, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Questionnaire créé',
    type: SurveyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body() createDto: CreateSurveyDto,
    @Request() req,
  ): Promise<SurveyResponseDto> {
    return this.surveysService.create(createDto, req.user.id);
  }

  @Get()
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Liste questionnaires',
    description: 'Récupère la liste des questionnaires avec filtres',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Filtrer par organisation',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut actif',
  })
  @ApiQuery({
    name: 'surveyType',
    required: false,
    description: 'Filtrer par type (one_time, recurring, continuous)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Pagination - skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Pagination - take',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des questionnaires',
    type: [SurveyResponseDto],
  })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('isActive') isActive?: string,
    @Query('surveyType') surveyType?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ): Promise<SurveyResponseDto[]> {
    return this.surveysService.findAll({
      organizationId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      surveyType,
      skip,
      take,
    });
  }

  @Get(':id')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Détail questionnaire',
    description: 'Récupère un questionnaire avec toutes ses questions',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({
    status: 200,
    description: 'Questionnaire trouvé',
    type: SurveyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Questionnaire non trouvé' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SurveyResponseDto> {
    return this.surveysService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Modifier questionnaire',
    description: 'Met à jour un questionnaire (titre, questions, dates, etc.)',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({
    status: 200,
    description: 'Questionnaire modifié',
    type: SurveyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Questionnaire non trouvé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSurveyDto,
  ): Promise<SurveyResponseDto> {
    return this.surveysService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Supprimer questionnaire',
    description: 'Supprime un questionnaire et toutes ses réponses (cascade)',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({ status: 200, description: 'Questionnaire supprimé' })
  @ApiResponse({ status: 404, description: 'Questionnaire non trouvé' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveysService.remove(id);
  }

  @Post(':id/responses')
  @ApiOperation({
    summary: 'Soumettre une réponse',
    description: 'Enregistre les réponses d\'un participant au questionnaire',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({
    status: 201,
    description: 'Réponse enregistrée',
    type: SurveyResponseItemDto,
  })
  @ApiResponse({ status: 400, description: 'Réponses invalides' })
  @ApiResponse({ status: 403, description: 'Limite de réponses atteinte' })
  @ApiResponse({ status: 404, description: 'Questionnaire non trouvé' })
  async submitResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateSurveyResponseDto,
  ): Promise<SurveyResponseItemDto> {
    return this.surveysService.submitResponse({
      ...createDto,
      surveyId: id,
    });
  }

  @Get(':id/responses')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Liste réponses',
    description: 'Récupère les réponses d\'un questionnaire',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiQuery({
    name: 'siteId',
    required: false,
    description: 'Filtrer par site',
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
    description: 'Liste des réponses',
    type: [SurveyResponseItemDto],
  })
  async getResponses(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('siteId') siteId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ): Promise<SurveyResponseItemDto[]> {
    return this.surveysService.getResponses(id, { siteId, skip, take });
  }

  @Get(':id/analytics')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiOperation({
    summary: 'Analytics questionnaire',
    description:
      'Récupère les statistiques complètes (NPS, CSAT, CES, taux complétion, analytics par question)',
  })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({
    status: 200,
    description: 'Analytics',
    type: SurveyAnalyticsDto,
  })
  @ApiResponse({ status: 404, description: 'Questionnaire non trouvé' })
  async getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SurveyAnalyticsDto> {
    return this.surveysService.getAnalytics(id);
  }
}
