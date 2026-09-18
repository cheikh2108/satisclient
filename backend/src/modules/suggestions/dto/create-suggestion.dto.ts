import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateSuggestionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  siteId: string;

  @ApiProperty({
    example: 'Ajouter une borne de recharge téléphone',
    description: 'Titre de la suggestion (5-200 caractères)',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Installer des bornes de recharge dans la salle d\'attente pour améliorer l\'expérience client',
    description: 'Description détaillée (20-5000 caractères)',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({
    example: 'infrastructure',
    description: 'Catégorie: product, service, process, infrastructure, other',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'Amélioration satisfaction client de 10%, réduction plaintes liées à l\'attente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  expectedImpact?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  submittedBy?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  submitterName?: string;

  @ApiPropertyOptional({ example: 'jean@example.com' })
  @IsOptional()
  @IsEmail()
  submitterEmail?: string;
}
