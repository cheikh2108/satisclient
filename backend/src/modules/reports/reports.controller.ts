import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

const MIME = {
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv; charset=utf-8',
};
const EXT = { pdf: 'pdf', excel: 'xlsx', csv: 'csv' };

function streamReport(res: Response, buffer: Buffer, format: string, name: string) {
  const fmt = (format || 'pdf') as 'pdf' | 'excel' | 'csv';
  const date = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', MIME[fmt]);
  res.setHeader('Content-Disposition', `attachment; filename="${name}-${date}.${EXT[fmt]}"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
}

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('complaints')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({ summary: 'Générer rapport réclamations (PDF / Excel / CSV)' })
  async generateComplaintsReport(
    @Request() req,
    @Body()
    body: {
      startDate?: string;
      endDate?: string;
      format?: string;
      organizationId?: string;
      siteId?: string;
    },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateComplaintsReport({
      organizationId: orgId,
      siteId: body.siteId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
    });
    streamReport(res, buffer, body.format || 'pdf', 'reclamations');
  }

  @Post('analytics')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.director)
  @ApiOperation({ summary: 'Générer rapport analytics (PDF / Excel / CSV)' })
  async generateAnalyticsReport(
    @Request() req,
    @Body()
    body: {
      startDate?: string;
      endDate?: string;
      format?: string;
      organizationId?: string;
      siteId?: string;
    },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateAnalyticsReport({
      organizationId: orgId,
      siteId: body.siteId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
    });
    streamReport(res, buffer, body.format || 'pdf', 'analytics');
  }

  @Post('survey')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager)
  @ApiOperation({ summary: 'Générer rapport enquêtes (PDF / Excel / CSV)' })
  async generateSurveyReport(
    @Request() req,
    @Body() body: { surveyId?: string; format?: string; organizationId?: string },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateSurveyReport({
      surveyId: body.surveyId || '',
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
      organizationId: orgId,
    });
    streamReport(res, buffer, body.format || 'pdf', 'enquetes');
  }

  @Post('feedbacks')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.director)
  @ApiOperation({ summary: 'Générer rapport feedbacks (PDF / Excel / CSV)' })
  async generateFeedbacksReport(
    @Request() req,
    @Body()
    body: {
      startDate?: string;
      endDate?: string;
      format?: string;
      organizationId?: string;
      siteId?: string;
    },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateFeedbacksReport({
      organizationId: orgId,
      siteId: body.siteId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
    });
    streamReport(res, buffer, body.format || 'pdf', 'feedbacks');
  }

  @Post('users')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({ summary: 'Générer rapport utilisateurs (PDF / Excel / CSV)' })
  async generateUsersReport(
    @Request() req,
    @Body() body: { format?: string; organizationId?: string },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateUsersReport({
      organizationId: orgId,
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
    });
    streamReport(res, buffer, body.format || 'pdf', 'utilisateurs');
  }

  @Post('sites')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.super_admin, UserRole.org_admin, UserRole.quality_manager, UserRole.director)
  @ApiOperation({ summary: 'Générer rapport sites (PDF / Excel / CSV)' })
  async generateSitesReport(
    @Request() req,
    @Body() body: { format?: string; organizationId?: string },
    @Res() res: Response,
  ) {
    const orgId = body.organizationId || req.user?.organizationId;
    const buffer = await this.reportsService.generateSitesReport({
      organizationId: orgId,
      format: (body.format as 'pdf' | 'excel' | 'csv') || 'pdf',
    });
    streamReport(res, buffer, body.format || 'pdf', 'sites');
  }
}
