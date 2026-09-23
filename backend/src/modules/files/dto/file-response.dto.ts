import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty({ example: 'image/png' })
  mimetype: string;

  @ApiProperty({ example: 1024768, description: 'Size in bytes' })
  size: number;

  @ApiProperty({ example: '/uploads/2024/09/file.png' })
  path: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional()
  relatedEntityId?: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  createdAt: Date;
}
