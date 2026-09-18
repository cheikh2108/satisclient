import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NPSAnalytics {
  @ApiProperty({ example: 42, description: 'NPS Score (-100 à +100)' })
  score: number;

  @ApiProperty({ example: 45, description: 'Promoteurs (9-10)' })
  promoters: number;

  @ApiProperty({ example: 35, description: 'Passifs (7-8)' })
  passives: number;

  @ApiProperty({ example: 20, description: 'Détracteurs (0-6)' })
  detractors: number;

  @ApiProperty({ example: 100, description: 'Total réponses NPS' })
  totalResponses: number;
}

export class CSATAnalytics {
  @ApiProperty({ example: 4.2, description: 'Score CSAT moyen (1-5)' })
  averageScore: number;

  @ApiProperty({ example: 85, description: 'Pourcentage satisfaits (4-5)' })
  satisfiedPercentage: number;

  @ApiProperty({ example: 100, description: 'Total réponses CSAT' })
  totalResponses: number;

  @ApiProperty({
    example: { '1': 2, '2': 5, '3': 10, '4': 35, '5': 48 },
    description: 'Distribution par note',
  })
  distribution: Record<string, number>;
}

export class CESAnalytics {
  @ApiProperty({ example: 2.8, description: 'Score CES moyen (1-7)' })
  averageScore: number;

  @ApiProperty({ example: 75, description: 'Pourcentage effort faible (1-3)' })
  lowEffortPercentage: number;

  @ApiProperty({ example: 100, description: 'Total réponses CES' })
  totalResponses: number;
}

export class SurveyAnalyticsDto {
  @ApiProperty()
  surveyId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ example: 250 })
  totalResponses: number;

  @ApiProperty({ example: 180 })
  completedResponses: number;

  @ApiProperty({ example: 72, description: 'Taux complétion (%)' })
  completionRate: number;

  @ApiProperty({ example: 145, description: 'Temps moyen complétion (secondes)' })
  avgCompletionTime: number;

  @ApiPropertyOptional({ type: NPSAnalytics })
  nps?: NPSAnalytics;

  @ApiPropertyOptional({ type: CSATAnalytics })
  csat?: CSATAnalytics;

  @ApiPropertyOptional({ type: CESAnalytics })
  ces?: CESAnalytics;

  @ApiProperty({
    example: {
      q1: { type: 'scale', avgScore: 8.5, distribution: { '0': 2, '5': 10, '10': 45 } },
      q2: { type: 'text', totalResponses: 120 },
      q3: {
        type: 'single_choice',
        distribution: { option1: 50, option2: 30, option3: 20 },
      },
    },
    description: 'Analytics par question',
  })
  questionAnalytics: Record<string, any>;

  @ApiProperty()
  startDate?: Date;

  @ApiProperty()
  endDate?: Date;
}
