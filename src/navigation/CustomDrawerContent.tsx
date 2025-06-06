import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import { Home, Settings } from 'lucide-react-native';

export default function CustomDrawerContent(props: any) {
  const { state, navigation } = props;

  function getIconForRoute(routeName: string) {
    switch (routeName) {
      case 'Inicio':
        return Home;
      case 'Configurações':
        return Settings;
      default:
        return Home;
    }
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: '#162B4D', flex: 1 }}
    >
      {/* Cabeçalho do usuário */}
      <View
        className="rounded-lg bg-[#C5D4EB] flex flex-row items-center p-2 justify-between mb-[60px]"
        style={{ alignSelf: 'stretch' }}
      >
        <View
          className="justify-center items-center"
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            borderWidth: 4,
            borderColor: '#162B4D', // ajuste para cor real
          }}
        >
          <Text className="text-white font-bold text-lg">JK</Text>
        </View>
        <View className="flex flex-col pr-2">
          <Text className="text-primary text-sm font-bold">
            Jhonata Kornaker
          </Text>
          <Text className="text-primary text-sm font-bold">Almoxarifado</Text>
        </View>
      </View>

      {/* Botões personalizados */}
      <View>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = getIconForRoute(route.name);

          return (
            <DrawerItem
              key={index}
              label={route.name}
              onPress={() => navigation.navigate(route.name)}
              labelStyle={{
                color: isFocused ? '#C5D4EB' : '#fff',
                fontWeight: 'bold',
                fontSize: 20,
              }}
              icon={({ size }) => (
                <Icon
                  size={size}
                  color={isFocused ? '#C5D4EB' : 'transparent'}
                />
              )}
              style={{
                backgroundColor: isFocused ? '#162B4D' : 'transparent',
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}
