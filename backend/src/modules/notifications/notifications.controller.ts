import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
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
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationChannel } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Liste notifications utilisateur',
    description: 'Récupère les notifications de l\'utilisateur connecté avec filtres',
  })
  @ApiQuery({
    name: 'channel',
    required: false,
    enum: NotificationChannel,
    description: 'Filtrer par canal',
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut lu/non-lu',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Liste des notifications',
    type: [NotificationResponseDto],
  })
  async findAll(
    @Request() req,
    @Query('channel') channel?: NotificationChannel,
    @Query('isRead') isRead?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAllForUser({
      userId: req.user.id,
      channel,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      skip,
      take,
    });
  }

  @Get('unread')
  @ApiOperation({
    summary: 'Notifications non lues',
    description: 'Récupère uniquement les notifications in-app non lues',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications non lues',
    type: [NotificationResponseDto],
  })
  async findUnread(@Request() req): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findUnread(req.user.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques notifications',
    description: 'Stats: total, non lues, par canal, par type',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 125 },
        unread: { type: 'number', example: 12 },
        byChannel: {
          type: 'object',
          example: { in_app: 80, email: 45 },
        },
        byType: {
          type: 'object',
          example: { 'complaint.created': 25, 'feedback.negative': 15 },
        },
      },
    },
  })
  async getStats(@Request() req) {
    return this.notificationsService.getStats(req.user.id);
  }

  @Get('preferences')
  @ApiOperation({
    summary: 'Préférences notifications',
    description: 'Récupère les préférences de notifications de l\'utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Préférences',
    type: NotificationPreferencesDto,
  })
  async getPreferences(@Request() req): Promise<NotificationPreferencesDto> {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({
    summary: 'Modifier préférences',
    description: 'Met à jour les préférences de notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Préférences mises à jour',
    type: NotificationPreferencesDto,
  })
  async updatePreferences(
    @Request() req,
    @Body() preferences: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    return this.notificationsService.updatePreferences(req.user.id, preferences);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marquer comme lue',
    description: 'Marque une notification comme lue',
  })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification marquée comme lue',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  async markAsRead(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Marquer toutes comme lues',
    description: 'Marque toutes les notifications in-app non lues comme lues',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications marquées comme lues',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 12 },
      },
    },
  })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer notification',
    description: 'Supprime une notification',
  })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification supprimée' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  async remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.remove(id, req.user.id);
  }
}
