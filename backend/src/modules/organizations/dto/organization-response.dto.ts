import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, OrganizationStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrganizationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'acme-corporation' })
  @Expose()
  slug: string;

  @ApiProperty({ example: 'contact@acme.com' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @Expose()
  logoUrl?: string;

  @ApiProperty({ example: '#3B82F6' })
  @Expose()
  primaryColor: string;

  @ApiPropertyOptional({ example: 'Bienvenue sur notre plateforme' })
  @Expose()
  welcomeMessage?: string;

  @ApiPropertyOptional()
  @Expose()
  website?: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional()
  @Expose()
  industry?: string;

  @ApiPropertyOptional()
  @Expose()
  country?: string;

  @ApiPropertyOptional()
  @Expose()
  billingEmail?: string;

  @ApiProperty({ example: 'essentialiel', enum: SubscriptionPlan })
  @Expose()
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty({ example: 'active', enum: OrganizationStatus })
  @Expose()
  subscriptionStatus: OrganizationStatus;

  @ApiPropertyOptional()
  @Expose()
  trialEndsAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  subscriptionStartsAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  subscriptionEndsAt?: Date;

  @ApiProperty({ example: 5, description: 'Nombre max de sites' })
  @Expose()
  maxSites: number;

  @ApiProperty({ example: 10, description: "Nombre max d'utilisateurs" })
  @Expose()
  maxUsers: number;

  @ApiProperty({ example: 5000, description: 'Nombre max de feedbacks/mois' })
  @Expose()
  maxMonthlyFeedbacks: number;

  @ApiProperty()
  @Expose()
  settings: any;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Statistics (optional, computed at runtime)
  @ApiPropertyOptional({ example: 3, description: 'Nombre de sites actuels' })
  @Expose()
  currentSitesCount?: number;

  @ApiPropertyOptional({ example: 7, description: "Nombre d'utilisateurs actuels" })
  @Expose()
  currentUsersCount?: number;

  @ApiPropertyOptional({ example: 1542, description: 'Feedbacks ce mois-ci' })
  @Expose()
  currentMonthlyFeedbacks?: number;

  constructor(partial: Partial<OrganizationResponseDto>) {
    Object.assign(this, partial);
  }
}
