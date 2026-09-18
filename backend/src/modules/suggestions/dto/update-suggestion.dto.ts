import { PartialType } from '@nestjs/swagger';
import { CreateSuggestionDto } from './create-suggestion.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SuggestionStatus } from '@prisma/client';

export class UpdateSuggestionDto extends PartialType(CreateSuggestionDto) {
  @ApiPropertyOptional({
    enum: SuggestionStatus,
    example: SuggestionStatus.approved,
  })
  @IsOptional()
  @IsEnum(SuggestionStatus)
  status?: SuggestionStatus;

  @ApiPropertyOptional({
    example: 'Notes d\'implémentation: Budget validé, planning Q4 2024',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  implementationNotes?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://photos.example.com/proof1.jpg'],
  })
  @IsOptional()
  implementationProofUrls?: string[];
}
