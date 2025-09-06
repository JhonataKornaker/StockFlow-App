import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerMenuContent from '@/navigation/DrawerMenuContent';
import { theme } from '@/styles/theme';
import StackRoutes from './StackRoutes';
import React from 'react';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 240,
          backgroundColor: theme.colors.primary,
        },
      }}
      drawerContent={({ navigation }) => (
        <DrawerMenuContent navigation={navigation} />
      )}
    >
      <Drawer.Screen name="Home" component={StackRoutes} />
    </Drawer.Navigator>
  );
}
