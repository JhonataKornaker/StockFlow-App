import React from 'react';
import AppDrawer from './AppDrawer';
import { AuthRoutes } from './AuthRoutes';
import { useAuth } from '@/context/AuthContext';

export default function Routes() {
  const { isLogged } = useAuth();

  return isLogged ? <AppDrawer /> : <AuthRoutes />;
}
