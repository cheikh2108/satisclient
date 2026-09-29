import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationFilters } from '@/lib/api/notifications';
import { useToast } from '@/components/ui/toast';

export const notifKeys = {
  all: ['notifications'] as const,
  lists: () => [...notifKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notifKeys.lists(), filters] as const,
  unread: () => [...notifKeys.all, 'unread'] as const,
  stats: () => [...notifKeys.all, 'stats'] as const,
};

export const useNotifications = (filters?: NotificationFilters) =>
  useQuery({
    queryKey: notifKeys.list(filters),
    queryFn: () => notificationsApi.getAll(filters),
    staleTime: 30 * 1000, // données temps-réel : 30 sec
  });

export const useUnreadNotifications = () =>
  useQuery({
    queryKey: notifKeys.unread(),
    queryFn: () => notificationsApi.getUnread(),
    staleTime: 30 * 1000, // données temps-réel : 30 sec
  });

export const useNotificationStats = () =>
  useQuery({
    queryKey: notifKeys.stats(),
    queryFn: () => notificationsApi.getStats(),
    staleTime: 30 * 1000, // données temps-réel : 30 sec
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notifKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notifKeys.stats() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notifKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notifKeys.stats() });
      addToast({ type: 'success', title: 'Toutes les notifications lues' });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notifKeys.stats() });
      addToast({ type: 'success', title: 'Notification supprimée' });
    },
  });
};
