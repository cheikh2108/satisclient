import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './create-feedback.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @ApiPropertyOptional({ description: 'Marquer comme traité' })
  @IsOptional()
  @IsBoolean()
  isProcessed?: boolean;

  @ApiPropertyOptional({ description: 'Date de traitement' })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

  @ApiPropertyOptional({ description: 'Date d\'envoi de la réponse' })
  @IsOptional()
  @IsDateString()
  responseSentAt?: string;
}
