import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SiteResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Agence Dakar Plateau' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'agence-dakar-plateau' })
  @Expose()
  code: string;

  @ApiProperty({ example: 'agency', enum: SiteType })
  @Expose()
  type: SiteType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  organizationId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({ example: 'contact@agence-dakar.sn' })
  @Expose()
  email?: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({ example: '10 Avenue Pompidou, Dakar, Sénégal' })
  @Expose()
  address?: string;

  @ApiPropertyOptional({ example: 'Dakar' })
  @Expose()
  city?: string;

  @ApiPropertyOptional({ example: 'Dakar' })
  @Expose()
  region?: string;

  @ApiPropertyOptional({ example: 'Sénégal' })
  @Expose()
  country?: string;

  @ApiPropertyOptional({ example: 14.6928 })
  @Expose()
  latitude?: number;

  @ApiPropertyOptional({ example: -17.4467 })
  @Expose()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Ouvert du lundi au vendredi, 8h-17h' })
  @Expose()
  openingHours?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @Expose()
  managerName?: string;

  @ApiPropertyOptional({ example: 'manager@agence-dakar.sn' })
  @Expose()
  managerEmail?: string;

  @ApiPropertyOptional({ example: '+221771234568' })
  @Expose()
  managerPhone?: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ example: 'https://qr-codes.satisclient.sn/abc123.png' })
  @Expose()
  qrCodeUrl?: string;

  @ApiPropertyOptional({ example: 'https://feedback.satisclient.sn/s/abc123' })
  @Expose()
  publicUrl?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Statistiques (optionnelles, calculées à la demande)
  @ApiPropertyOptional({ example: 142, description: 'Nombre de feedbacks' })
  @Expose()
  feedbacksCount?: number;

  @ApiPropertyOptional({ example: 8, description: 'Nombre de réclamations' })
  @Expose()
  complaintsCount?: number;

  @ApiPropertyOptional({ example: 5, description: 'Nombre de suggestions' })
  @Expose()
  suggestionsCount?: number;

  @ApiPropertyOptional({ example: 4.6, description: 'Note moyenne (1-5)' })
  @Expose()
  averageRating?: number;

  @ApiPropertyOptional({ example: 2, description: 'Nombre de sous-sites' })
  @Expose()
  childrenCount?: number;

  constructor(partial: Partial<SiteResponseDto>) {
    Object.assign(this, partial);
  }
}
