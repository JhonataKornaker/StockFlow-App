import 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppNavigation from './src/navigation/AppNavigation';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <AppNavigation />
      <Toast />
    </>
  );
}
