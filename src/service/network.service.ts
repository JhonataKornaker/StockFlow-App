import NetInfo from '@react-native-community/netinfo';

export class NetworkService {
  // Verificar se está online
  static async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  // Observar mudanças de conexão
  static subscribe(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
  }
}
