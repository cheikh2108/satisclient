import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(params: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    organizationId: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          organizationId: params.organizationId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          success: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log action:', error);
    }
  }

  async findAll(params: {
    organizationId: string;
    userId?: string;
    entityType?: string;
    skip?: number;
    take?: number;
    excludeSuperAdminLogs?: boolean;
  }): Promise<any[]> {
    const where: any = { organizationId: params.organizationId };
    if (params.userId) where.userId = params.userId;
    if (params.entityType) where.entityType = params.entityType;

    // org_admin ne voit pas les actions des super_admin
    if (params.excludeSuperAdminLogs) {
      where.user = { role: { not: 'super_admin' } };
    }

    return this.prisma.auditLog.findMany({
      where,
      skip: params.skip ?? 0,
      take: params.take ?? 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        userEmail: true,
        action: true,
        entityType: true,
        entityId: true,
        ipAddress: true,
        success: true,
        errorMessage: true,
        createdAt: true,
      },
    });
  }

  async getStats(organizationId: string, excludeSuperAdminLogs = false): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseWhere: any = { organizationId };
    if (excludeSuperAdminLogs) {
      baseWhere.user = { role: { not: 'super_admin' } };
    }

    const [total, todayCount, byEntityType, errorCount] = await Promise.all([
      this.prisma.auditLog.count({ where: baseWhere }),
      this.prisma.auditLog.count({ where: { ...baseWhere, createdAt: { gte: today } } }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where: baseWhere,
        _count: true,
      }),
      this.prisma.auditLog.count({ where: { ...baseWhere, success: false } }),
    ]);

    const [activeUsersList, allActions] = await Promise.all([
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { ...baseWhere, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        _count: true,
      }),
      this.prisma.auditLog.findMany({
        where: baseWhere,
        select: { action: true },
      }),
    ]);

    const byActionType = allActions.reduce((acc, log) => {
      const a = (log.action || '').toLowerCase();
      if (a.includes('create') || a.includes('created')) acc.create = (acc.create || 0) + 1;
      else if (a.includes('update') || a.includes('updated') || a.includes('edit')) acc.update = (acc.update || 0) + 1;
      else if (a.includes('delete') || a.includes('deleted') || a.includes('remove')) acc.delete = (acc.delete || 0) + 1;
      else if (a.includes('login') || a.includes('logout') || a.includes('auth')) acc.auth = (acc.auth || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions: total,
      today: todayCount,
      activeUsers: activeUsersList.length,
      errorRate: total > 0 ? Math.round((errorCount / total) * 100 * 10) / 10 : 0,
      byEntityType: byEntityType.reduce((acc, e) => ({ ...acc, [e.entityType]: e._count }), {}),
      byActionType,
    };
  }
}
