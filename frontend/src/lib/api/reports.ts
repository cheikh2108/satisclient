import { apiClient } from "./client";

export interface ReportParams {
  organizationId?: string;
  siteId?: string;
  surveyId?: string;
  startDate?: string;
  endDate?: string;
  format?: "pdf" | "excel" | "csv";
}

const EXT: Record<string, string> = { pdf: "pdf", excel: "xlsx", csv: "csv" };

export async function downloadReport(
  endpoint: string,
  params: ReportParams,
  filename: string,
): Promise<void> {
  const response = await apiClient.post(endpoint, params, {
    responseType: "blob",
  });
  const fmt = params.format || "pdf";
  const contentType = String(
    response.headers["content-type"] || "application/octet-stream",
  );
  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.${EXT[fmt] || fmt}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const reportsApi = {
  generateComplaints: (params: ReportParams) =>
    downloadReport("/reports/complaints", params, "reclamations"),

  generateSurvey: (params: ReportParams) =>
    downloadReport("/reports/survey", params, "enquetes"),

  generateAnalytics: (params: ReportParams) =>
    downloadReport("/reports/analytics", params, "analytics"),

  generateFeedbacks: (params: ReportParams) =>
    downloadReport("/reports/feedbacks", params, "feedbacks"),

  generateUsers: (params: ReportParams) =>
    downloadReport("/reports/users", params, "utilisateurs"),

  generateSites: (params: ReportParams) =>
    downloadReport("/reports/sites", params, "sites"),
};
