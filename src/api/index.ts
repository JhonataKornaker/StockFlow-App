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
    if (error.response?.status === 401) {
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
    return Promise.reject(error);
  },
);

export default api;
