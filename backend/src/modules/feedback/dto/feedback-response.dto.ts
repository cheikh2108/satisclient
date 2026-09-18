import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sentiment } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FeedbackResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  siteId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  organizationId: string;

  @ApiPropertyOptional({ example: 4, description: 'Note globale 1-5' })
  @Expose()
  overallRating?: number;

  @ApiPropertyOptional({ description: 'Notes par critères' })
  @Expose()
  criteriaRatings?: Record<string, number>;

  @ApiPropertyOptional({ example: 'Excellent service !' })
  @Expose()
  comment?: string;

  @ApiProperty({ example: 'positive', enum: Sentiment })
  @Expose()
  commentSentiment: Sentiment;

  @ApiPropertyOptional({ example: ['service', 'excellent'] })
  @Expose()
  commentKeywords?: string[];

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId?: string;

  @ApiProperty({ example: false })
  @Expose()
  isAnonymous: boolean;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @Expose()
  respondentName?: string;

  @ApiPropertyOptional({ example: 'jean@example.com' })
  @Expose()
  respondentEmail?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @Expose()
  respondentPhone?: string;

  @ApiPropertyOptional({ example: '2026-09-18' })
  @Expose()
  serviceDate?: Date;

  @ApiProperty({ example: 'qr_code' })
  @Expose()
  feedbackChannel: string;

  @ApiProperty({ example: false })
  @Expose()
  isProcessed: boolean;

  @ApiPropertyOptional()
  @Expose()
  processedAt?: Date;

  @ApiProperty({ example: false })
  @Expose()
  needsResponse: boolean;

  @ApiPropertyOptional()
  @Expose()
  responseSentAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  ipAddress?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Relations (optionnelles)
  @ApiPropertyOptional({ description: 'Informations du site' })
  @Expose()
  site?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional({ description: 'Informations de l\'organisation' })
  @Expose()
  organization?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Utilisateur si connecté' })
  @Expose()
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<FeedbackResponseDto>) {
    Object.assign(this, partial);
  }
}
