import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbacksApi } from '@/lib/api';
import type {
  FeedbackFilters,
  CreateFeedbackDto,
  UpdateFeedbackDto,
} from '@/types/api';
import { useToast } from '@/components/ui/toast';

// Query keys
export const feedbackKeys = {
  all: ['feedbacks'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (filters?: FeedbackFilters) => [...feedbackKeys.lists(), filters] as const,
  details: () => [...feedbackKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
  stats: () => [...feedbackKeys.all, 'stats'] as const,
};

// Hook pour récupérer tous les feedbacks
export const useFeedbacks = (filters?: FeedbackFilters) => {
  return useQuery({
    queryKey: feedbackKeys.list(filters),
    queryFn: () => feedbacksApi.getAll(filters),
  });
};

// Hook pour récupérer un feedback par ID
export const useFeedback = (id: string) => {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => feedbacksApi.getById(id),
    enabled: !!id,
  });
};

// Hook pour la série temporelle (sparklines)
export const useFeedbackTimeseries = (days = 15) =>
  useQuery({
    queryKey: [...feedbackKeys.all, 'timeseries', days],
    queryFn: () => feedbacksApi.getTimeseries(days),
  });

// Hook pour récupérer les stats avec comparaison période précédente
export const useFeedbackStats = () => {
  const current = useQuery({
    queryKey: [...feedbackKeys.stats(), '30d'],
    queryFn: () => feedbacksApi.getStats('30d'),
  });
  const previous = useQuery({
    queryKey: [...feedbackKeys.stats(), '90d'],
    queryFn: () => feedbacksApi.getStats('90d'),
  });

  const calcChange = (curr: number, prev90: number) => {
    const prev30 = Math.round((prev90 - curr) / 2);
    if (prev30 === 0) return null;
    return Math.round(((curr - prev30) / prev30) * 100);
  };

  return {
    ...current,
    data: current.data,
    changes: current.data && previous.data ? {
      total: calcChange(current.data.total, previous.data.total),
      positive: calcChange(
        current.data.bySentiment?.positive ?? 0,
        previous.data.bySentiment?.positive ?? 0,
      ),
      avgRating: (current.data.averageRating != null && previous.data.averageRating != null)
        ? +(current.data.averageRating - previous.data.averageRating).toFixed(1)
        : null,
    } : null,
  };
};

// Hook pour créer un feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateFeedbackDto) => feedbacksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
      addToast({
        type: 'success',
        title: 'Feedback créé',
        description: 'Le feedback a été créé avec succès',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de créer le feedback',
      });
      console.error('Error creating feedback:', error);
    },
  });
};

// Hook pour mettre à jour un feedback
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedbackDto }) =>
      feedbacksApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
      addToast({
        type: 'success',
        title: 'Feedback mis à jour',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le feedback',
      });
      console.error('Error updating feedback:', error);
    },
  });
};

// Hook pour supprimer un feedback
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => feedbacksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() });
      addToast({
        type: 'success',
        title: 'Feedback supprimé',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de supprimer le feedback',
      });
      console.error('Error deleting feedback:', error);
    },
  });
};
