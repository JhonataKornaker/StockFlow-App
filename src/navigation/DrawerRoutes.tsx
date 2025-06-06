import { createDrawerNavigator } from '@react-navigation/drawer';
import InicioScreen from '@/screens/InicioScreen';
import { View, Text, TouchableOpacity } from 'react-native';
import HeaderTitle from '@/components/HeaderTitle';
import DrawerMenuButton from '@/components/DrawerMenuButton';
import { CopyPlus } from 'lucide-react-native';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#162B4D',
          width: 235, // largura do Drawer
        },
        headerStyle: {
          backgroundColor: '#19325E',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', width: 120 }}>
            <HeaderTitle />
            <Text></Text>
          </View>
        ),
        headerLeft: () => <DrawerMenuButton />,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => alert('Botão à direita')}
            style={{ marginRight: 15 }}
          >
            <CopyPlus size={24} color="#C5D4EB" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Inicio" component={InicioScreen} />
    </Drawer.Navigator>
  );
}
