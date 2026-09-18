import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEmail,
  IsInt,
  Min,
} from 'class-validator';

export class CreateSurveyResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  surveyId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail()
  respondentEmail?: string;

  @ApiProperty({
    example: {
      q1: 9,
      q2: 'Excellent service, rapide et efficace',
      q3: ['option1', 'option3'],
      q4: 5,
    },
    description: 'Réponses avec questionId comme clé',
  })
  @IsObject()
  answers: Record<string, any>;

  @ApiPropertyOptional({
    example: 120,
    description: 'Temps de complétion en secondes',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  completionTimeSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
