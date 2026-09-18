import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { SiteType } from '@prisma/client';

export class CreateSiteDto {
  @ApiProperty({
    example: 'Agence Dakar Plateau',
    description: 'Nom du site',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @ApiProperty({
    example: 'agency',
    description: 'Type de site',
    enum: SiteType,
  })
  @IsEnum(SiteType, {
    message: 'Type invalide. Valeurs: organization, region, agency, service, point',
  })
  type: SiteType;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de l\'organisation propriétaire',
  })
  @IsUUID('4', { message: 'organizationId doit être un UUID valide' })
  organizationId: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID du site parent (pour hiérarchie)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'parentId doit être un UUID valide' })
  parentId?: string;

  @ApiPropertyOptional({
    example: 'contact@agence-dakar.sn',
    description: 'Email de contact du site',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({
    example: '+221771234567',
    description: 'Téléphone au format international E.164',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le téléphone doit être au format international E.164 (+221XXXXXXXXX)',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: '10 Avenue Pompidou, Dakar, Sénégal',
    description: 'Adresse complète du site',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    example: 'Dakar',
    description: 'Ville',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'Dakar',
    description: 'Région',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({
    example: 'Sénégal',
    description: 'Pays',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    example: 14.6928,
    description: 'Latitude GPS',
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    example: -17.4467,
    description: 'Longitude GPS',
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Ouvert du lundi au vendredi, 8h-17h',
    description: 'Horaires d\'ouverture',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openingHours?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Nom du responsable du site',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  managerName?: string;

  @ApiPropertyOptional({
    example: 'manager@agence-dakar.sn',
    description: 'Email du responsable',
  })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;

  @ApiPropertyOptional({
    example: '+221771234568',
    description: 'Téléphone du responsable',
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/)
  managerPhone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Le site est-il actif ?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
