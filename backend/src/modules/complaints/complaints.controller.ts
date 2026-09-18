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
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { ComplaintResponseDto } from './dto/complaint-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ComplaintStatus } from '@prisma/client';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle réclamation',
    description:
      'Crée une réclamation avec génération automatique du numéro de ticket ' +
      'et calcul du SLA selon la priorité. Statut initial: RECEIVED.',
  })
  @ApiResponse({
    status: 201,
    description: 'Réclamation créée avec succès',
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  create(@Body() createComplaintDto: CreateComplaintDto): Promise<ComplaintResponseDto> {
    return this.complaintsService.create(createComplaintDto);
  }

  @Get()
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
    summary: 'Liste toutes les réclamations',
    description:
      'Filtre par organisation, site, statut, priorité, agent. ' +
      'Tri par priorité DESC puis date DESC.',
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'siteId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ComplaintStatus,
    description: 'Filtrer par statut',
  })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'UUID agent' })
  @ApiQuery({ name: 'isOverdue', required: false, type: Boolean })
  @ApiQuery({ name: 'isCritical', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, example: true })
  @ApiResponse({ status: 200, description: 'Liste des réclamations', type: [ComplaintResponseDto] })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findAll(
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: ComplaintStatus,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('isOverdue') isOverdue?: boolean,
    @Query('isCritical') isCritical?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<ComplaintResponseDto[]> {
    return this.complaintsService.findAll({
      organizationId,
      siteId,
      status,
      priority,
      assignedTo,
      isOverdue: isOverdue === true,
      isCritical: isCritical === true,
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
    summary: 'Statistiques des réclamations',
    description:
      'Total, par statut, par priorité, taux SLA compliance, temps moyen résolution, overdue/critical count.',
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'siteId', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, type: String, example: '30d' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      example: {
        period: '30d',
        total: 120,
        byStatus: { received: 15, assigned: 25, in_progress: 40, resolved: 35, closed: 5 },
        byPriority: { urgent: 5, high: 20, normal: 70, low: 25 },
        overdueCount: 8,
        criticalCount: 3,
        averageResolutionTime: 18.5,
        slaComplianceRate: 0.92,
      },
    },
  })
  getStats(
    @Query('organizationId') organizationId?: string,
    @Query('siteId') siteId?: string,
    @Query('period') period?: string,
  ) {
    return this.complaintsService.getStats({ organizationId, siteId, period: period || '30d' });
  }

  @Get('ticket/:ticketNumber')
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
    summary: 'Récupérer une réclamation par numéro de ticket',
    description: 'Exemple: COMP-2024-001234',
  })
  @ApiParam({ name: 'ticketNumber', example: 'COMP-2024-001234' })
  @ApiResponse({ status: 200, description: 'Réclamation trouvée', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  findByTicketNumber(@Param('ticketNumber') ticketNumber: string): Promise<ComplaintResponseDto> {
    return this.complaintsService.findByTicketNumber(ticketNumber);
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
    summary: 'Récupérer une réclamation par ID',
    description: 'Inclut les relations (site, organisation, créateur, assigné).',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Réclamation trouvée', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ComplaintResponseDto> {
    return this.complaintsService.findOne(id);
  }

  @Post(':id/assign/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.service_manager)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assigner une réclamation à un agent',
    description: 'Change automatiquement le statut en ASSIGNED et enregistre la date/heure.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiParam({ name: 'userId', description: 'UUID de l\'agent' })
  @ApiResponse({ status: 200, description: 'Réclamation assignée', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation ou utilisateur non trouvé' })
  assign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<ComplaintResponseDto> {
    return this.complaintsService.assign(id, userId);
  }

  @Patch(':id/status')
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
    summary: 'Changer le statut d\'une réclamation',
    description:
      'Valide la transition via FSM (Finite State Machine). ' +
      'Crée automatiquement une entrée dans l\'historique.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Statut changé', type: ComplaintResponseDto })
  @ApiResponse({ status: 400, description: 'Transition invalide' })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  changeStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('status') status: ComplaintStatus,
    @Body('comment') comment?: string,
  ): Promise<ComplaintResponseDto> {
    return this.complaintsService.changeStatus(id, status, comment);
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Résoudre une réclamation',
    description:
      'Change le statut en RESOLVED, enregistre la date de résolution et le résumé. ' +
      'Categories: fixed, wont_fix, duplicate, cannot_reproduce.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Réclamation résolue', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  resolve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('resolutionSummary') resolutionSummary: string,
    @Body('resolutionCategory') resolutionCategory?: string,
  ): Promise<ComplaintResponseDto> {
    return this.complaintsService.resolve(id, resolutionSummary, resolutionCategory);
  }

  @Post(':id/escalate')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.service_manager)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Escalader une réclamation',
    description:
      'Marque la réclamation comme escaladée et l\'assigne à un superviseur. ' +
      'Utilisé pour les cas critiques ou overdue.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Réclamation escaladée', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  escalate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('escalatedTo') escalatedTo: string,
    @Body('reason') reason?: string,
  ): Promise<ComplaintResponseDto> {
    return this.complaintsService.escalate(id, escalatedTo, reason);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.quality_manager,
    UserRole.service_manager,
    UserRole.agent,
  )
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajouter un commentaire ou note',
    description:
      'Ajoute un commentaire visible par le client ou une note interne. ' +
      'Enregistré dans ComplaintHistory.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Commentaire ajouté' })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  addComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() addCommentDto: AddCommentDto,
  ): Promise<{ message: string }> {
    return this.complaintsService.addComment(id, addCommentDto);
  }

  @Get(':id/history')
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
    summary: 'Récupérer l\'historique complet d\'une réclamation',
    description:
      'Timeline de toutes les actions: création, assignation, changements de statut, ' +
      'commentaires, résolution, escalade. Ordre chronologique décroissant.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Historique' })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  getHistory(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.complaintsService.getHistory(id);
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
    summary: 'Mettre à jour une réclamation',
    description: 'Mise à jour partielle des champs (titre, description, priorité, etc.).',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Réclamation mise à jour', type: ComplaintResponseDto })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ): Promise<ComplaintResponseDto> {
    return this.complaintsService.update(id, updateComplaintDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une réclamation (SUPER_ADMIN uniquement)',
    description:
      'Soft delete (deletedAt). Rarement utilisé. ' +
      'Préférer clore (status=closed) plutôt que supprimer.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la réclamation' })
  @ApiResponse({ status: 200, description: 'Réclamation supprimée' })
  @ApiResponse({ status: 404, description: 'Réclamation non trouvée' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
    return this.complaintsService.remove(id);
  }
}
