import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InicioScreen from '@/screens/InicioScreen';
import CautelaScreen from '@/screens/CautelaScreen';
import CadastroFerramentas from '@/screens/CadastroFerramentas';
import { TouchableOpacity } from 'react-native';
import { CopyPlus } from 'lucide-react-native';
import DrawerMenuButton from '@/components/DrawerMenuButton';
import { theme } from '@/styles/theme';
import CadastroColaborador from '@/screens/CadastroColaborador';
import CadastroPatrimonio from '@/screens/CadastroPatrimonio';

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#19325E' },
        headerTintColor: theme.colors.secondary,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 24, fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Inicio"
        component={InicioScreen}
        options={({ navigation }) => ({
          title: 'StockFlow',
          headerLeft: () => <DrawerMenuButton />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Cautela')}
              style={{ marginRight: 15 }}
            >
              <CopyPlus size={24} color="#C5D4EB" />
            </TouchableOpacity>
          ),
        })}
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
    </Stack.Navigator>
  );
}
