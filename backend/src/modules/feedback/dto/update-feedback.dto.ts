import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './create-feedback.dto';
import { IsOptional, IsEnum, IsUUID, IsString, MaxLength } from 'class-validator';

// Statuts possibles pour le traitement du feedback
export enum FeedbackStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @ApiPropertyOptional({
    example: 'in_progress',
    description: 'Statut du traitement du feedback',
    enum: FeedbackStatus,
  })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de l\'utilisateur assigné au traitement',
  })
  @IsOptional()
  @IsUUID('4')
  assignedToId?: string;

  @ApiPropertyOptional({
    example: 'Problème résolu. Client rappelé et satisfait.',
    description: 'Note interne de traitement',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @ApiPropertyOptional({
    example: 'Merci pour votre retour. Nous avons corrigé le problème.',
    description: 'Réponse publique au client',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  responseMessage?: string;
}
