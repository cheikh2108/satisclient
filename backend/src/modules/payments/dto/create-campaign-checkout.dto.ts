import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export const CAMPAIGN_PACKAGE_CODES = ['single', 'frequency2', 'frequency3', 'frequency4'] as const;

export class CreateCampaignCheckoutDto {
  @ApiProperty({ enum: CAMPAIGN_PACKAGE_CODES, example: 'frequency2' })
  @IsString()
  @IsIn(CAMPAIGN_PACKAGE_CODES)
  packageCode: (typeof CAMPAIGN_PACKAGE_CODES)[number];
}
