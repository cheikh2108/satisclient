import { ApiProperty } from '@nestjs/swagger';

export class SiteComparisonItem {
  @ApiProperty()
  siteId: string;

  @ApiProperty({ example: 'Agence Dakar' })
  siteName: string;

  @ApiProperty({ example: 4.3, description: 'Rating moyen' })
  averageRating: number;

  @ApiProperty({ example: 250, description: 'Nombre feedbacks' })
  feedbackCount: number;

  @ApiProperty({ example: 12, description: 'Nombre réclamations' })
  complaintCount: number;

  @ApiProperty({ example: 91.7, description: 'Taux résolution (%)' })
  resolutionRate: number;

  @ApiProperty({ example: 42, description: 'Temps moyen résolution (h)' })
  avgResolutionTime: number;

  @ApiProperty({ example: 45, description: 'NPS' })
  npsScore?: number;

  @ApiProperty({ example: 85, description: 'Score performance global (0-100)' })
  performanceScore: number;

  @ApiProperty({ example: 2, description: 'Rang (1 = meilleur)' })
  rank: number;
}

export class ComparisonAnalyticsDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({
    type: [SiteComparisonItem],
    description: 'Liste sites triés par performance',
  })
  sites: SiteComparisonItem[];

  @ApiProperty({
    example: {
      averageRating: 4.1,
      avgResolutionRate: 78.5,
      avgResolutionTime: 48,
      avgNpsScore: 38,
    },
    description: 'Moyennes organisation',
  })
  organizationAverages: {
    averageRating: number;
    avgResolutionRate: number;
    avgResolutionTime: number;
    avgNpsScore?: number;
  };

  @ApiProperty({
    example: {
      bestRating: { siteId: 'xxx', siteName: 'Agence A', value: 4.8 },
      worstRating: { siteId: 'yyy', siteName: 'Agence B', value: 3.2 },
      bestResolution: { siteId: 'zzz', siteName: 'Agence C', value: 95 },
      worstResolution: { siteId: 'www', siteName: 'Agence D', value: 65 },
    },
    description: 'Extrêmes par métrique',
  })
  extremes: {
    bestRating: { siteId: string; siteName: string; value: number };
    worstRating: { siteId: string; siteName: string; value: number };
    bestResolution: { siteId: string; siteName: string; value: number };
    worstResolution: { siteId: string; siteName: string; value: number };
  };

  @ApiProperty({
    example: [
      {
        siteId: 'xxx',
        siteName: 'Agence Dakar',
        issues: ['Rating < moyenne', 'Temps résolution élevé'],
      },
    ],
    description: 'Sites nécessitant intervention',
  })
  sitesNeedingAttention: Array<{
    siteId: string;
    siteName: string;
    issues: string[];
  }>;
}
