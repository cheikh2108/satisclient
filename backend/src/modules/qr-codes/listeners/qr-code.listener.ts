import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QrCodesService } from '../qr-codes.service';
import { FeedbackCreatedEvent } from '../../../events/feedback.events';

@Injectable()
export class QrCodeListener {
  private readonly logger = new Logger(QrCodeListener.name);

  constructor(private readonly qrCodesService: QrCodesService) {}

  /**
   * Incrémenter feedbackCount quand un feedback est créé via QR code
   */
  @OnEvent('feedback.created', { async: true })
  async handleFeedbackCreated(event: FeedbackCreatedEvent) {
    // Vérifier si le feedback a été créé via QR code
    if (!event.qrCode) {
      return;
    }

    try {
      await this.qrCodesService.incrementFeedback(event.qrCode);

      this.logger.log({
        event: 'qr_code.feedback_conversion',
        qrCode: event.qrCode,
        feedbackId: event.feedbackId,
        siteId: event.siteId,
      });
    } catch (error) {
      this.logger.error({
        event: 'qr_code.increment_feedback_error',
        qrCode: event.qrCode,
        error: error.message,
      });
    }
  }
}
