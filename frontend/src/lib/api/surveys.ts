import { apiClient } from "./client";

export type SurveyQuestion = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: Array<{ label: string; value: string | number }>;
  config?: { min?: number; max?: number; minLabel?: string; maxLabel?: string };
};

export type Survey = {
  id: string;
  title: string;
  description?: string | null;
  questions: SurveyQuestion[];
  targetSiteIds: string[];
  surveyType: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  organization?: { id: string; name: string };
  campaignPackId?: string | null;
};

export type SurveyResponse = {
  id: string;
  surveyId: string;
  organizationId: string;
  siteId?: string;
  isAnonymous: boolean;
  respondentEmail?: string;
  answers: Record<string, unknown>;
  completionTimeSeconds?: number;
  isCompleted: boolean;
  submittedAt: string;
  site?: { id: string; name: string };
};

export type CreateSurveyPayload = {
  organizationId: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  targetSiteIds: string[];
  campaignPackId?: string;
  surveyType?: "one_time" | "recurring" | "continuous";
  settings?: { allowAnonymous?: boolean; requireEmail?: boolean };
};

export type UpdateSurveyPayload = Partial<
  Omit<CreateSurveyPayload, "organizationId" | "campaignPackId">
> & {
  isActive?: boolean;
};

export const surveysApi = {
  getAll: async (params?: {
    organizationId?: string;
    isActive?: boolean;
  }): Promise<Survey[]> => {
    const { data } = await apiClient.get<Survey[]>("/surveys", { params });
    return data;
  },

  create: async (payload: CreateSurveyPayload): Promise<Survey> => {
    const { data } = await apiClient.post<Survey>("/surveys", payload);
    return data;
  },

  getResponses: async (id: string): Promise<SurveyResponse[]> => {
    const { data } = await apiClient.get<SurveyResponse[]>(
      `/surveys/${id}/responses`,
    );
    return data;
  },

  update: async (id: string, payload: UpdateSurveyPayload): Promise<Survey> => {
    const { data } = await apiClient.patch<Survey>(`/surveys/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/surveys/${id}`);
  },
};
