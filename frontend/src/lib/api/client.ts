import axios, { AxiosError, AxiosInstance } from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Créer une instance Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Envoie les cookies httpOnly avec chaque requête
  headers: {
    'Content-Type': 'application/json',
  },
});

// Logique de refresh automatique
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void; config: any }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(apiClient(prom.config));
  });
  failedQueue = [];
};

// Intercepteur de réponse - refresh automatique + gestion des erreurs globales
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Ne pas tenter de refresh si on est sur les routes auth
      const url = originalRequest.url || '';
      // Ne jamais tenter de refresh pour les routes auth ou la vérification de session
      if (url.includes('/auth/') || url.includes('/users/me')) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh'); // cookies envoyés automatiquement
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des erreurs serveur
    if (error.response?.status === 500) {
      console.error('Erreur serveur:', error);
    }

    return Promise.reject(error);
  }
);

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Helper pour construire une PaginatedResponse à partir d'un tableau brut
export function wrapArrayResponse<T>(data: unknown): PaginatedResponse<T> {
  const arr = Array.isArray(data) ? (data as T[]) : [];
  return { data: arr, meta: { total: arr.length, page: 1, pageSize: arr.length, totalPages: 1 } };
}

// Helper pour extraire les erreurs
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Erreur d'authentification
    if (error.response?.status === 401) {
      return 'Vous devez être connecté pour accéder à cette ressource. Veuillez vous connecter.';
    }

    // Erreur de connexion au serveur
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
    }

    // Erreur 404
    if (error.response?.status === 404) {
      return 'Ressource non trouvée. Vérifiez que le backend est configuré correctement.';
    }

    // Extraire le message d'erreur de la réponse
    const apiErrorRaw = error.response?.data;
    const apiError = apiErrorRaw as ApiError;

    // Si c'est un message HTML (erreur serveur brute), afficher un message générique
    if (typeof apiErrorRaw === 'string' && (apiErrorRaw.includes('<!DOCTYPE') || apiErrorRaw.includes('<html'))) {
      return `Erreur serveur (${error.response?.status || 'inconnue'}). Vérifiez la configuration du backend.`;
    }

    return apiError?.message || error.message || 'Une erreur est survenue';
  }
  return 'Une erreur est survenue';
};
