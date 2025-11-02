import env from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onTokenExpired: (() => void) | null = null;

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback;
};

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
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
      // Verificar se já mostramos o alerta para evitar múltiplos alerts
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        await AsyncStorage.multiRemove(['token', 'user']);

        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Por favor, faça login novamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onTokenExpired) {
                  onTokenExpired();
                }
              },
            },
          ],
        );
      }
    }
    return Promise.reject(error);
  },
);

export default api;
