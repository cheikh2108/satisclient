import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEmail,
  MaxLength,
  MinLength,
  Matches,
  IsArray,
} from 'class-validator';
import { ComplaintPriority } from '@prisma/client';

export class CreateComplaintDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  siteId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  // Content
  @ApiProperty({
    example: 'Erreur de facturation sur ma dernière commande',
    description: 'Titre de la réclamation',
  })
  @IsString()
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @ApiProperty({
    example:
      'J\'ai été facturé deux fois pour la même prestation le 15 septembre 2026. ' +
      'Numéro de facture: FAC-2026-001234. Montant: 25000 FCFA. ' +
      'Je demande un remboursement rapide.',
    description: 'Description détaillée de la réclamation',
  })
  @IsString()
  @MinLength(20, {
    message: 'La description doit contenir au moins 20 caractères',
  })
  @MaxLength(5000, {
    message: 'La description ne peut pas dépasser 5000 caractères',
  })
  description: string;

  @ApiPropertyOptional({
    example: 'billing',
    description: 'Catégorie (billing, service, product, technical, other)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'double_charge',
    description: 'Sous-catégorie',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  subcategory?: string;

  // Priority
  @ApiProperty({
    example: 'high',
    enum: ComplaintPriority,
    description: 'Priorité: low, normal, high, urgent',
  })
  @IsEnum(ComplaintPriority)
  priority: ComplaintPriority;

  // Dates
  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Date de l\'incident',
  })
  @IsOptional()
  @IsDateString()
  incidentDate?: string;

  // Complainant
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de l\'utilisateur enregistré (si connecté)',
  })
  @IsOptional()
  @IsUUID()
  complainantUserId?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Réclamation anonyme',
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    example: 'Fatou Diallo',
    description: 'Nom du plaignant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complainantName?: string;

  @ApiPropertyOptional({
    example: 'fatou.diallo@example.com',
    description: 'Email du plaignant',
  })
  @IsOptional()
  @IsEmail()
  complainantEmail?: string;

  @ApiPropertyOptional({
    example: '+221771234567',
    description: 'Téléphone du plaignant (format E.164)',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le téléphone doit être au format international E.164',
  })
  complainantPhone?: string;

  // Attachments
  @ApiPropertyOptional({
    example: [
      {
        url: 'https://cdn.satisclient.com/attachments/facture.pdf',
        name: 'facture.pdf',
        type: 'application/pdf',
        size: 125000,
      },
    ],
    description: 'Pièces jointes (URL, nom, type, taille)',
  })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;

  // Related
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du feedback lié (si conversion depuis feedback)',
  })
  @IsOptional()
  @IsUUID()
  relatedFeedbackId?: string;

  // Metadata
  @ApiPropertyOptional({
    example: 'web',
    description: 'Source: web, mobile, phone, email',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
