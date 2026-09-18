import { PartialType } from '@nestjs/swagger';
import { CreateSurveyDto } from './create-survey.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  @ApiPropertyOptional({ example: true, description: 'Activer/désactiver le questionnaire' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
