import Toast from 'react-native-toast-message';

export function parseApiError(error: any, fallback = 'Ocorreu um erro inesperado'): string {
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    return Array.isArray(msg) ? msg[0] : String(msg);
  }
  const status = error?.response?.status;
  if (status === 401) return 'Credenciais inválidas. Verifique seu e-mail e senha.';
  if (status === 403) return 'Acesso não autorizado.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Este registro já existe.';
  if (status === 422) return 'Dados inválidos. Verifique as informações.';
  const msg = error?.message ?? '';
  if (msg.includes('Network Error') || msg.includes('timeout') || msg.includes('ECONNREFUSED')) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return fallback;
}

export function showErrorToast(message: string, title = 'Erro') {
  Toast.show({ type: 'error', text1: title, text2: message });
}

export function showSuccessToast(message: string, title = 'Sucesso') {
  Toast.show({ type: 'success', text1: title, text2: message });
}

export function showInfoToast(message: string, title = 'Atenção') {
  Toast.show({ type: 'info', text1: title, text2: message });
}
