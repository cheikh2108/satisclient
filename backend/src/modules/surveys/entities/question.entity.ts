import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  id: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.RATING })
  type: QuestionType;

  @ApiProperty({ example: 'Comment évaluez-vous notre service ?' })
  title: string;

  @ApiPropertyOptional({ example: 'Donnez votre avis honnête' })
  description?: string;

  @ApiProperty({ example: true })
  required: boolean;

  @ApiProperty({ example: 1, description: 'Ordre d\'affichage (1, 2, 3...)' })
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
  options?: QuestionOption[];

  @ApiPropertyOptional({
    example: { min: 0, max: 10, minLabel: 'Pas du tout probable', maxLabel: 'Très probable' },
  })
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
  skipLogic?: SkipLogic[];
}
