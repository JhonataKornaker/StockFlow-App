import api from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login(email: string, senha: string) {
  console.log('🔍 URL da API:', api.defaults.baseURL);
  console.log('🔐 Enviando dados:', { email, senha });
  const response = await api.post('/auth/login', { email, senha });
  console.log('✅ Resposta da API:', response.data);
  const token = response.data.access_token;
  if (!token) {
    console.warn('❌ Nenhum token retornado pela API!');
    throw new Error('Token não encontrado');
  }
  await AsyncStorage.setItem('token', token);
  return token;
}
