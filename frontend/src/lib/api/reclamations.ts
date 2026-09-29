import { apiClient, PaginatedResponse, wrapArrayResponse } from './client';
import type {
  Reclamation,
  CreateReclamationDto,
  UpdateReclamationDto,
  ReclamationFilters,
} from '@/types/api';

export const reclamationsApi = {
  getAll: async (filters?: ReclamationFilters): Promise<PaginatedResponse<Reclamation>> => {
    const { page = 1, pageSize = 20, ...rest } = filters ?? {};
    const skip = (page - 1) * pageSize;
    const { data } = await apiClient.get<Reclamation[]>('/complaints', {
      params: { ...rest, skip, take: pageSize, includeRelations: true },
    });
    return wrapArrayResponse<Reclamation>(data);
  },

  getById: async (id: string): Promise<Reclamation> => {
    const { data } = await apiClient.get<Reclamation>(`/complaints/${id}`);
    return data;
  },

  create: async (reclamation: CreateReclamationDto): Promise<Reclamation> => {
    const { data } = await apiClient.post<Reclamation>('/complaints', reclamation);
    return data;
  },

  update: async (id: string, reclamation: UpdateReclamationDto): Promise<Reclamation> => {
    const { data } = await apiClient.patch<Reclamation>(`/complaints/${id}`, reclamation);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/complaints/${id}`);
  },

  getStats: async (period = '30d'): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdueCount: number;
    criticalCount: number;
    averageResolutionTime: number;
    slaComplianceRate: number;
  }> => {
    const { data } = await apiClient.get('/complaints/stats', { params: { period } });
    return data;
  },
};
