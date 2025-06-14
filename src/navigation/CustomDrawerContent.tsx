import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { Home, Search, Settings, Wrench } from 'lucide-react-native';

export default function CustomDrawerContent(props: any) {
  const { navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.drawerContent, { padding: 0 }]}
    >
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>JK</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Jhonata Kornaker</Text>
          <Text style={styles.userRole}>Almoxarifado</Text>
        </View>
      </View>

      <View>
        <DrawerItem
          label="Inicio"
          onPress={() => navigation.navigate('Main', { screen: 'Inicio' })}
          labelStyle={{ color: '#C5D4EB', fontWeight: 'bold', fontSize: 20 }}
          icon={({ size }) => <Home size={size} color={'#C5D4EB'} />}
          style={{
            backgroundColor: '#162B4D',
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <DrawerItem
          label="Cadastro Ferramentas"
          onPress={() =>
            navigation.navigate('Main', { screen: 'CadastroFerramentas' })
          }
          labelStyle={{ color: '#C5D4EB', fontWeight: 'bold', fontSize: 20 }}
          icon={({ size }) => <Wrench size={size} color={'#C5D4EB'} />}
          style={{
            backgroundColor: '#162B4D',
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <DrawerItem
          label="Cautela"
          onPress={() => navigation.navigate('Main', { screen: 'Cautela' })}
          labelStyle={{ color: '#C5D4EB', fontWeight: 'bold', fontSize: 20 }}
          icon={({ size }) => <Search size={size} color={'#C5D4EB'} />}
          style={{
            backgroundColor: '#162B4D',
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    backgroundColor: '#162B4D',
    flex: 1,
  },
  userHeader: {
    backgroundColor: '#C5D4EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 60,
    borderRadius: 10,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    borderColor: '#162B4D',
  },
  avatarText: {
    color: '#162B4D',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  userName: {
    color: '#162B4D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#162B4D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
