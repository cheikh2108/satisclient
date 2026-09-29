import { useMutation } from '@tanstack/react-query';
import { reportsApi, downloadReport, type ReportParams } from '@/lib/api/reports';
import { useToast } from '@/components/ui/toast';

export const useGenerateComplaintsReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateComplaints(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier réclamations est en cours de téléchargement' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport' }),
  });
};

export const useGenerateSurveyReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateSurvey(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier enquêtes est prêt' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport' }),
  });
};

export const useGenerateAnalyticsReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateAnalytics(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier analytique est prêt' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport' }),
  });
};

export const useGenerateFeedbacksReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateFeedbacks(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier feedbacks est prêt' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport feedbacks' }),
  });
};

export const useGenerateUsersReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateUsers(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier utilisateurs est prêt' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport utilisateurs' }),
  });
};

export const useGenerateSitesReport = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (params: ReportParams) => reportsApi.generateSites(params),
    onSuccess: () => addToast({ type: 'success', title: 'Téléchargement démarré', description: 'Le fichier sites est prêt' }),
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de générer le rapport sites' }),
  });
};
