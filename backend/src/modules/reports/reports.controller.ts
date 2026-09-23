import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('complaints')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Générer rapport réclamations',
    description: 'Génère un rapport PDF ou Excel des réclamations',
  })
  @ApiResponse({
    status: 201,
    description: 'Rapport généré',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: '/reports/complaints-2024-09.pdf' },
      },
    },
  })
  async generateComplaintsReport(
    @Body()
    body: {
      organizationId: string;
      startDate: string;
      endDate: string;
      format?: 'pdf' | 'excel';
    },
  ): Promise<{ url: string }> {
    return this.reportsService.generateComplaintsReport({
      organizationId: body.organizationId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      format: body.format || 'pdf',
    });
  }

  @Post('survey')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({
    summary: 'Générer rapport questionnaire',
    description: 'Génère un rapport analytics d\'un questionnaire',
  })
  @ApiResponse({ status: 201, description: 'Rapport généré' })
  async generateSurveyReport(
    @Body() body: { surveyId: string; format?: 'pdf' | 'excel' },
  ): Promise<{ url: string }> {
    return this.reportsService.generateSurveyReport({
      surveyId: body.surveyId,
      format: body.format || 'pdf',
    });
  }

  @Post('analytics')
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.director)
  @ApiOperation({
    summary: 'Générer rapport analytics',
    description: 'Génère un rapport complet d\'analytics',
  })
  @ApiResponse({ status: 201, description: 'Rapport généré' })
  async generateAnalyticsReport(
    @Body()
    body: {
      organizationId: string;
      startDate: string;
      endDate: string;
      format?: 'pdf' | 'excel';
    },
  ): Promise<{ url: string }> {
    return this.reportsService.generateAnalyticsReport({
      organizationId: body.organizationId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      format: body.format || 'pdf',
    });
  }
}
