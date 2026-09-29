import { apiClient, PaginatedResponse } from './client';
import type { Site, CreateSiteDto, UpdateSiteDto, SiteFilters } from '@/types/api';

export const sitesApi = {
  getAll: async (filters?: SiteFilters): Promise<PaginatedResponse<Site>> => {
    const { data } = await apiClient.get<Site[]>('/sites', { params: filters });
    const arr = Array.isArray(data) ? data : [];
    return { data: arr, meta: { total: arr.length, page: 1, pageSize: arr.length, totalPages: 1 } };
  },

  getById: async (id: string): Promise<Site> => {
    const { data } = await apiClient.get<Site>(`/sites/${id}`);
    return data;
  },

  create: async (site: CreateSiteDto): Promise<Site> => {
    const { data } = await apiClient.post<Site>('/sites', site);
    return data;
  },

  update: async (id: string, site: UpdateSiteDto): Promise<Site> => {
    const { data } = await apiClient.patch<Site>(`/sites/${id}`, site);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sites/${id}`);
  },

  getStats: async (organizationId?: string): Promise<{ total: number; active: number; inactive: number; byType: Record<string, number> }> => {
    const { data } = await apiClient.get('/sites/stats', { params: organizationId ? { organizationId } : {} });
    return data;
  },
};
