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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Feedback')
@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau feedback (PUBLIC)',
    description:
      'Route publique pour soumettre un feedback de satisfaction. ' +
      'Peut être anonyme ou identifié. ' +
      'Le sentiment est détecté automatiquement à partir du commentaire et/ou du rating.',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback créé avec succès',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 404,
    description: 'Site non trouvé',
  })
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
  )
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Liste tous les feedbacks',
    description:
      'Filtre par organisation, site, sentiment, rating, dates. ' +
      'Pagination disponible.',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
    description: 'Filtrer par organisation',
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
    type: String,
    description: 'Filtrer par site',
  })
  @ApiQuery({
    name: 'sentiment',
    required: false,
    type: String,
    description: 'Filtrer par sentiment (positive, neutral, negative, unknown)',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Note minimum (1-5)',
  })
  @ApiQuery({
    name: 'maxRating',
    required: false,
    type: Number,
    description: 'Note maximum (1-5)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Date de début (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Date de fin (ISO 8601)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Pagination: éléments à ignorer',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Pagination: éléments à récupérer',
    example: 50,
  })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    type: Boolean,
    description: 'Inclure site, organisation, user',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des feedbacks',
    type: [FeedbackResponseDto],
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
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('sentiment') sentiment?: string,
    @Query('minRating') minRating?: number,
    @Query('maxRating') maxRating?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.findAll({
      organizationId,
      siteId,
      sentiment,
      minRating: minRating ? +minRating : undefined,
      maxRating: maxRating ? +maxRating : undefined,
      startDate,
      endDate,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      includeRelations: includeRelations === true,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Statistiques des feedbacks',
    description:
      'Total, par sentiment, note moyenne, taux de réponse. ' +
      'Période: 7d, 30d, 90d, 1y.',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'siteId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    example: '30d',
    description: 'Période: 7d, 30d, 90d, 1y',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      example: {
        period: '30d',
        total: 450,
        bySentiment: {
          positive: 320,
          neutral: 80,
          negative: 50,
        },
        averageRating: 4.2,
        responseRate: 0.85,
      },
    },
  })
  getStats(
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('period') period?: string,
  ) {
    return this.feedbackService.getStats({
      organizationId,
      siteId,
      period: period || '30d',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Récupérer un feedback par ID',
    description: 'Inclut les relations (site, organisation, user).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback trouvé',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feedback non trouvé',
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
  )
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Mettre à jour un feedback (traitement simple)',
    description:
      'Permet de marquer comme traité et d\'enregistrer les dates de traitement/réponse.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback mis à jour',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feedback non trouvé',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un feedback (SUPER_ADMIN uniquement)',
    description:
      'Suppression physique. Rarement utilisé. ' +
      'Préférer archiver ou ignorer plutôt que supprimer.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID du feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback supprimé',
  })
  @ApiResponse({
    status: 404,
    description: 'Feedback non trouvé',
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.feedbackService.remove(id);
  }
}
