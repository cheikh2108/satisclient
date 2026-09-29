import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi, type OrganizationFilters } from '@/lib/api/organizations';
import type { CreateOrganizationDto, UpdateOrganizationDto } from '@/types/api';
import { useToast } from '@/components/ui/toast';

export const orgKeys = {
  all: ['organizations'] as const,
  lists: () => [...orgKeys.all, 'list'] as const,
  list: (filters?: OrganizationFilters) => [...orgKeys.lists(), filters] as const,
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
  stats: () => [...orgKeys.all, 'stats'] as const,
};

export const useOrganizations = (filters?: OrganizationFilters) =>
  useQuery({
    queryKey: orgKeys.list(filters),
    queryFn: () => organizationsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });

export const useOrganizationStats = () =>
  useQuery({
    queryKey: orgKeys.stats(),
    queryFn: () => organizationsApi.getStats(),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (data: CreateOrganizationDto) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgKeys.stats() });
      addToast({ type: 'success', title: 'Organisation créée' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de créer l\'organisation' }),
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDto }) => organizationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orgKeys.stats() });
      addToast({ type: 'success', title: 'Organisation mise à jour' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de mettre à jour' }),
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => organizationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgKeys.stats() });
      addToast({ type: 'success', title: 'Organisation supprimée' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de supprimer' }),
  });
};
