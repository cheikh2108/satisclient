import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsHexColor,
  IsEnum,
} from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Nom de l\'organisation',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Email de contact de l\'organisation',
  })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: '+221771234567',
    description: 'Téléphone au format international E.164',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le téléphone doit être au format international E.164 (+221XXXXXXXXX)',
  })
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL du logo de l\'organisation',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Couleur principale de la marque (format hexadécimal)',
    default: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsHexColor({ message: 'La couleur doit être au format hexadécimal (#RRGGBB)' })
  primaryColor?: string;

  @ApiProperty({
    example: 'Bienvenue sur notre plateforme de satisfaction client',
    description: 'Message de bienvenue personnalisé',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeMessage?: string;

  @ApiProperty({
    example: 'essentialiel',
    description: 'Plan d\'abonnement',
    enum: SubscriptionPlan,
    default: 'essentialiel',
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;
}
