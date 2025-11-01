// src/contexts/SyncContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SyncStatus } from '@/types/sync.types';
import { useNetworkStatus } from '@/hook/useNetworkStatus';
import { SyncService } from '@/service/sync.service';

interface SyncContextData {
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isOnline } = useNetworkStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    pendingActions: 0,
  });

  // Sincronizar quando voltar a ter internet
  useEffect(() => {
    if (isOnline && !syncStatus.isSyncing) {
      triggerSync();
    }
  }, [isOnline]);

  // Atualizar contagem de ações pendentes
  useEffect(() => {
    updatePendingCount();
  }, []);

  const updatePendingCount = async () => {
    const pending = await SyncService.getPendingActions();
    setSyncStatus(prev => ({ ...prev, pendingActions: pending.length }));
  };

  const triggerSync = async () => {
    if (syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      await SyncService.syncPendingActions();
      await updatePendingCount();
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  return (
    <SyncContext.Provider value={{ syncStatus, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
