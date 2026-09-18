import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsEnum,
  Matches,
} from 'class-validator';
import { Sentiment } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du site où le feedback est donné',
  })
  @IsUUID('4', { message: 'siteId doit être un UUID valide' })
  siteId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de l\'organisation (hérité du site)',
  })
  @IsUUID('4', { message: 'organizationId doit être un UUID valide' })
  organizationId: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Note de satisfaction (1-5 étoiles)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'La note minimum est 1' })
  @Max(5, { message: 'La note maximum est 5' })
  rating?: number;

  @ApiPropertyOptional({
    example: 'Excellent service, personnel très accueillant !',
    description: 'Message du feedback (optionnel si rating fourni)',
    minLength: 3,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Le message doit contenir au moins 3 caractères' })
  @MaxLength(5000, { message: 'Le message ne peut pas dépasser 5000 caractères' })
  message?: string;

  @ApiPropertyOptional({
    example: 'positive',
    description: 'Sentiment automatiquement détecté ou manuel',
    enum: Sentiment,
  })
  @IsOptional()
  @IsEnum(Sentiment)
  sentiment?: Sentiment;

  @ApiPropertyOptional({
    example: 'Accueil',
    description: 'Catégorie du feedback',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  // Informations client (optionnelles - feedback anonyme possible)
  @ApiPropertyOptional({
    example: 'Jean Dupont',
    description: 'Nom du client (optionnel)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional({
    example: 'jean.dupont@example.com',
    description: 'Email du client (optionnel)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  customerEmail?: string;

  @ApiPropertyOptional({
    example: '+221771234567',
    description: 'Téléphone du client (optionnel, format E.164)',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le téléphone doit être au format international E.164',
  })
  customerPhone?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du client enregistré (si connecté)',
  })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional({
    example: 'mobile',
    description: 'Source du feedback (mobile, web, qr_code, kiosk, email)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'Adresse IP du client',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0...',
    description: 'User agent du navigateur',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
