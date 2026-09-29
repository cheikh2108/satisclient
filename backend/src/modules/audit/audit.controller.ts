import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({
    summary: 'Liste logs audit',
    description: 'Récupère l\'historique des actions utilisateurs',
  })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste des logs audit' })
  async findAll(
    @Request() req,
    @Query('organizationId') organizationId?: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ): Promise<any[]> {
    const orgId = organizationId || req.user?.organizationId;
    const requesterRole = req.user?.role;
    return this.auditService.findAll({
      organizationId: orgId,
      userId,
      entityType,
      skip,
      take,
      excludeSuperAdminLogs: requesterRole !== 'super_admin',
    });
  }

  @Get('stats')
  @Roles(UserRole.super_admin, UserRole.org_admin)
  @ApiOperation({ summary: 'Stats audit' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiResponse({ status: 200, description: 'Statistiques audit' })
  async getStats(@Request() req, @Query('organizationId') organizationId?: string): Promise<any> {
    const orgId = organizationId || req.user?.organizationId;
    const excludeSuperAdmin = req.user?.role !== 'super_admin';
    return this.auditService.getStats(orgId, excludeSuperAdmin);
  }
}
