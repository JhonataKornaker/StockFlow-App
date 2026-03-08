import api from '@/api';
import { CriarPatrimonioDto, HistoricoLocacaoDto, PatrimonioDto } from '@/dtos/patrimonioDto';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { NetworkService } from './network.service';
import { SyncService } from './sync.service';

export async function createPatrimonio(patrimonio: CriarPatrimonioDto) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.post('/patrimonio', patrimonio);
    await StorageService.remove(STORAGE_KEYS.PATRIMONIOS);
    return response.data;
  } else {
    console.log('📴 Modo offline - salvando patrimônio para sincronizar');
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: '/patrimonio',
      data: patrimonio,
    });
    return {
      success: true,
      offline: true,
      message: 'Será sincronizado quando houver internet',
    };
  }
}

export async function devolverLocacao(id: number, observacao?: string): Promise<void> {
  await api.post(`/patrimonio/${id}/devolver`, { observacao });
}

export async function buscarHistoricoLocacoes(params: {
  dataInicio?: string;
  dataFim?: string;
}): Promise<HistoricoLocacaoDto[]> {
  const query = new URLSearchParams();
  if (params.dataInicio) query.append('dataInicio', params.dataInicio);
  if (params.dataFim) query.append('dataFim', params.dataFim);
  const response = await api.get<HistoricoLocacaoDto[]>(
    `/patrimonio/historico-locacoes?${query.toString()}`,
  );
  return response.data;
}

export async function listarLocacoes(): Promise<PatrimonioDto[]> {
  try {
    const response = await api.get('/patrimonio/locados');
    return response.data;
  } catch (error) {
    return [];
  }
}

export async function listarPatrimonio(): Promise<PatrimonioDto[]> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get('/patrimonio');
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.PATRIMONIOS,
        response.data,
      );
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando patrimônios do cache');
      const cached = await StorageService.get<{
        data: PatrimonioDto[];
        timestamp: string;
      }>(STORAGE_KEYS.PATRIMONIOS);
      return cached?.data || [];
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: PatrimonioDto[];
      timestamp: string;
    }>(STORAGE_KEYS.PATRIMONIOS);
    return cached?.data || [];
  }
}

export async function atualizarPatrimonio(
  id: number,
  data: {
    descricao: string;
    numeroSerie: string;
    marca: string;
    modelo: string;
    nomeLocadora?: string;
    dataLocacao?: Date;
    dataDevolucao?: Date;
  },
) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    try {
      const response = await api.put(`/patrimonio/${id}`, data);
      await StorageService.remove(STORAGE_KEYS.PATRIMONIOS);
      return response.data;
    } catch (error: any) {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    }
  } else {
    await SyncService.addPendingAction({
      type: 'UPDATE',
      endpoint: `/patrimonio/${id}`,
      data,
    });
    return { success: true, offline: true };
  }
}

export async function deletarPatrimonio(id: number) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.delete(`/patrimonio/${id}`);
    await StorageService.remove(STORAGE_KEYS.PATRIMONIOS);
    return response.data;
  } else {
    await SyncService.addPendingAction({
      type: 'DELETE',
      endpoint: `/patrimonio/${id}`,
      data: {},
    });
    return { success: true, offline: true };
  }
}

function extractApiErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido.';
  const response = error?.response;
  if (response) {
    const data = response.data;
    if (typeof data === 'string') return data;
    if (data?.message) return String(data.message);
    if (Array.isArray(data?.errors)) return String(data.errors[0] ?? 'Falha na requisição');
  }
  return error?.message ?? 'Falha na requisição';
}
