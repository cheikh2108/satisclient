import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUUID,
  Min,
  Max,
  IsDateString,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  siteId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  // Rating
  @ApiPropertyOptional({ example: 4, description: 'Note globale 1-5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @ApiPropertyOptional({
    description: 'Notes par critères (ex: {"accueil": 5, "propreté": 4})',
    example: { accueil: 5, propreté: 4, rapidité: 3 },
  })
  @IsOptional()
  @IsObject()
  criteriaRatings?: Record<string, number>;

  // Comment
  @ApiPropertyOptional({ example: 'Excellent service, très satisfait !' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  // Respondent
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: true, description: 'Feedback anonyme' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  respondentName?: string;

  @ApiPropertyOptional({ example: 'jean@example.com' })
  @IsOptional()
  @IsEmail()
  respondentEmail?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le téléphone doit être au format international E.164',
  })
  respondentPhone?: string;

  // Context
  @ApiPropertyOptional({
    example: '2026-09-18',
    description: 'Date du service évalué',
  })
  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @ApiPropertyOptional({
    example: 'qr_code',
    description: 'Canal: web, qr_code, sms, email, kiosk',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  feedbackChannel?: string;

  @ApiPropertyOptional({
    example: 'QR-AGE-001',
    description: 'Code du QR code utilisé (si feedbackChannel = qr_code)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  qrCode?: string;

  // Processing flags
  @ApiPropertyOptional({
    example: false,
    description: 'Demande une réponse de l\'organisation',
  })
  @IsOptional()
  @IsBoolean()
  needsResponse?: boolean;

  // Metadata
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
