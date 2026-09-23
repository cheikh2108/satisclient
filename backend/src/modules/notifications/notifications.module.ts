import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ComplaintListener } from './listeners/complaint.listener';
import { FeedbackListener } from './listeners/feedback.listener';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ComplaintListener,
    FeedbackListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
