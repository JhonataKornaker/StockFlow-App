import api from '@/api';
import { ColaboradorDto, CriarColaboradorDto } from '@/dtos/colaboradorDto';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { NetworkService } from './network.service';
import { SyncService } from './sync.service';
// Serviço não deve exibir UI diretamente; tratar erros nas telas

export async function buscarColaboradores(): Promise<ColaboradorDto[]> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get('/colaborador');
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.COLABORADORES,
        response.data,
      );
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando colaboradores do cache');
      const cached = await StorageService.get<{
        data: ColaboradorDto[];
        timestamp: string;
      }>(STORAGE_KEYS.COLABORADORES);
      return cached?.data || [];
    }
  } catch (error) {
    console.log('Erro na API, buscando cache de colaboradores...');
    const cached = await StorageService.get<{
      data: ColaboradorDto[];
      timestamp: string;
    }>(STORAGE_KEYS.COLABORADORES);
    return cached?.data || [];
  }
}

export async function create(colaborador: CriarColaboradorDto) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.post('/colaborador', colaborador);
    // Invalida cache para recarregar
    await StorageService.remove(STORAGE_KEYS.COLABORADORES);
    return response.data;
  } else {
    console.log('📴 Modo offline - salvando colaborador para sincronizar');
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: '/colaborador',
      data: colaborador,
    });
    return {
      success: true,
      offline: true,
      message: 'Será sincronizado quando houver internet',
    };
  }
}

export async function listarColaboradores() {
  return buscarColaboradores(); // Reutiliza a função acima
}

export async function atualizarColaborador(
  id: number,
  data: {
    nome: string;
    funcao: string;
    empresa: string;
  },
) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.put(`/colaborador/${id}`, data);
    await StorageService.remove(STORAGE_KEYS.COLABORADORES);
    return response.data;
  } else {
    await SyncService.addPendingAction({
      type: 'UPDATE',
      endpoint: `/colaborador/${id}`,
      data,
    });
    return { success: true, offline: true };
  }
}

export async function deletarColaborador(id: number) {
  const isOnline = await NetworkService.isOnline();

  try {
    if (isOnline) {
      const response = await api.delete(`/colaborador/${id}`);
      await StorageService.remove(STORAGE_KEYS.COLABORADORES);
      return response.data;
    } else {
      await SyncService.addPendingAction({
        type: 'DELETE',
        endpoint: `/colaborador/${id}`,
        data: {},
      });
      return { success: true, offline: true };
    }
  } catch (error: any) {
    // Aqui você captura o erro vindo do backend (NestJS)
    const message =
      error.response?.data?.message || 'Erro ao deletar colaborador';

    // Propaga erro com mensagem tratada para a camada de UI
    throw new Error(message);
  }
}
