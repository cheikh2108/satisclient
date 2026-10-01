import { apiClient } from "./client";

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
  category?: string | null;
  displayName?: string | null;
}

export const filesApi = {
  list: async (): Promise<UploadedFile[]> => {
    const { data } = await apiClient.get<UploadedFile[]>("/files");
    return data;
  },

  upload: async (
    file: File,
    metadata?: { name?: string; category?: string },
  ): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata?.name) formData.append("name", metadata.name);
    if (metadata?.category) formData.append("category", metadata.category);

    const { data } = await apiClient.post<UploadedFile>(
      "/files/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },
};
