import { Module } from '@nestjs/common';
import { ComplaintListener } from './listeners/complaint.listener';
import { FeedbackListener } from './listeners/feedback.listener';

@Module({
  providers: [ComplaintListener, FeedbackListener],
  exports: [],
})
export class NotificationsModule {}
