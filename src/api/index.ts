import env from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onTokenExpired: (() => void) | null = null;
let cachedToken: string | null = null;
let handlingExpiry = false;

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback;
};

export const setCachedToken = (token: string | null) => {
  cachedToken = token;
};

api.interceptors.request.use(async config => {
  const token = cachedToken ?? await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Lista de endpoints que não devem disparar o logout automático
    const excludedEndpoints = ['/login', '/auth/login', '/autenticacao'];

    const isExcludedEndpoint = excludedEndpoints.some(endpoint =>
      originalRequest.url.includes(endpoint),
    );

    if (error.response?.status === 401 && !isExcludedEndpoint) {
      if (!handlingExpiry) {
        handlingExpiry = true;

        await AsyncStorage.multiRemove(['token', 'user']);
        cachedToken = null;

        if (onTokenExpired) {
          onTokenExpired();
        }

        setTimeout(() => { handlingExpiry = false; }, 3000);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
