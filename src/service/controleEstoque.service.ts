import api from '@/api';
import { EstoqueDto, ResumoNumerico, SaidaInsumoDto } from '@/dtos/estoqueDto';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { NetworkService } from './network.service';
import { SyncService } from './sync.service';

export async function buscarResumoNumerico(): Promise<ResumoNumerico> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get<ResumoNumerico>(
        'controle-estoque/resumo-numerico',
      );
      await StorageService.saveWithTimestamp('@resumo-numerico', response.data);
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando resumo do cache');
      const cached = await StorageService.get<{
        data: ResumoNumerico;
        timestamp: string;
      }>('@resumo-numerico');
      return (
        cached?.data || {
          totalEntradas: 0,
          totalSaidas: 0,
          cautelasAbertas: 0,
        }
      );
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: ResumoNumerico;
      timestamp: string;
    }>('@resumo-numerico');
    return (
      cached?.data || {
        totalEntradas: 0,
        totalSaidas: 0,
        cautelasAbertas: 0,
      }
    );
  }
}

export async function listarEstoques(): Promise<EstoqueDto[]> {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      const response = await api.get<EstoqueDto[]>('controle-estoque/listar');
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.ESTOQUES,
        response.data,
      );
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando estoques do cache');
      const cached = await StorageService.get<{
        data: EstoqueDto[];
        timestamp: string;
      }>(STORAGE_KEYS.ESTOQUES);
      return cached?.data || [];
    }
  } catch (error) {
    const cached = await StorageService.get<{
      data: EstoqueDto[];
      timestamp: string;
    }>(STORAGE_KEYS.ESTOQUES);
    return cached?.data || [];
  }
}

export async function cadastrarInsumoComEntrada(data: {
  descricao: string;
  unidade: string;
  quantidadeEntrada: number;
  codigo?: string;
  marca?: string;
  categoria?: string;
  observacao?: string;
  quantidadeMinima?: number;
  quantidadeMaxima?: number;
  localizacao?: string;
  fornecedor?: string;
  valorUnitario?: number;
}) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.post(
      'controle-estoque/insumos/com-entrada',
      data,
    );
    await StorageService.remove(STORAGE_KEYS.ESTOQUES);
    await StorageService.remove(STORAGE_KEYS.MOVIMENTACOES);
    return response.data;
  } else {
    console.log(
      '📴 Modo offline - salvando cadastro de insumo para sincronizar',
    );
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: 'controle-estoque/insumos/com-entrada',
      data,
    });
    return {
      success: true,
      offline: true,
      message: 'Será sincronizado quando houver internet',
    };
  }
}

export async function registrarSaidaInsumo(data: SaidaInsumoDto) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    const response = await api.post('controle-estoque/saida', data);
    await StorageService.remove(STORAGE_KEYS.ESTOQUES);
    await StorageService.remove(STORAGE_KEYS.MOVIMENTACOES);
    return response.data;
  } else {
    console.log('📴 Modo offline - salvando saída para sincronizar');
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: 'controle-estoque/saida',
      data,
    });
    return {
      success: true,
      offline: true,
      message: 'Será sincronizado quando houver internet',
    };
  }
}
