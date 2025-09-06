import api from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

export async function login(email: string, senha: string) {
  //console.log('🔍 URL da API:', api.defaults.baseURL);
  //console.log('🔐 Enviando dados:', { email, senha });
  const response = await api.post('/auth/login', { email, senha });
  //console.log('✅ Resposta da API:', response.data);
  const token = response.data.access_token;
  if (!token) {
    //console.warn('❌ Nenhum token retornado pela API!');
    throw new Error('Token não encontrado');
  }

  //await AsyncStorage.setItem('token', token);
  return token;
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function hasToken(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}
