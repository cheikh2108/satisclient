import { Sentiment } from '@prisma/client';

/**
 * Événement: Nouveau feedback créé
 */
export class FeedbackCreatedEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly organizationId: string,
    public readonly siteId: string,
    public readonly siteName: string,
    public readonly overallRating?: number,
    public readonly comment?: string,
    public readonly commentSentiment?: Sentiment,
    public readonly respondentEmail?: string,
    public readonly respondentName?: string,
    public readonly feedbackChannel?: string,
    public readonly needsResponse?: boolean,
    public readonly qrCode?: string,
  ) {}
}

/**
 * Événement: Feedback négatif (rating ≤ 2 ou sentiment negative)
 */
export class FeedbackNegativeEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly organizationId: string,
    public readonly siteId: string,
    public readonly siteName: string,
    public readonly overallRating?: number,
    public readonly comment?: string,
    public readonly respondentEmail?: string,
    public readonly respondentName?: string,
  ) {}
}

/**
 * Événement: Feedback traité
 */
export class FeedbackProcessedEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly organizationId: string,
    public readonly siteId: string,
    public readonly respondentEmail?: string,
  ) {}
}
