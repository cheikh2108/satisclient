import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
  };
}

// Clés de requête
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Hook pour récupérer l'utilisateur connecté
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour le login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginDto): Promise<{ user: AuthResponse['user'] }> => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data; // Plus besoin d'extraire le token — stocké dans les cookies httpOnly
    },
    onSuccess: () => {
      // Vider tout le cache — évite que les données d'un autre compte restent visibles
      queryClient.clear();
    },
  });
};

// Hook pour le logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout').catch(() => {}); // révoque le cookie côté backend
      return true;
    },
    onSuccess: () => {
      // Nettoyage localStorage par sécurité (au cas où d'anciens tokens y seraient)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
      queryClient.clear();
    },
  });
};

// Helper pour vérifier si l'utilisateur est authentifié (appel réseau)
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await apiClient.get('/users/me');
    return true;
  } catch {
    return false;
  }
};
