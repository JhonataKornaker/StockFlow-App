import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainStackNavigator from './MainStackNavigator';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: { backgroundColor: '#162B4D', width: 235 },
          headerShown: false, // O Drawer não controla header
        }}
      >
        <Drawer.Screen name="Main" component={MainStackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
