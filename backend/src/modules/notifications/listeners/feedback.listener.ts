import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FeedbackCreatedEvent,
  FeedbackNegativeEvent,
  FeedbackProcessedEvent,
} from '../../../events/feedback.events';

/**
 * Listener pour les événements Feedback
 *
 * Gère l'envoi de notifications suite aux événements du cycle de vie des feedbacks.
 *
 * TODO Phase 2.1: Implémenter EmailService pour l'envoi réel
 */
@Injectable()
export class FeedbackListener {
  private readonly logger = new Logger(FeedbackListener.name);

  /**
   * Feedback créé → Notification interne (quality_manager)
   */
  @OnEvent('feedback.created', { async: true })
  async handleFeedbackCreated(event: FeedbackCreatedEvent) {
    this.logger.log({
      event: 'notification.feedback.created',
      feedbackId: event.feedbackId,
      organizationId: event.organizationId,
      siteId: event.siteId,
      sentiment: event.commentSentiment,
      rating: event.overallRating,
    });

    // TODO: Notifier quality_manager de l'organisation
    console.log(`📊 [SIMULATION] Notification interne - Nouveau feedback`);
    console.log(`   Site: ${event.siteName}`);
    console.log(`   Note: ${event.overallRating}/5`);
    console.log(`   Sentiment: ${event.commentSentiment}`);
    console.log(`   Canal: ${event.feedbackChannel}`);
  }

  /**
   * Feedback négatif → Alerte + Auto-conversion en Complaint si needsResponse
   */
  @OnEvent('feedback.negative', { async: true })
  async handleFeedbackNegative(event: FeedbackNegativeEvent) {
    this.logger.warn({
      event: 'notification.feedback.negative',
      feedbackId: event.feedbackId,
      organizationId: event.organizationId,
      siteId: event.siteId,
      rating: event.overallRating,
    });

    // TODO: Alerte quality_manager + service_manager
    console.log(`⚠️ [SIMULATION] ALERTE - Feedback négatif détecté`);
    console.log(`   Site: ${event.siteName}`);
    console.log(`   Note: ${event.overallRating}/5`);
    if (event.comment) {
      console.log(`   Commentaire: ${event.comment.substring(0, 100)}...`);
    }

    // TODO Phase 2.2: Auto-conversion en Complaint si critère rempli
    // if (event.overallRating <= 2 && event.comment) {
    //   await this.complaintsService.createFromFeedback(event.feedbackId);
    // }
  }

  /**
   * Feedback traité → Email de remerciement au client
   */
  @OnEvent('feedback.processed', { async: true })
  async handleFeedbackProcessed(event: FeedbackProcessedEvent) {
    this.logger.log({
      event: 'notification.feedback.processed',
      feedbackId: event.feedbackId,
    });

    if (event.respondentEmail) {
      // TODO: Implémenter envoi email
      console.log(`📧 [SIMULATION] Email envoyé à ${event.respondentEmail}`);
      console.log(`   Sujet: Merci pour votre retour`);
      console.log(`   Message: Votre feedback a été pris en compte...`);
    }
  }
}
