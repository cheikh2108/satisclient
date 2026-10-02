import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  SCALE = 'scale',
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  RATING = 'rating',
  NPS = 'nps',
  CSAT = 'csat',
  CES = 'ces',
  DATE = 'date',
  YES_NO = 'yes_no',
}

export interface QuestionOption {
  label: string;
  value: string | number;
}

export interface QuestionConfig {
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  rows?: number;
}

export interface SkipLogic {
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  goToQuestionId?: string;
  endSurvey?: boolean;
}

export class Question {
  @ApiProperty({ example: 'q1' })
  @IsString()
  id: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.RATING })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ example: 'Comment évaluez-vous notre service ?' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Donnez votre avis honnête' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ example: 1, description: "Ordre d'affichage (1, 2, 3...)" })
  @IsInt()
  order: number;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        label: { type: 'string', example: 'Excellent' },
        value: { type: 'string', example: '5' },
      },
    },
    example: [
      { label: 'Très insatisfait', value: '1' },
      { label: 'Insatisfait', value: '2' },
      { label: 'Neutre', value: '3' },
      { label: 'Satisfait', value: '4' },
      { label: 'Très satisfait', value: '5' },
    ],
  })
  @IsOptional()
  @IsArray()
  options?: QuestionOption[];

  @ApiPropertyOptional({
    example: { min: 0, max: 10, minLabel: 'Pas du tout probable', maxLabel: 'Très probable' },
  })
  @IsOptional()
  @IsObject()
  config?: QuestionConfig;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        condition: { type: 'string', example: 'equals' },
        value: { example: '1' },
        goToQuestionId: { type: 'string', example: 'q5' },
      },
    },
  })
  @IsOptional()
  @IsArray()
  skipLogic?: SkipLogic[];
}
