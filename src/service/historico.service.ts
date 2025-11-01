import api from '@/api';
import { HistoricoCautelaColaborador } from '@/dtos/historicoDto';
import { StorageService } from './storage.service';
import { NetworkService } from './network.service';

export async function buscarHistoricoCautelaColaborador(
  idColaborador: number,
): Promise<HistoricoCautelaColaborador[]> {
  try {
    const isOnline = await NetworkService.isOnline();
    const cacheKey = `@historico-${idColaborador}`;

    if (isOnline) {
      const response = await api.get<HistoricoCautelaColaborador[]>(
        `historico/buscar-historico/${idColaborador}`,
      );
      await StorageService.saveWithTimestamp(cacheKey, response.data);
      return response.data;
    } else {
      console.log('📴 Modo offline - buscando histórico do cache');
      const cached = await StorageService.get<{
        data: HistoricoCautelaColaborador[];
        timestamp: string;
      }>(cacheKey);
      return cached?.data || [];
    }
  } catch (error) {
    const cacheKey = `@historico-${idColaborador}`;
    const cached = await StorageService.get<{
      data: HistoricoCautelaColaborador[];
      timestamp: string;
    }>(cacheKey);
    return cached?.data || [];
  }
}
