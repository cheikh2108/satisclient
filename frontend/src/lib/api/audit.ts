import { apiClient, PaginatedResponse } from './client';

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
}

export interface AuditStats {
  total: number;
  today: number;
  activeUsers: number;
  errorRate: number;
  byActionType?: { create?: number; update?: number; delete?: number; auth?: number };
}

export const auditApi = {
  getLogs: async (filters?: AuditFilters & { organizationId?: string }): Promise<PaginatedResponse<AuditLog>> => {
    const { page = 1, pageSize = 20, ...rest } = filters ?? {};
    const skip = (page - 1) * pageSize;
    const { data } = await apiClient.get<AuditLog[]>('/audit/logs', {
      params: { ...rest, skip, take: pageSize },
    });
    const logs = Array.isArray(data) ? data : [];
    return { data: logs, meta: { total: logs.length, page, pageSize, totalPages: 1 } };
  },

  getStats: async (organizationId?: string): Promise<AuditStats> => {
    const { data } = await apiClient.get<any>('/audit/stats', {
      params: organizationId ? { organizationId } : {},
    });
    // Le backend retourne { totalActions, byUser, byEntityType }
    // On mappe vers notre interface
    const byUser = data.byUser || {};
    const activeUsers = Object.keys(byUser).length;
    const total = data.totalActions ?? 0;
    const today = (data.today ?? 0);
    const errorRate = data.errorRate ?? 0;
    return { total, today, activeUsers, errorRate, byActionType: data.byActionType };
  },
};
