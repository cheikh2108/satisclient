import { apiClient, PaginatedResponse, wrapArrayResponse } from './client';
import type { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '@/types/api';

export interface OrganizationFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  plan?: string;
}

export interface OrganizationStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  totalSites: number;
  totalUsers: number;
}

export const organizationsApi = {
  getAll: async (filters?: OrganizationFilters): Promise<PaginatedResponse<Organization>> => {
    const { data } = await apiClient.get<Organization[]>('/organizations', { params: filters });
    return wrapArrayResponse<Organization>(data);
  },

  getById: async (id: string): Promise<Organization> => {
    const { data } = await apiClient.get<Organization>(`/organizations/${id}`);
    return data;
  },

  create: async (org: CreateOrganizationDto): Promise<Organization> => {
    const { data } = await apiClient.post<Organization>('/organizations', org);
    return data;
  },

  update: async (id: string, org: UpdateOrganizationDto): Promise<Organization> => {
    const { data } = await apiClient.patch<Organization>(`/organizations/${id}`, org);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`);
  },

  getStats: async (): Promise<OrganizationStats> => {
    const { data } = await apiClient.get<Organization[]>('/organizations');
    const arr = Array.isArray(data) ? data : [];
    return {
      total: arr.length,
      active: arr.filter((o) => (o.subscriptionStatus || '').toLowerCase() === 'active').length,
      trial: arr.filter((o) => (o.subscriptionStatus || '').toLowerCase() === 'trial').length,
      suspended: arr.filter((o) => (o.subscriptionStatus || '').toLowerCase() === 'suspended').length,
      totalSites: arr.reduce((acc, o) => acc + (o.maxSites || 0), 0),
      totalUsers: arr.reduce((acc, o) => acc + (o.maxUsers || 0), 0),
    };
  },
};
