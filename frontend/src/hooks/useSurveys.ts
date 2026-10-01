import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  surveysApi,
  type CreateSurveyPayload,
  type UpdateSurveyPayload,
} from "@/lib/api/surveys";
import { useToast } from "@/components/ui/toast";

export const surveyKeys = {
  all: ["surveys"] as const,
  list: (organizationId?: string) =>
    [...surveyKeys.all, "list", organizationId] as const,
};

export const useSurveys = (organizationId?: string) =>
  useQuery({
    queryKey: surveyKeys.list(organizationId),
    queryFn: () => surveysApi.getAll({ organizationId }),
    enabled: !!organizationId,
  });

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateSurveyPayload) => surveysApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["org", "usage"] });
      addToast({ type: "success", title: "Enquête créée" });
    },
    onError: (error: any) =>
      addToast({
        type: "error",
        title: "Création impossible",
        description:
          error?.response?.data?.message ||
          "Vérifiez le pack campagne et les sites ciblés.",
      }),
  });
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSurveyPayload;
    }) => surveysApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      addToast({ type: "success", title: "Enquête mise à jour" });
    },
    onError: () => addToast({ type: "error", title: "Mise à jour impossible" }),
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      addToast({ type: "success", title: "Enquête supprimée" });
    },
    onError: () => addToast({ type: "error", title: "Suppression impossible" }),
  });
};
