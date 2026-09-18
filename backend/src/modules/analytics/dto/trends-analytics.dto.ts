import { ApiProperty } from '@nestjs/swagger';

export class TrendDataPoint {
  @ApiProperty({ example: '2024-09-01' })
  date: string;

  @ApiProperty({ example: 4.2 })
  value: number;

  @ApiProperty({ example: 125, description: 'Nombre de data points' })
  count: number;
}

export class TrendsAnalyticsDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({
    example: [
      { date: '2024-07-01', value: 4.0, count: 120 },
      { date: '2024-08-01', value: 4.1, count: 135 },
      { date: '2024-09-01', value: 4.2, count: 125 },
    ],
    description: 'Évolution rating moyen',
  })
  ratingTrend: TrendDataPoint[];

  @ApiProperty({
    example: [
      { date: '2024-07-01', value: 12, count: 12 },
      { date: '2024-08-01', value: 15, count: 15 },
      { date: '2024-09-01', value: 10, count: 10 },
    ],
    description: 'Évolution nombre réclamations',
  })
  complaintsTrend: TrendDataPoint[];

  @ApiProperty({
    example: [
      { date: '2024-07-01', value: 42, count: 50 },
      { date: '2024-08-01', value: 45, count: 55 },
      { date: '2024-09-01', value: 48, count: 60 },
    ],
    description: 'Évolution NPS',
  })
  npsTrend: TrendDataPoint[];

  @ApiProperty({
    example: [
      { date: '2024-07-01', value: 150, count: 150 },
      { date: '2024-08-01', value: 180, count: 180 },
      { date: '2024-09-01', value: 170, count: 170 },
    ],
    description: 'Volume d\'interactions',
  })
  volumeTrend: TrendDataPoint[];

  @ApiProperty({
    example: {
      rating: 5.0,
      complaints: -16.7,
      nps: 14.3,
      volume: -5.6,
    },
    description: 'Variations % sur la période',
  })
  changes: Record<string, number>;

  @ApiProperty({
    example: {
      rating: 'improving',
      complaints: 'improving',
      nps: 'improving',
      volume: 'declining',
    },
    description: 'Tendance générale (improving, stable, declining)',
  })
  directions: Record<string, 'improving' | 'stable' | 'declining'>;

  @ApiProperty({
    example: [
      { date: '2024-09-15', type: 'rating_drop', message: 'Chute rating site Dakar' },
      { date: '2024-09-20', type: 'complaint_spike', message: 'Pic réclamations' },
    ],
    description: 'Événements notables',
  })
  events: Array<{
    date: string;
    type: string;
    message: string;
  }>;
}
