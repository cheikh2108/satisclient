import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackMetrics {
  @ApiProperty({ example: 1250, description: 'Total feedbacks' })
  total: number;

  @ApiProperty({ example: 4.2, description: 'Rating moyen (1-5)' })
  averageRating: number;

  @ApiProperty({ example: 85, description: '% feedbacks positifs (rating >= 4)' })
  positivePercentage: number;

  @ApiProperty({
    example: { positive: 850, neutral: 200, negative: 200 },
    description: 'Distribution par sentiment',
  })
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };

  @ApiProperty({ example: 12, description: 'Feedbacks nécessitant réponse' })
  needsResponseCount: number;
}

export class ComplaintMetrics {
  @ApiProperty({ example: 45, description: 'Total réclamations' })
  total: number;

  @ApiProperty({ example: 15, description: 'Réclamations ouvertes' })
  open: number;

  @ApiProperty({ example: 30, description: 'Réclamations résolues' })
  resolved: number;

  @ApiProperty({ example: 66.7, description: 'Taux de résolution (%)' })
  resolutionRate: number;

  @ApiProperty({ example: 48, description: 'Temps moyen résolution (heures)' })
  avgResolutionTime: number;

  @ApiProperty({ example: 5, description: 'Réclamations en retard SLA' })
  overdueCount: number;

  @ApiProperty({
    example: { urgent: 5, high: 10, normal: 20, low: 10 },
    description: 'Distribution par priorité',
  })
  priorityDistribution: Record<string, number>;
}

export class SurveyMetrics {
  @ApiProperty({ example: 8, description: 'Questionnaires actifs' })
  activeCount: number;

  @ApiProperty({ example: 450, description: 'Total réponses' })
  totalResponses: number;

  @ApiProperty({ example: 42, description: 'NPS Score (-100 à +100)' })
  npsScore?: number;

  @ApiProperty({ example: 4.3, description: 'CSAT moyen (1-5)' })
  csatScore?: number;

  @ApiProperty({ example: 2.5, description: 'CES moyen (1-7, lower is better)' })
  cesScore?: number;

  @ApiProperty({ example: 75, description: 'Taux de complétion (%)' })
  completionRate: number;
}

export class PerformanceTrend {
  @ApiProperty({ example: '2024-09', description: 'Période (mois)' })
  period: string;

  @ApiProperty({ example: 4.2 })
  value: number;

  @ApiProperty({ example: 5.5, description: 'Variation vs période précédente (%)' })
  change?: number;
}

export class DashboardAnalyticsDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  organizationId: string;

  @ApiProperty({ example: 'Banque Atlantique' })
  organizationName: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({ type: FeedbackMetrics })
  feedbacks: FeedbackMetrics;

  @ApiProperty({ type: ComplaintMetrics })
  complaints: ComplaintMetrics;

  @ApiProperty({ type: SurveyMetrics })
  surveys: SurveyMetrics;

  @ApiProperty({
    example: [
      { period: '2024-07', value: 4.0, change: 0 },
      { period: '2024-08', value: 4.1, change: 2.5 },
      { period: '2024-09', value: 4.2, change: 2.4 },
    ],
    description: 'Évolution rating moyen (3 derniers mois)',
  })
  ratingTrend: PerformanceTrend[];

  @ApiProperty({
    example: [
      { siteId: 'xxx', siteName: 'Agence Dakar', rating: 3.5, complaintsCount: 15 },
      { siteId: 'yyy', siteName: 'Agence Thiès', rating: 3.8, complaintsCount: 12 },
    ],
    description: 'Sites nécessitant attention',
  })
  alertSites: Array<{
    siteId: string;
    siteName: string;
    rating: number;
    complaintsCount: number;
  }>;

  @ApiProperty({ example: 25, description: 'Total sites' })
  totalSites: number;

  @ApiProperty({ example: 1523, description: 'Total interactions' })
  totalInteractions: number;
}
