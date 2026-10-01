import axios from "axios";

/** Aligné sur apiClient : NEXT_PUBLIC_API_URL doit déjà contenir /api en prod */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/** Client sans auth — pas de redirect login sur 401 */
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export interface PublicFeedbackContext {
  siteId: string;
  siteName: string;
  siteCode: string | null;
  organizationId: string;
  organizationName: string;
  logoUrl: string | null;
  primaryColor: string;
  welcomeMessage: string;
  qrCode: string | null;
}

export interface SubmitPublicFeedbackDto {
  siteId: string;
  organizationId: string;
  overallRating: number;
  comment?: string;
  isAnonymous?: boolean;
  respondentName?: string;
  respondentEmail?: string;
  respondentPhone?: string;
  feedbackChannel?: string;
  qrCode?: string;
  needsResponse?: boolean;
}

export interface PublicSurveyQuestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  config?: { min?: number; max?: number; minLabel?: string; maxLabel?: string };
}

export interface PublicSurvey {
  id: string;
  title: string;
  description?: string | null;
  questions: PublicSurveyQuestion[];
  organizationId: string;
  organizationName: string;
  logoUrl: string | null;
  primaryColor: string;
  welcomeMessage?: string | null;
  siteId: string | null;
  settings: { requireEmail?: boolean; allowAnonymous?: boolean };
}

export const publicApi = {
  getFeedbackContext: async (
    site: string,
    qr?: string | null,
  ): Promise<PublicFeedbackContext> => {
    const { data } = await publicClient.get<PublicFeedbackContext>(
      "/public/feedback-context",
      { params: { site, ...(qr ? { qr } : {}) } },
    );
    return data;
  },

  submitFeedback: async (payload: SubmitPublicFeedbackDto) => {
    const { data } = await publicClient.post("/feedbacks", payload);
    return data;
  },

  getSurvey: async (id: string, qr?: string | null): Promise<PublicSurvey> => {
    const { data } = await publicClient.get<PublicSurvey>(
      `/public/surveys/${id}`,
      {
        params: qr ? { qr } : undefined,
      },
    );
    return data;
  },

  submitSurveyResponse: async (
    id: string,
    payload: {
      surveyId: string;
      organizationId: string;
      siteId?: string;
      isAnonymous: boolean;
      respondentEmail?: string;
      answers: Record<string, unknown>;
    },
  ) => {
    const { data } = await publicClient.post(
      `/public/surveys/${id}/responses`,
      payload,
    );
    return data;
  },
};
