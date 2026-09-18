import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateComplaintDto } from './create-complaint.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {
  @ApiPropertyOptional({
    example: 'in_progress',
    enum: ComplaintStatus,
    description:
      'Statut: received, qualified, assigned, in_progress, awaiting_info, ' +
      'transferred, on_hold, resolved, closed, rejected, reopened',
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({
    example: 'high',
    enum: ComplaintPriority,
    description: 'Modifier la priorité',
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Assigner à un utilisateur',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    example:
      'Le remboursement a été effectué le 18/09/2026. Transaction ID: TRX-2026-567890.',
    description: 'Résumé de la résolution',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionSummary?: string;

  @ApiPropertyOptional({
    example: 'fixed',
    description:
      'Catégorie de résolution: fixed, wont_fix, duplicate, not_a_bug, cannot_reproduce',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  resolutionCategory?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Marquer comme critique',
  })
  @IsOptional()
  isCritical?: boolean;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Escalader vers un superviseur',
  })
  @IsOptional()
  @IsUUID()
  escalatedTo?: string;
}
