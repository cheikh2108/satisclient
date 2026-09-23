import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';
import { plainToInstance } from 'class-transformer';
import { NotificationStatus, NotificationChannel } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer une notification (utilisé par les listeners)
   */
  async create(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: {
        organizationId: createDto.organizationId,
        userId: createDto.userId,
        recipientEmail: createDto.recipientEmail,
        recipientPhone: createDto.recipientPhone,
        notificationType: createDto.notificationType,
        channel: createDto.channel,
        status: NotificationStatus.pending,
        subject: createDto.subject,
        body: createDto.body,
        relatedEntityType: createDto.relatedEntityType,
        relatedEntityId: createDto.relatedEntityId,
        scheduledFor: createDto.scheduledFor ? new Date(createDto.scheduledFor) : new Date(),
      },
    });

    this.logger.log({
      event: 'notification.created',
      notificationId: notification.id,
      type: notification.notificationType,
      channel: notification.channel,
      userId: notification.userId,
    });

    return plainToInstance(NotificationResponseDto, notification);
  }

  /**
   * Liste des notifications d'un utilisateur
   */
  async findAllForUser(params: {
    userId: string;
    channel?: NotificationChannel;
    isRead?: boolean;
    skip?: number;
    take?: number;
  }): Promise<NotificationResponseDto[]> {
    const { userId, channel, isRead, skip = 0, take = 50 } = params;

    const where: any = { userId };

    if (channel) where.channel = channel;
    if (isRead !== undefined) {
      where.readAt = isRead ? { not: null } : null;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => plainToInstance(NotificationResponseDto, n));
  }

  /**
   * Notifications non lues
   */
  async findUnread(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
        channel: NotificationChannel.in_app,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => plainToInstance(NotificationResponseDto, n));
  }

  /**
   * Marquer comme lue
   */
  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification non trouvée');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
        status: NotificationStatus.read,
      },
    });

    this.logger.log({
      event: 'notification.read',
      notificationId: id,
      userId,
    });

    return plainToInstance(NotificationResponseDto, updated);
  }

  /**
   * Marquer toutes comme lues
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
        channel: NotificationChannel.in_app,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.read,
      },
    });

    this.logger.log({
      event: 'notification.mark_all_read',
      userId,
      count: result.count,
    });

    return { count: result.count };
  }

  /**
   * Supprimer une notification
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification non trouvée');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    this.logger.log({
      event: 'notification.deleted',
      notificationId: id,
      userId,
    });

    return { message: 'Notification supprimée' };
  }

  /**
   * Statistiques notifications
   */
  async getStats(userId: string): Promise<{
    total: number;
    unread: number;
    byChannel: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const [total, unread, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null, channel: NotificationChannel.in_app },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        select: { channel: true, notificationType: true },
      }),
    ]);

    const byChannel: Record<string, number> = {};
    const byType: Record<string, number> = {};

    notifications.forEach((n) => {
      byChannel[n.channel] = (byChannel[n.channel] || 0) + 1;
      byType[n.notificationType] = (byType[n.notificationType] || 0) + 1;
    });

    return { total, unread, byChannel, byType };
  }

  /**
   * Récupérer préférences (stockées dans user.settings)
   */
  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const settings = (user.settings as any) || {};
    const notifPrefs = settings.notifications || {};

    return {
      emailEnabled: notifPrefs.emailEnabled ?? true,
      smsEnabled: notifPrefs.smsEnabled ?? false,
      inAppEnabled: notifPrefs.inAppEnabled ?? true,
      eventPreferences: notifPrefs.eventPreferences || {
        complaints: true,
        feedback: true,
        surveys: true,
        suggestions: true,
      },
      quietHours: notifPrefs.quietHours || null,
    };
  }

  /**
   * Mettre à jour préférences
   */
  async updatePreferences(
    userId: string,
    preferences: NotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const settings = (user.settings as any) || {};

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        settings: {
          ...settings,
          notifications: preferences,
        } as any,
      },
    });

    this.logger.log({
      event: 'notification.preferences_updated',
      userId,
    });

    return preferences;
  }

  /**
   * Vérifier si user accepte notifications pour un type
   */
  async shouldNotify(
    userId: string,
    notificationType: string,
    channel: NotificationChannel,
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    // Vérifier canal activé
    if (channel === NotificationChannel.email && !preferences.emailEnabled) {
      return false;
    }
    if (channel === NotificationChannel.sms && !preferences.smsEnabled) {
      return false;
    }
    if (channel === NotificationChannel.in_app && !preferences.inAppEnabled) {
      return false;
    }

    // Vérifier préférences par type
    const eventKey = notificationType.split('.')[0]; // ex: "complaint.created" -> "complaint"
    if (preferences.eventPreferences && eventKey in preferences.eventPreferences) {
      return preferences.eventPreferences[eventKey];
    }

    return true;
  }
}
