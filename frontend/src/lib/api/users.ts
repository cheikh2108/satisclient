import { apiClient, PaginatedResponse } from "./client";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
} from "@/types/api";

export const usersApi = {
  getAll: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get<any>("/users", { params: filters });
    // Le backend retourne { data: [...], meta: {...} } ou un array direct
    if (data && typeof data === "object" && "data" in data) {
      return data as PaginatedResponse<User>;
    }
    const arr = Array.isArray(data) ? data : [];
    return {
      data: arr,
      meta: { total: arr.length, page: 1, pageSize: arr.length, totalPages: 1 },
    };
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  create: async (user: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<User>("/users", user);
    return data;
  },

  update: async (id: string, user: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, user);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },

  updateMe: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
  }): Promise<User> => {
    const { data: result } = await apiClient.patch<User>("/users/me", data);
    return result;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post("/users/me/password", data);
    return result;
  },

  getStats: async (): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    admins: number;
    byRole: Record<string, number>;
  }> => {
    const { data } = await apiClient.get("/users/stats");
    return data;
  },

  getPlatformStats: async (): Promise<{
    organizations: {
      total: number;
      active: number;
      trial: number;
      suspended: number;
    };
    users: { total: number; active: number; pending: number };
    sites: { total: number; active: number };
    activity: { totalFeedbacks: number; totalComplaints: number };
  }> => {
    const { data } = await apiClient.get("/users/platform-stats");
    return data;
  },

  updatePreferences: async (
    preferences: Record<string, unknown>,
  ): Promise<{ preferences: unknown }> => {
    const { data } = await apiClient.patch(
      "/users/me/preferences",
      preferences,
    );
    return data;
  },

  getSessions: async (): Promise<
    Array<{ id: string; expiresAt: string; createdAt: string }>
  > => {
    const { data } = await apiClient.get("/users/me/sessions");
    return Array.isArray(data) ? data : [];
  },

  revokeSession: async (tokenId: string): Promise<void> => {
    await apiClient.delete(`/users/me/sessions/${tokenId}`);
  },
};
