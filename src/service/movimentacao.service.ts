import api from '@/api';
import {
  MovimentacaoFiltradaDto,
  MovimentacaoListaDto,
  ResumoMovimentacaoEstoque,
  TipoMovimentacao,
} from '@/dtos/movimentacaoDto';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { NetworkService } from './network.service';

export async function buscarMovimentacoesRelatorio(params: {
  dataInicio?: string;
  dataFim?: string;
  tipo?: TipoMovimentacao | 'TODOS';
}): Promise<MovimentacaoFiltradaDto[]> {
  const query = new URLSearchParams();
  if (params.dataInicio) query.append('dataInicio', params.dataInicio);
  if (params.dataFim) query.append('dataFim', params.dataFim);
  if (params.tipo && params.tipo !== 'TODOS') query.append('tipo', params.tipo);
  const response = await api.get<MovimentacaoFiltradaDto[]>(
    `controle-estoque/movimentacoes?${query.toString()}`,
  );
  return response.data;
}

export async function buscarResumoMovimentacao(): Promise<ResumoMovimentacaoEstoque> {
  try {
    const isOnline = await NetworkService.isOnline();
    const cacheKey = '@resumo-movimentacao';

    if (isOnline) {
      const response = await api.get<ResumoMovimentacaoEstoque>(
        'controle-estoque/resumo-movimentacao',
      );
      await StorageService.saveWithTimestamp(cacheKey, response.data);
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando resumo de movimentação do cache');
      const cached = await StorageService.get<{
        data: ResumoMovimentacaoEstoque;
        timestamp: string;
      }>(cacheKey);
      return cached?.data || { ultimaEntrada: null, ultimaSaida: null };
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: ResumoMovimentacaoEstoque;
      timestamp: string;
    }>('@resumo-movimentacao');
    return cached?.data || { ultimaEntrada: null, ultimaSaida: null };
  }
}

export async function listarTodasMovimentacoes(): Promise<
  MovimentacaoListaDto[]
> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get<MovimentacaoListaDto[]>(
        'controle-estoque/movimentacoes-todas',
      );
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.MOVIMENTACOES,
        response.data,
      );
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando movimentações do cache');
      const cached = await StorageService.get<{
        data: MovimentacaoListaDto[];
        timestamp: string;
      }>(STORAGE_KEYS.MOVIMENTACOES);
      return cached?.data || [];
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: MovimentacaoListaDto[];
      timestamp: string;
    }>(STORAGE_KEYS.MOVIMENTACOES);
    return cached?.data || [];
  }
}
