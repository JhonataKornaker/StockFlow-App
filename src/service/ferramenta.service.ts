import api from '@/api';
import { CriarFerramentaDto, FerramentasDto } from '@/dtos/ferramentasDto';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { NetworkService } from './network.service';
import { SyncService } from './sync.service';

function extractApiErrorMessage(error: any): string {
  // Axios error shape: error.response?.data?.message can be string or array
  const data = error?.response?.data;
  let msg: any = data?.message || data?.error || error?.message;
  if (Array.isArray(msg)) {
    msg = msg.join(', ');
  }
  return typeof msg === 'string' && msg.trim() ? msg : 'Ocorreu um erro ao processar a solicitação.';
}

export async function createFerramentas(ferramenta: CriarFerramentaDto) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.post('/ferramenta', ferramenta);
    await StorageService.remove(STORAGE_KEYS.FERRAMENTAS);
    return response.data;
  } else {
    console.log('📴 Modo offline - salvando ferramenta para sincronizar');
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: '/ferramenta',
      data: ferramenta,
    });
    return {
      success: true,
      offline: true,
      message: 'Será sincronizado quando houver internet',
    };
  }
}

export async function listarFerramentas(): Promise<FerramentasDto[]> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get('/ferramenta');
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.FERRAMENTAS,
        response.data,
      );
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando ferramentas do cache');
      const cached = await StorageService.get<{
        data: FerramentasDto[];
        timestamp: string;
      }>(STORAGE_KEYS.FERRAMENTAS);
      return cached?.data || [];
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: FerramentasDto[];
      timestamp: string;
    }>(STORAGE_KEYS.FERRAMENTAS);
    return cached?.data || [];
  }
}

export async function atualizarFerramenta(
  id: number,
  data: {
    descricao: string;
    quantidade: number;
    marca: string;
    modelo: string;
  },
) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    try {
      const response = await api.put(`/ferramenta/${id}`, data);
      await StorageService.remove(STORAGE_KEYS.FERRAMENTAS);
      return response.data;
    } catch (error) {
      throw new Error(extractApiErrorMessage(error));
    }
  } else {
    await SyncService.addPendingAction({
      type: 'UPDATE',
      endpoint: `/ferramenta/${id}`,
      data,
    });
    return { success: true, offline: true };
  }
}

export async function deletarFerramenta(id: number) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    try {
      const response = await api.delete(`/ferramenta/${id}`);
      await StorageService.remove(STORAGE_KEYS.FERRAMENTAS);
      return response.data;
    } catch (error) {
      throw new Error(extractApiErrorMessage(error));
    }
  } else {
    await SyncService.addPendingAction({
      type: 'DELETE',
      endpoint: `/ferramenta/${id}`,
      data: {},
    });
    return { success: true, offline: true };
  }
}
