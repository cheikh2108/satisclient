import { PartialType } from '@nestjs/swagger';
import { CreateQrCodeDto } from './create-qr-code.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateQrCodeDto extends PartialType(CreateQrCodeDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Activer/désactiver le QR code',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
