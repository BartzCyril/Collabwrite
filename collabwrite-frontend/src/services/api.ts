import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  //console.log('[API Request]', config.url, 'Token:', token ? 'present' : 'missing', 'Stack:', new Error().stack);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Ne pas supprimer les tokens si c'est un appel de login/register
      const isAuthRoute = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register') ||
                          error.config?.url?.includes('/auth/logout');
      
      if (!isAuthRoute) {
        // Token expiré, supprimer les tokens et rediriger vers login
        //console.log('[API Response] Token expired, removing tokens and redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 