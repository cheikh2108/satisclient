import { apiClient } from './client';

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export const filesApi = {
  upload: async (file: File, metadata?: { entityType?: string; entityId?: string }): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.entityType) formData.append('entityType', metadata.entityType);
    if (metadata?.entityId) formData.append('entityId', metadata.entityId);

    const { data } = await apiClient.post<UploadedFile>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
