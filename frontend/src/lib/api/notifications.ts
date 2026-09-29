import { apiClient, PaginatedResponse, wrapArrayResponse } from './client';
import type { Notification } from '@/types/api';

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  today?: number;
  byChannel?: Record<string, number>;
  byType?: Record<string, number>;
}

export const notificationsApi = {
  getAll: async (filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> => {
    const { data } = await apiClient.get<Notification[]>('/notifications', { params: filters });
    return wrapArrayResponse<Notification>(data);
  },

  getUnread: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>('/notifications/unread');
    return data;
  },

  getStats: async (): Promise<NotificationStats> => {
    const { data } = await apiClient.get<NotificationStats>('/notifications/stats');
    return data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
