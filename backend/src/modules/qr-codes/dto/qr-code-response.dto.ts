import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class QrCodeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  organizationId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  siteId: string;

  @ApiProperty({ example: 'QR-AGE-DAK-001' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ example: 'feedback' })
  @Expose()
  targetType?: string;

  @ApiPropertyOptional()
  @Expose()
  targetId?: string;

  @ApiPropertyOptional({
    example: 'https://satisclient.sn/f/DKR-PLT',
  })
  @Expose()
  destinationUrl?: string;

  @ApiPropertyOptional({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
    description: 'QR code en base64 (PNG)',
  })
  @Expose()
  qrImageUrl?: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: 125 })
  @Expose()
  scanCount: number;

  @ApiPropertyOptional()
  @Expose()
  lastScannedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional()
  @Expose()
  site?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional()
  @Expose()
  organization?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  @Expose()
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<QrCodeResponseDto>) {
    Object.assign(this, partial);
  }
}
