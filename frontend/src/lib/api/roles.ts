import { apiClient } from "./client";

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface RolePayload {
  name: string;
  description: string;
  permissions: string[];
}

export const rolesApi = {
  list: async (): Promise<Role[]> =>
    (await apiClient.get<Role[]>("/roles")).data,
  create: async (payload: RolePayload): Promise<Role> =>
    (await apiClient.post<Role>("/roles", payload)).data,
  update: async (id: string, payload: Partial<RolePayload>): Promise<Role> =>
    (await apiClient.patch<Role>(`/roles/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};
