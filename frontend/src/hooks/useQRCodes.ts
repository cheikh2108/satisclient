import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qrCodesApi, type QRCodeFilters } from '@/lib/api/qrCodes';
import type { CreateQRCodeDto, UpdateQRCodeDto } from '@/types/api';
import { useToast } from '@/components/ui/toast';

export const qrKeys = {
  all: ['qrCodes'] as const,
  lists: () => [...qrKeys.all, 'list'] as const,
  list: (filters?: QRCodeFilters) => [...qrKeys.lists(), filters] as const,
  detail: (id: string) => [...qrKeys.all, 'detail', id] as const,
  stats: () => [...qrKeys.all, 'stats'] as const,
};

export const useQRCodes = (filters?: QRCodeFilters) =>
  useQuery({ queryKey: qrKeys.list(filters), queryFn: () => qrCodesApi.getAll(filters) });

export const useQRCode = (id: string) =>
  useQuery({ queryKey: qrKeys.detail(id), queryFn: () => qrCodesApi.getById(id), enabled: !!id });

export const useQRCodeStats = (params?: { organizationId?: string; siteId?: string }) =>
  useQuery({ queryKey: [...qrKeys.stats(), params], queryFn: () => qrCodesApi.getStats(params) });

export const useCreateQRCode = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (data: CreateQRCodeDto) => qrCodesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
      queryClient.invalidateQueries({ queryKey: qrKeys.stats() });
      addToast({ type: 'success', title: 'QR Code créé' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de créer le QR Code' }),
  });
};

export const useUpdateQRCode = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQRCodeDto }) => qrCodesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
      queryClient.invalidateQueries({ queryKey: qrKeys.detail(id) });
      addToast({ type: 'success', title: 'QR Code mis à jour' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de mettre à jour' }),
  });
};

export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => qrCodesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
      queryClient.invalidateQueries({ queryKey: qrKeys.stats() });
      addToast({ type: 'success', title: 'QR Code supprimé' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de supprimer' }),
  });
};

export const useRegenerateQRCode = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => qrCodesApi.regenerate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrKeys.lists() });
      addToast({ type: 'success', title: 'QR Code régénéré' });
    },
    onError: () => addToast({ type: 'error', title: 'Erreur', description: 'Impossible de régénérer' }),
  });
};
