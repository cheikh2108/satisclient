import { apiClient, PaginatedResponse, wrapArrayResponse } from './client';
import type {
  Feedback,
  CreateFeedbackDto,
  UpdateFeedbackDto,
  FeedbackFilters,
} from '@/types/api';

export const feedbacksApi = {
  getAll: async (filters?: FeedbackFilters): Promise<PaginatedResponse<Feedback>> => {
    const { page = 1, pageSize = 20, ...rest } = filters ?? {};
    const skip = (page - 1) * pageSize;
    const { data } = await apiClient.get<Feedback[]>('/feedbacks', {
      params: { ...rest, skip, take: pageSize, includeRelations: true },
    });
    return wrapArrayResponse<Feedback>(data);
  },

  getById: async (id: string): Promise<Feedback> => {
    const { data } = await apiClient.get<Feedback>(`/feedbacks/${id}`);
    return data;
  },

  create: async (feedback: CreateFeedbackDto): Promise<Feedback> => {
    const { data } = await apiClient.post<Feedback>('/feedbacks', feedback);
    return data;
  },

  update: async (id: string, feedback: UpdateFeedbackDto): Promise<Feedback> => {
    const { data } = await apiClient.patch<Feedback>(`/feedbacks/${id}`, feedback);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/feedbacks/${id}`);
  },

  getTimeseries: async (days = 15): Promise<Array<{ date: string; count: number; positive: number; satisfactionRate: number }>> => {
    const { data } = await apiClient.get('/feedbacks/timeseries', { params: { days } });
    return Array.isArray(data) ? data : [];
  },

  getStats: async (period = '30d'): Promise<{
    period: string;
    total: number;
    bySentiment: { positive: number; negative: number; neutral: number; unknown?: number };
    averageRating: number;
    responseRate: number;
    unprocessed: number;
    needsResponse: number;
  }> => {
    const { data } = await apiClient.get('/feedbacks/stats', { params: { period } });
    return data;
  },
};
