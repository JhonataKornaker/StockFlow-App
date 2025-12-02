import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import Routes from './Routes';
import { AuthProvider } from '@/context/AuthContext';
import SplashScreen from '@/screens/SplashScreen';

export default function AppNavigation() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}
