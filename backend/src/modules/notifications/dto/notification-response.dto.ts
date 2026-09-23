import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

@Exclude()
export class NotificationResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiPropertyOptional()
  @Expose()
  userId?: string;

  @ApiProperty()
  @Expose()
  notificationType: string;

  @ApiProperty({ enum: NotificationChannel })
  @Expose()
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationStatus })
  @Expose()
  status: NotificationStatus;

  @ApiPropertyOptional()
  @Expose()
  subject?: string;

  @ApiProperty()
  @Expose()
  body: string;

  @ApiPropertyOptional()
  @Expose()
  relatedEntityType?: string;

  @ApiPropertyOptional()
  @Expose()
  relatedEntityId?: string;

  @ApiProperty()
  @Expose()
  scheduledFor: Date;

  @ApiPropertyOptional()
  @Expose()
  sentAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  readAt?: Date;

  @ApiProperty({ example: false })
  @Expose()
  isRead: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<NotificationResponseDto>) {
    Object.assign(this, partial);
    this.isRead = !!this.readAt;
  }
}
