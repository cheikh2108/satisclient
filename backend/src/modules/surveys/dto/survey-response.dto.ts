import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { Question } from '../entities/question.entity';

@Exclude()
export class SurveyResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty({ type: [Question] })
  @Expose()
  questions: Question[];

  @ApiProperty({ type: [String] })
  @Expose()
  targetSiteIds: string[];

  @ApiProperty()
  @Expose()
  surveyType: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional()
  @Expose()
  startDate?: Date;

  @ApiPropertyOptional()
  @Expose()
  endDate?: Date;

  @ApiProperty()
  @Expose()
  settings: any;

  @ApiProperty()
  @Expose()
  totalResponses: number;

  @ApiPropertyOptional()
  @Expose()
  avgCompletionTime?: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional()
  @Expose()
  organization?: {
    id: string;
    name: string;
  };

  constructor(partial: Partial<SurveyResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class SurveyResponseItemDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  surveyId: string;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiPropertyOptional()
  @Expose()
  siteId?: string;

  @ApiPropertyOptional()
  @Expose()
  userId?: string;

  @ApiProperty()
  @Expose()
  isAnonymous: boolean;

  @ApiPropertyOptional()
  @Expose()
  respondentEmail?: string;

  @ApiProperty()
  @Expose()
  answers: Record<string, any>;

  @ApiPropertyOptional()
  @Expose()
  completionTimeSeconds?: number;

  @ApiProperty()
  @Expose()
  isCompleted: boolean;

  @ApiProperty()
  @Expose()
  submittedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  survey?: {
    id: string;
    title: string;
  };

  @ApiPropertyOptional()
  @Expose()
  site?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  @Expose()
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  constructor(partial: Partial<SurveyResponseItemDto>) {
    Object.assign(this, partial);
  }
}
