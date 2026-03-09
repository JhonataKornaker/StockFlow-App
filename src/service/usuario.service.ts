import api from '@/api';
import { Usuario } from '@/dtos/usuarioDto';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';

export async function atualizarPerfil(data: {
  nome?: string;
  funcao?: string;
}): Promise<Usuario> {
  const response = await api.patch('usuario/me', data);
  return response.data;
}

export async function alterarSenha(
  senhaAtual: string,
  novaSenha: string,
): Promise<void> {
  await api.patch('usuario/me/senha', { senhaAtual, novaSenha });
}

export async function buscarUsuarioLogado(): Promise<Usuario> {
  try {
    const isOnline = await NetworkService.isOnline();
    const cacheKey = '@usuario-logado';

    if (isOnline) {
      const response = await api.get('usuario/me');
      await StorageService.saveWithTimestamp(cacheKey, response.data);
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando usuário do cache');
      const cached = await StorageService.get<{
        data: Usuario;
        timestamp: string;
      }>(cacheKey);
      if (!cached?.data) {
        throw new Error('Usuário não encontrado no cache');
      }
      return cached.data;
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: Usuario;
      timestamp: string;
    }>('@usuario-logado');
    if (!cached?.data) {
      throw new Error('Usuário não encontrado no cache e sem internet');
    }
    return cached.data;
  }
}
