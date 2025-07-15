import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import InicioScreen from '@/screens/InicioScreen';
import CadastroFerramentas from '@/screens/CadastroFerramentas';
import CadastroColaborador from '@/screens/CadastroColaborador';
import CadastroPatrimonio from '@/screens/CadastroPatrimonio';
import CautelaScreen from '@/screens/CautelaScreen';
import DrawerMenuContent from '@/navigation/DrawerMenuContent';
import { theme } from '@/styles/theme';
import Ferramentas from '@/screens/Ferramentas';
import Patrimonios from '@/screens/Patrimonios';
import Colaboradores from '@/screens/Colaboradores';
import DetalhesColaborador from '@/screens/DetalhesColaborador';
import LoginScreen from '@/screens/LoginScreen';
import React from 'react';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function StackRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#19325E',
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          color: theme.colors.secondary,
          fontWeight: 'bold',
          fontSize: 22,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Inicio"
        component={InicioScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cautela"
        component={CautelaScreen}
        options={{ title: 'Cautela' }}
      />
      <Stack.Screen
        name="CadastroFerramentas"
        component={CadastroFerramentas}
        options={{ title: 'Cadastro de Ferramenta' }}
      />
      <Stack.Screen
        name="CadastroColaborador"
        component={CadastroColaborador}
        options={{ title: 'Cadastro de Colaborador' }}
      />
      <Stack.Screen
        name="CadastroPatrimonio"
        component={CadastroPatrimonio}
        options={{ title: 'Cadastro de Patrimônio' }}
      />
      <Stack.Screen
        name="Ferramentas"
        component={Ferramentas}
        options={{ title: 'Ferramentas' }}
      />
      <Stack.Screen
        name="Patrimonios"
        component={Patrimonios}
        options={{ title: 'Patrimônios' }}
      />
      <Stack.Screen
        name="Colaboradores"
        component={Colaboradores}
        options={{ title: 'Colaboradores' }}
      />
      <Stack.Screen
        name="DetalhesColaborador"
        component={DetalhesColaborador}
        options={{ title: 'Detalhes do Colaborador' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  const [isLogged, setIsLogged] = React.useState(false);
  return (
    <NavigationContainer>
      <AppDrawer />
      {/*isLogged ? <AppDrawer /> : <AuthRoutes />*/}
    </NavigationContainer>
  );
}

function AppDrawer() {
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

const AuthStack = createStackNavigator();
function AuthRoutes() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}
