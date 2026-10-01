import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import type { UserFilters, CreateUserDto, UpdateUserDto } from "@/types/api";
import { useToast } from "@/components/ui/toast";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// Hook pour récupérer tous les utilisateurs
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour récupérer un utilisateur par ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour récupérer l'utilisateur connecté
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersApi.getMe(),
    staleTime: 5 * 60 * 1000, // données lentes : 5 min
  });
};

// Hook pour récupérer les stats
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlatformStats = () =>
  useQuery({
    queryKey: [...userKeys.all, "platform-stats"],
    queryFn: () => usersApi.getPlatformStats(),
    staleTime: 60 * 1000,
  });

// Hook pour créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      addToast({
        type: "success",
        title: "Utilisateur créé",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
      });
      console.error("Error creating user:", error);
    },
  });
};

// Hook pour mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      addToast({
        type: "success",
        title: "Utilisateur mis à jour",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
      });
      console.error("Error updating user:", error);
    },
  });
};

// Hook pour mettre à jour le profil de l'utilisateur connecté
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
    }) => usersApi.updateMe(data),
    onSuccess: () => {
      // Invalider les deux caches possibles pour l'utilisateur courant
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      addToast({ type: "success", title: "Profil mis à jour" });
    },
    onError: () =>
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
      }),
  });
};

export const useChangePassword = () => {
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(data),
    onSuccess: () =>
      addToast({ type: "success", title: "Mot de passe modifié" }),
    onError: (error: any) =>
      addToast({
        type: "error",
        title: "Modification impossible",
        description:
          error?.response?.data?.message ||
          "Vérifiez votre mot de passe actuel.",
      }),
  });
};

// Hook pour mettre à jour les préférences utilisateur
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (prefs: Record<string, unknown>) =>
      usersApi.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      addToast({ type: "success", title: "Préférences sauvegardées" });
    },
    onError: () =>
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder",
      }),
  });
};

// Hook pour récupérer les sessions actives
export const useSessions = () =>
  useQuery({
    queryKey: ["users", "me", "sessions"],
    queryFn: () => usersApi.getSessions(),
    staleTime: 30 * 1000,
  });

// Hook pour révoquer une session
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: (tokenId: string) => usersApi.revokeSession(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me", "sessions"] });
      addToast({ type: "success", title: "Session révoquée" });
    },
  });
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      addToast({
        type: "success",
        title: "Utilisateur supprimé",
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
      });
      console.error("Error deleting user:", error);
    },
  });
};
