import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    example: 'J\'ai vérifié avec le service comptabilité. Le remboursement sera effectué sous 48h.',
    description: 'Commentaire ou note',
  })
  @IsString()
  @MinLength(5, { message: 'Le commentaire doit contenir au moins 5 caractères' })
  @MaxLength(2000, { message: 'Le commentaire ne peut pas dépasser 2000 caractères' })
  comment: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Note interne (non visible par le client)',
  })
  @IsOptional()
  @IsBoolean()
  internalNote?: boolean;
}
