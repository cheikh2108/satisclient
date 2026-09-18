import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto';
import { SiteAnalyticsDto } from './dto/site-analytics.dto';
import { TrendsAnalyticsDto } from './dto/trends-analytics.dto';
import { ComparisonAnalyticsDto } from './dto/comparison-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, OrganizationGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Dashboard global organisation',
    description:
      'Vue d\'ensemble: feedbacks, complaints, surveys, tendances, sites à risque',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Date début (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Date fin (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics',
    type: DashboardAnalyticsDto,
  })
  async getDashboard(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardAnalyticsDto> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getDashboard(organizationId, start, end);
  }

  @Get('sites/:siteId')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
    UserRole.service_manager,
  )
  @ApiOperation({
    summary: 'Analytics site spécifique',
    description:
      'Performance détaillée: scores, top problèmes, tendances, comparaison',
  })
  @ApiParam({ name: 'siteId', description: 'ID du site' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Analytics du site',
    type: SiteAnalyticsDto,
  })
  @ApiResponse({ status: 404, description: 'Site non trouvé' })
  async getSiteAnalytics(
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SiteAnalyticsDto> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getSiteAnalytics(siteId, start, end);
  }

  @Get('trends')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Tendances temporelles',
    description:
      'Évolution des KPIs: rating, complaints, NPS, volume d\'interactions',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Tendances',
    type: TrendsAnalyticsDto,
  })
  async getTrends(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TrendsAnalyticsDto> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getTrends(organizationId, start, end);
  }

  @Get('compare')
  @Roles(
    UserRole.super_admin,
    UserRole.org_admin,
    UserRole.director,
    UserRole.quality_manager,
  )
  @ApiOperation({
    summary: 'Comparaison sites',
    description:
      'Benchmarking des sites: classement, moyennes org, extrêmes, sites à risque',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Comparaison',
    type: ComparisonAnalyticsDto,
  })
  async compareSites(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ComparisonAnalyticsDto> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.compareSites(organizationId, start, end);
  }
}
