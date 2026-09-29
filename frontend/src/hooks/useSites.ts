import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '@/lib/api';
import type {
  SiteFilters,
  CreateSiteDto,
  UpdateSiteDto,
} from '@/types/api';
import { useToast } from '@/components/ui/toast';

// Query keys
export const siteKeys = {
  all: ['sites'] as const,
  lists: () => [...siteKeys.all, 'list'] as const,
  list: (filters?: SiteFilters) => [...siteKeys.lists(), filters] as const,
  details: () => [...siteKeys.all, 'detail'] as const,
  detail: (id: string) => [...siteKeys.details(), id] as const,
  stats: () => [...siteKeys.all, 'stats'] as const,
};

// Hook pour récupérer tous les sites
export const useSites = (filters?: SiteFilters) => {
  return useQuery({
    queryKey: siteKeys.list(filters),
    queryFn: () => sitesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour récupérer un site par ID
export const useSite = (id: string) => {
  return useQuery({
    queryKey: siteKeys.detail(id),
    queryFn: () => sitesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour récupérer les stats
export const useSiteStats = () => {
  return useQuery({
    queryKey: siteKeys.stats(),
    queryFn: () => sitesApi.getStats(),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour créer un site
export const useCreateSite = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSiteDto) => sitesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.stats() });
      addToast({
        type: 'success',
        title: 'Site créé',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de créer le site',
      });
      console.error('Error creating site:', error);
    },
  });
};

// Hook pour mettre à jour un site
export const useUpdateSite = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteDto }) =>
      sitesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: siteKeys.stats() });
      addToast({
        type: 'success',
        title: 'Site mis à jour',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le site',
      });
      console.error('Error updating site:', error);
    },
  });
};

// Hook pour supprimer un site
export const useDeleteSite = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sitesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.stats() });
      addToast({
        type: 'success',
        title: 'Site supprimé',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Erreur',
        description: 'Impossible de supprimer le site',
      });
      console.error('Error deleting site:', error);
    },
  });
};
