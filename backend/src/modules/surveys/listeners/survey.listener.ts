import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SurveyCreatedEvent,
  SurveyResponseSubmittedEvent,
  SurveyCompletedEvent,
} from '../../../events/survey.events';

@Injectable()
export class SurveyListener {
  private readonly logger = new Logger(SurveyListener.name);

  /**
   * Questionnaire créé
   */
  @OnEvent('survey.created', { async: true })
  async handleSurveyCreated(event: SurveyCreatedEvent) {
    this.logger.log({
      event: 'notification.survey.created',
      surveyId: event.surveyId,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
    });

    // TODO: Envoyer notification aux managers
    console.log(`📊 [SIMULATION] Nouveau questionnaire créé: ${event.title}`);
    if (event.startDate) {
      console.log(`   Début: ${event.startDate.toLocaleDateString()}`);
    }
    if (event.endDate) {
      console.log(`   Fin: ${event.endDate.toLocaleDateString()}`);
    }
  }

  /**
   * Réponse soumise
   */
  @OnEvent('survey.response.submitted', { async: true })
  async handleResponseSubmitted(event: SurveyResponseSubmittedEvent) {
    this.logger.log({
      event: 'notification.survey.response_submitted',
      surveyId: event.surveyId,
      responseId: event.responseId,
      completionTime: event.completionTimeSeconds,
    });

    // TODO: Envoyer email de remerciement si respondentEmail présent
    if (event.respondentEmail) {
      console.log(
        `📧 [SIMULATION] Email remerciement envoyé à ${event.respondentEmail}`,
      );
      console.log(`   Questionnaire: ${event.surveyTitle}`);
      console.log(
        `   Temps de complétion: ${event.completionTimeSeconds}s`,
      );
    }
  }

  /**
   * Questionnaire terminé
   */
  @OnEvent('survey.completed', { async: true })
  async handleSurveyCompleted(event: SurveyCompletedEvent) {
    this.logger.log({
      event: 'notification.survey.completed',
      surveyId: event.surveyId,
      totalResponses: event.totalResponses,
    });

    // TODO: Envoyer rapport aux managers
    console.log(`📊 [SIMULATION] Questionnaire terminé: ${event.title}`);
    console.log(`   Total réponses: ${event.totalResponses}`);
    console.log(`   Rapport analytics disponible`);
  }
}
