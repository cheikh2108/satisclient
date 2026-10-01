import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class CreateQrCodeDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  siteId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    example: 'QR Code Kiosque Accueil',
    description: 'Nom descriptif du QR code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'kiosk',
    description: 'Type: kiosk, poster, ticket, table, email',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID du questionnaire lorsque le type est survey',
  })
  @IsOptional()
  @IsUUID()
  surveyId?: string;

  @ApiPropertyOptional({
    example: 'Accueil principal - Borne tactile',
    description: 'Description ou localisation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://app.satisclient.com/feedback/custom',
    description: 'URL personnalisée (si différente de la défaut)',
  })
  @IsOptional()
  @IsUrl()
  customUrl?: string;
}
