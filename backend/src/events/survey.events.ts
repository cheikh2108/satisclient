/**
 * Événement: Questionnaire créé
 */
export class SurveyCreatedEvent {
  constructor(
    public readonly surveyId: string,
    public readonly organizationId: string,
    public readonly title: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly targetSiteIds?: string[],
  ) {}
}

/**
 * Événement: Réponse soumise
 */
export class SurveyResponseSubmittedEvent {
  constructor(
    public readonly responseId: string,
    public readonly surveyId: string,
    public readonly surveyTitle: string,
    public readonly organizationId: string,
    public readonly siteId?: string,
    public readonly userId?: string,
    public readonly respondentEmail?: string,
    public readonly completionTimeSeconds?: number,
    public readonly answers?: Record<string, any>,
  ) {}
}

/**
 * Événement: Questionnaire terminé (endDate atteinte)
 */
export class SurveyCompletedEvent {
  constructor(
    public readonly surveyId: string,
    public readonly organizationId: string,
    public readonly title: string,
    public readonly totalResponses: number,
  ) {}
}
