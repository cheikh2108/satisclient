import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplaintPriority, ComplaintStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ComplaintResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  organizationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  siteId: string;

  @ApiProperty({ example: 'COMP-2024-001234' })
  @Expose()
  ticketNumber: string;

  @ApiProperty({ example: 'Erreur de facturation' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'Description détaillée...' })
  @Expose()
  description: string;

  @ApiPropertyOptional({ example: 'billing' })
  @Expose()
  category?: string;

  @ApiPropertyOptional({ example: 'double_charge' })
  @Expose()
  subcategory?: string;

  @ApiProperty({ example: 'high', enum: ComplaintPriority })
  @Expose()
  priority: ComplaintPriority;

  @ApiProperty({ example: 'in_progress', enum: ComplaintStatus })
  @Expose()
  status: ComplaintStatus;

  @ApiPropertyOptional({ example: '2026-09-15' })
  @Expose()
  incidentDate?: Date;

  @ApiPropertyOptional({
    example: '2026-09-20T17:00:00Z',
    description: 'Date limite SLA',
  })
  @Expose()
  slaDueDate?: Date;

  @ApiPropertyOptional()
  @Expose()
  firstResponseAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  closedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  complainantUserId?: string;

  @ApiProperty({ example: false })
  @Expose()
  isAnonymous: boolean;

  @ApiPropertyOptional({ example: 'Fatou Diallo' })
  @Expose()
  complainantName?: string;

  @ApiPropertyOptional({ example: 'fatou.diallo@example.com' })
  @Expose()
  complainantEmail?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @Expose()
  complainantPhone?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  assignedTo?: string;

  @ApiPropertyOptional()
  @Expose()
  assignedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  assignedBy?: string;

  @ApiPropertyOptional({ example: 'Remboursement effectué' })
  @Expose()
  resolutionSummary?: string;

  @ApiPropertyOptional({ example: 'fixed' })
  @Expose()
  resolutionCategory?: string;

  @ApiPropertyOptional({ example: 4 })
  @Expose()
  resolutionRating?: number;

  @ApiPropertyOptional({ example: 'Merci, problème résolu rapidement' })
  @Expose()
  resolutionComment?: string;

  @ApiPropertyOptional({
    example: [
      {
        url: 'https://cdn.satisclient.com/attachments/facture.pdf',
        name: 'facture.pdf',
        type: 'application/pdf',
        size: 125000,
      },
    ],
  })
  @Expose()
  attachments?: any[];

  @ApiProperty({ example: false })
  @Expose()
  isEscalated: boolean;

  @ApiPropertyOptional()
  @Expose()
  escalatedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  escalatedTo?: string;

  @ApiProperty({ example: false })
  @Expose()
  isOverdue: boolean;

  @ApiProperty({ example: false })
  @Expose()
  isCritical: boolean;

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @Expose()
  relatedComplaintIds?: string[];

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  relatedFeedbackId?: string;

  @ApiProperty({ example: 'web' })
  @Expose()
  source: string;

  @ApiPropertyOptional()
  @Expose()
  ipAddress?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  deletedAt?: Date;

  // Relations (optionnelles)
  @ApiPropertyOptional({ description: 'Informations du site' })
  @Expose()
  site?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional({ description: 'Informations de l\'organisation' })
  @Expose()
  organization?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Créateur (plaignant)' })
  @Expose()
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({ description: 'Agent assigné' })
  @Expose()
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<ComplaintResponseDto>) {
    Object.assign(this, partial);
  }
}
