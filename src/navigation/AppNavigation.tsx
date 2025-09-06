import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Routes from './Routes';
import { AuthProvider } from '@/context/AuthContext';

export default function AppNavigation() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}
