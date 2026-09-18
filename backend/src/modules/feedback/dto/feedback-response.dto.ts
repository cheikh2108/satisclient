import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sentiment } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { FeedbackStatus } from './update-feedback.dto';

@Exclude()
export class FeedbackResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  siteId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  organizationId: string;

  @ApiPropertyOptional({ example: 4, description: 'Note 1-5' })
  @Expose()
  rating?: number;

  @ApiPropertyOptional({ example: 'Excellent service !' })
  @Expose()
  message?: string;

  @ApiProperty({ example: 'positive', enum: Sentiment })
  @Expose()
  sentiment: Sentiment;

  @ApiPropertyOptional({ example: 'Accueil' })
  @Expose()
  category?: string;

  @ApiProperty({ example: 'new', enum: FeedbackStatus })
  @Expose()
  status: string;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @Expose()
  customerName?: string;

  @ApiPropertyOptional({ example: 'jean@example.com' })
  @Expose()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @Expose()
  customerPhone?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  customerId?: string;

  @ApiPropertyOptional({ example: 'qr_code' })
  @Expose()
  source?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'Problème résolu' })
  @Expose()
  internalNotes?: string;

  @ApiPropertyOptional({ example: 'Merci pour votre retour' })
  @Expose()
  responseMessage?: string;

  @ApiPropertyOptional()
  @Expose()
  respondedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

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

  @ApiPropertyOptional({ description: 'Utilisateur assigné' })
  @Expose()
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<FeedbackResponseDto>) {
    Object.assign(this, partial);
  }
}
