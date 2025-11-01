import api from '@/api';
import { CautelaDTO, CriarCautelaDto } from '@/dtos/cautelaDto';
import { NetworkService } from './network.service';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { SyncService } from './sync.service';

/*export async function buscarCautelas(): Promise<CautelaDTO[]> {
  const response = await api.get('/cautela');
  return response.data;
}*/

/*export async function criarCautelas(cautelas: CriarCautelaDto[]) {
  const response = await api.post('/cautela', cautelas);
  return response.data;
}*/

export async function listarItens() {
  const ferramentas = await api.get('/ferramenta');
  const patrimonios = await api.get('/patrimonio');
  return [
    ...ferramentas.data.map((f: any) => ({ ...f, tipo: 'ferramenta' })),
    ...patrimonios.data.map((p: any) => ({ ...p, tipo: 'patrimonio' })),
  ];
}

export async function listarColaboradores() {
  const { data } = await api.get('/colaborador');
  console.log('Colaboradores Service: ', data);
  return data;
}

export async function finalizarCautelas(id: number) {
  const response = await api.patch(`/cautela/${id}`);
  console.log('Finalizar Cautela: ', response.data);
  return response.data;
}

export async function buscarCautelas() {
  try {
    const isOnline = await NetworkService.isOnline();

    if (isOnline) {
      // Buscar da API
      const response = await api.get('cautelas');
      // Salvar no cache
      await StorageService.saveWithTimestamp(
        STORAGE_KEYS.CAUTELAS,
        response.data,
      );
      return response.data;
    } else {
      // Buscar do cache
      console.log('📴 Modo offline - buscando do cache');
      const cached = await StorageService.get<{ data: any; timestamp: string }>(
        STORAGE_KEYS.CAUTELAS,
      );
      return cached?.data || [];
    }
  } catch (error) {
    // Se der erro na API, tenta buscar do cache
    console.log('Erro na API, buscando cache...');
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
    const response = await api.post('cautelas', data);
    return response.data;
  } else {
    // Offline: salva para sincronizar depois
    console.log('📴 Modo offline - salvando para sincronizar depois');
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
