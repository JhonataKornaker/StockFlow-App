import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  // Salvar dados
  static async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  // Buscar dados
  static async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Erro ao buscar ${key}:`, error);
      return null;
    }
  }

  // Remover dados
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
    }
  }

  // Limpar tudo
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
    }
  }

  // Salvar com timestamp
  static async saveWithTimestamp<T>(key: string, data: T): Promise<void> {
    const dataWithTimestamp = {
      data,
      timestamp: new Date().toISOString(),
    };
    await this.save(key, dataWithTimestamp);
  }

  // Buscar verificando se está expirado
  static async getIfNotExpired<T>(
    key: string,
    maxAgeMinutes: number = 60,
  ): Promise<T | null> {
    try {
      const stored = await this.get<{ data: T; timestamp: string }>(key);

      if (!stored) return null;

      const now = new Date().getTime();
      const storedTime = new Date(stored.timestamp).getTime();
      const diffMinutes = (now - storedTime) / 1000 / 60;

      if (diffMinutes > maxAgeMinutes) {
        await this.remove(key);
        return null;
      }

      return stored.data;
    } catch (error) {
      console.error('Erro ao verificar expiração:', error);
      return null;
    }
  }
}

// Keys do storage
export const STORAGE_KEYS = {
  CAUTELAS: '@cautelas',
  COLABORADORES: '@colaboradores',
  FERRAMENTAS: '@ferramentas',
  PATRIMONIOS: '@patrimonios',
  ESTOQUES: '@estoques',
  MOVIMENTACOES: '@movimentacoes',
  PENDING_ACTIONS: '@pending_actions', // Ações pendentes para sincronizar
  LAST_SYNC: '@last_sync',
};
