import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { OrganizationStatus } from '@prisma/client';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @ApiPropertyOptional({
    example: 'active',
    description: 'Statut de l\'abonnement',
    enum: OrganizationStatus,
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  subscriptionStatus?: OrganizationStatus;
}
