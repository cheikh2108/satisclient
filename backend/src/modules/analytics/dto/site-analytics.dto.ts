import { ApiProperty } from '@nestjs/swagger';

export class SitePerformanceScore {
  @ApiProperty({ example: 82, description: 'Score global (0-100)' })
  overall: number;

  @ApiProperty({ example: 85, description: 'Score satisfaction' })
  satisfaction: number;

  @ApiProperty({ example: 78, description: 'Score gestion réclamations' })
  complaintHandling: number;

  @ApiProperty({ example: 90, description: 'Score réactivité' })
  responsiveness: number;
}

export class SiteComparisonData {
  @ApiProperty({ example: 4.2, description: 'Performance du site' })
  siteValue: number;

  @ApiProperty({ example: 4.0, description: 'Moyenne organisation' })
  orgAverage: number;

  @ApiProperty({ example: 4.5, description: 'Meilleur site' })
  bestSite: number;

  @ApiProperty({ example: 3.5, description: 'Moins bon site' })
  worstSite: number;
}

export class TopIssue {
  @ApiProperty({ example: 'Temps d\'attente' })
  category: string;

  @ApiProperty({ example: 25, description: 'Nombre d\'occurrences' })
  count: number;

  @ApiProperty({ example: 55.6, description: '% du total' })
  percentage: number;
}

export class SiteAnalyticsDto {
  @ApiProperty()
  siteId: string;

  @ApiProperty({ example: 'Agence Dakar Centre' })
  siteName: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({ type: SitePerformanceScore })
  performanceScore: SitePerformanceScore;

  @ApiProperty({ example: 320, description: 'Total feedbacks reçus' })
  totalFeedbacks: number;

  @ApiProperty({ example: 4.3, description: 'Rating moyen (1-5)' })
  averageRating: number;

  @ApiProperty({ type: SiteComparisonData, description: 'Comparaison rating' })
  ratingComparison: SiteComparisonData;

  @ApiProperty({ example: 12, description: 'Total réclamations' })
  totalComplaints: number;

  @ApiProperty({ example: 83.3, description: 'Taux résolution (%)' })
  complaintResolutionRate: number;

  @ApiProperty({ example: 36, description: 'Temps moyen résolution (heures)' })
  avgComplaintResolutionTime: number;

  @ApiProperty({
    example: [
      { category: 'Temps d\'attente', count: 15, percentage: 50 },
      { category: 'Accueil', count: 8, percentage: 26.7 },
      { category: 'Propreté', count: 7, percentage: 23.3 },
    ],
    description: 'Top 3 problèmes récurrents',
  })
  topIssues: TopIssue[];

  @ApiProperty({
    example: {
      accueil: 4.5,
      propreté: 4.2,
      rapidité: 3.8,
      compétence: 4.4,
    },
    description: 'Ratings par critère',
  })
  criteriaScores: Record<string, number>;

  @ApiProperty({
    example: [
      { period: '2024-07', value: 4.0 },
      { period: '2024-08', value: 4.2 },
      { period: '2024-09', value: 4.3 },
    ],
    description: 'Évolution sur 3 mois',
  })
  trend: Array<{ period: string; value: number }>;

  @ApiProperty({
    example: {
      morning: 45,
      afternoon: 38,
      evening: 17,
    },
    description: 'Distribution temporelle des interactions',
  })
  timeDistribution: Record<string, number>;

  @ApiProperty({ example: 42, description: 'NPS du site' })
  npsScore?: number;

  @ApiProperty({
    example: [
      'Rating en baisse depuis 2 mois',
      'Temps résolution complaints supérieur à la moyenne',
    ],
    description: 'Points d\'attention',
  })
  alerts: string[];
}
