import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
  MaxLength,
  MinLength,
  IsObject,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Question } from '../entities/question.entity';

export enum SurveyType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  CONTINUOUS = 'continuous',
}

export class SurveySettings {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  showProgressBar?: boolean;

  @ApiPropertyOptional({ example: 'Merci pour votre participation !' })
  @IsOptional()
  @IsString()
  thankYouMessage?: string;

  @ApiPropertyOptional({ example: 1, description: 'Limiter réponses par user' })
  @IsOptional()
  maxResponsesPerUser?: number;
}

export class CreateSurveyDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'Enquête Satisfaction Client Q4 2024' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Enquête trimestrielle pour évaluer la qualité de nos services',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    type: [Question],
    description: 'Liste des questions du questionnaire',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Question)
  questions: Question[];

  @ApiProperty({
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    description: 'IDs des sites ciblés',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  targetSiteIds: string[];

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Crédit de campagne utilisé pour ce questionnaire',
  })
  @IsOptional()
  @IsUUID()
  campaignPackId?: string;

  @ApiPropertyOptional({
    enum: SurveyType,
    example: SurveyType.ONE_TIME,
    description: 'one_time, recurring, continuous',
  })
  @IsOptional()
  @IsEnum(SurveyType)
  surveyType?: SurveyType;

  @ApiPropertyOptional({ example: '2024-09-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ type: SurveySettings })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SurveySettings)
  settings?: SurveySettings;
}
