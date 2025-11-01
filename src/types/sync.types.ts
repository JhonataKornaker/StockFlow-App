export interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: string | null;
  pendingActions: number;
}
