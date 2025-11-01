// src/services/sync.service.ts
import api from '@/api';
import { NetworkService } from './network.service';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { PendingAction } from '@/types/sync.types';

export class SyncService {
  // Adicionar ação pendente
  static async addPendingAction(
    action: Omit<PendingAction, 'id' | 'timestamp'>,
  ): Promise<void> {
    try {
      const pending = await this.getPendingActions();
      const newAction: PendingAction = {
        ...action,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      pending.push(newAction);
      await StorageService.save(STORAGE_KEYS.PENDING_ACTIONS, pending);
    } catch (error) {
      console.error('Erro ao adicionar ação pendente:', error);
    }
  }

  // Buscar ações pendentes
  static async getPendingActions(): Promise<PendingAction[]> {
    const actions = await StorageService.get<PendingAction[]>(
      STORAGE_KEYS.PENDING_ACTIONS,
    );
    return actions || [];
  }

  // Sincronizar todas as ações pendentes
  static async syncPendingActions(): Promise<void> {
    const isOnline = await NetworkService.isOnline();

    if (!isOnline) {
      console.log('Sem internet, sincronização adiada');
      return;
    }

    const pending = await this.getPendingActions();

    if (pending.length === 0) {
      console.log('Nenhuma ação pendente para sincronizar');
      return;
    }

    console.log(`Sincronizando ${pending.length} ações pendentes...`);

    const successIds: string[] = [];

    for (const action of pending) {
      try {
        await this.executeAction(action);
        successIds.push(action.id);
        console.log(`✅ Ação ${action.id} sincronizada`);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ação ${action.id}:`, error);
      }
    }

    // Remover ações bem-sucedidas
    if (successIds.length > 0) {
      const remaining = pending.filter(a => !successIds.includes(a.id));
      await StorageService.save(STORAGE_KEYS.PENDING_ACTIONS, remaining);
      await StorageService.save(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString(),
      );
    }
  }

  // Executar ação na API
  private static async executeAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await api.post(action.endpoint, action.data);
        break;
      case 'UPDATE':
        await api.put(action.endpoint, action.data);
        break;
      case 'DELETE':
        await api.delete(action.endpoint);
        break;
    }
  }

  // Limpar ações pendentes
  static async clearPendingActions(): Promise<void> {
    await StorageService.remove(STORAGE_KEYS.PENDING_ACTIONS);
  }
}
