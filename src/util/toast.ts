import Toast from 'react-native-toast-message';

export function showErrorToast(message: string, title = 'Erro') {
  Toast.show({ type: 'error', text1: title, text2: message });
}

export function showSuccessToast(message: string, title = 'Sucesso') {
  Toast.show({ type: 'success', text1: title, text2: message });
}

export function showInfoToast(message: string, title = 'Info') {
  Toast.show({ type: 'info', text1: title, text2: message });
}