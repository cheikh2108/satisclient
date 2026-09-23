import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { SuggestionStatus } from '@prisma/client';

@Exclude()
export class SuggestionResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  organizationId: string;

  @ApiProperty()
  @Expose()
  siteId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiPropertyOptional()
  @Expose()
  category?: string;

  @ApiPropertyOptional()
  @Expose()
  expectedImpact?: string;

  @ApiProperty({ enum: SuggestionStatus })
  @Expose()
  status: SuggestionStatus;

  @ApiPropertyOptional()
  @Expose()
  submittedBy?: string;

  @ApiPropertyOptional()
  @Expose()
  submitterName?: string;

  @ApiPropertyOptional()
  @Expose()
  submitterEmail?: string;

  @ApiProperty()
  @Expose()
  isAnonymous: boolean;

  @ApiPropertyOptional()
  @Expose()
  assignedTo?: string;

  @ApiPropertyOptional()
  @Expose()
  assignedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  implementationNotes?: string;

  @ApiPropertyOptional()
  @Expose()
  implementedAt?: Date;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  implementationProofUrls: string[];

  @ApiProperty()
  @Expose()
  upvotes: number;

  @ApiProperty()
  @Expose()
  downvotes: number;

  @ApiProperty({ example: 15, description: 'Score = upvotes - downvotes' })
  @Expose()
  score: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  site?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  @Expose()
  submitter?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  constructor(partial: Partial<SuggestionResponseDto>) {
    Object.assign(this, partial);
    // Calculer le score
    if (this.upvotes !== undefined && this.downvotes !== undefined) {
      this.score = this.upvotes - this.downvotes;
    }
  }
}
