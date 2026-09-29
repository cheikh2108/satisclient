import { apiClient, PaginatedResponse } from './client';
import type { QRCode, CreateQRCodeDto, UpdateQRCodeDto } from '@/types/api';

export interface QRCodeFilters {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  type?: string;
  organizationId?: string;
  siteId?: string;
}

export interface QRCodeStats {
  totalQrCodes: number;
  activeQrCodes: number;
  totalScans: number;
  totalFeedbacks: number;
  conversionRate: number;
}

export const qrCodesApi = {
  getAll: async (filters?: QRCodeFilters): Promise<PaginatedResponse<QRCode>> => {
    const { data } = await apiClient.get<QRCode[]>('/qr-codes', {
      params: { ...filters, includeRelations: true },
    });
    return { data, meta: { total: data.length, page: 1, pageSize: data.length, totalPages: 1 } };
  },

  getById: async (id: string): Promise<QRCode> => {
    const { data } = await apiClient.get<QRCode>(`/qr-codes/${id}`);
    return data;
  },

  create: async (dto: CreateQRCodeDto): Promise<QRCode> => {
    const { data } = await apiClient.post<QRCode>('/qr-codes', dto);
    return data;
  },

  update: async (id: string, dto: UpdateQRCodeDto): Promise<QRCode> => {
    const { data } = await apiClient.patch<QRCode>(`/qr-codes/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/qr-codes/${id}`);
  },

  regenerate: async (id: string): Promise<QRCode> => {
    const { data } = await apiClient.post<QRCode>(`/qr-codes/${id}/regenerate`);
    return data;
  },

  getStats: async (params?: { organizationId?: string; siteId?: string }): Promise<QRCodeStats> => {
    const { data } = await apiClient.get<QRCodeStats>('/qr-codes/stats', { params });
    return data;
  },
};
