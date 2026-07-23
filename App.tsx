import 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppNavigation from './src/navigation/AppNavigation';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const PRIMARY = '#162B4D';

const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#22c55e', backgroundColor: '#fff', borderRadius: 12, elevation: 8, minHeight: 60 }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ fontSize: 14, fontWeight: '700', color: PRIMARY }}
      text2Style={{ fontSize: 13, color: '#6b7280' }}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#fff', borderRadius: 12, elevation: 8, minHeight: 60 }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ fontSize: 14, fontWeight: '700', color: PRIMARY }}
      text2Style={{ fontSize: 13, color: '#6b7280' }}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: PRIMARY, backgroundColor: '#fff', borderRadius: 12, elevation: 8, minHeight: 60 }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ fontSize: 14, fontWeight: '700', color: PRIMARY }}
      text2Style={{ fontSize: 13, color: '#6b7280' }}
      text2NumberOfLines={3}
    />
  ),
};

export default function App() {
  return (
    <>
      <AppNavigation />
      <Toast config={toastConfig} topOffset={56} visibilityTime={3500} />
    </>
  );
}
