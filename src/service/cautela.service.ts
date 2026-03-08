import api from '@/api';
import { CautelaDTO, CriarCautelaDto } from '@/dtos/cautelaDto';
import { NetworkService } from './network.service';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { SyncService } from './sync.service';

export async function listarItens() {
  const [ferramentas, patrimonios] = await Promise.all([
    api.get('/ferramenta'),
    api.get('/patrimonio'),
  ]);
  return [
    ...ferramentas.data.map((f: any) => ({ ...f, tipo: 'ferramenta' })),
    ...patrimonios.data
      .filter((p: any) => p.disponivel)
      .map((p: any) => ({ ...p, tipo: 'patrimonio' })),
  ];
}

export async function listarColaboradores() {
  const { data } = await api.get('/colaborador');
  return data;
}

export async function finalizarCautelas(id: number) {
  const response = await api.patch(`/cautela/${id}`);
  return response.data;
}

export async function buscarCautelas() {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      // Buscar da API
      const response = await api.get('cautela');
      // Salvar no cache
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.CAUTELAS,
        response.data,
      );
      return response.data;
    } else {
      // Buscar do cache
      const cached = await StorageService.get<{ data: any; timestamp: string }>(
        STORAGE_KEYS.CAUTELAS,
      );
      return cached?.data || [];
    }
  } catch (error) {
    // Se der erro na API, tenta buscar do cache
    const cached = await StorageService.get<{ data: any; timestamp: string }>(
      STORAGE_KEYS.CAUTELAS,
    );
    return cached?.data || [];
  }
}

export async function criarCautelas(data: any) {
  const isOnline = await NetworkService.isOnline();

  if (isOnline) {
    // Online: envia direto
    const response = await api.post('cautela', data);
    return response.data;
  } else {
    // Offline: salva para sincronizar depois
    await SyncService.addPendingAction({
      type: 'CREATE',
      endpoint: 'cautelas',
      data,
    });

    // Salva localmente temporariamente
    const cached =
      (await StorageService.get<any[]>(STORAGE_KEYS.CAUTELAS)) || [];
    cached.push({ ...data, id: Date.now(), _pendingSync: true });
    await StorageService.save(STORAGE_KEYS.CAUTELAS, cached);

    return { success: true, offline: true };
  }
}
