import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Home,
  User,
  Hammer,
  ClipboardList,
  LogOut,
  Shield,
} from 'lucide-react-native';

export default function DrawerMenuContent({ navigation }) {
  return (
    <View style={styles.drawer}>
      {/* Header com nome do usuário */}
      <View style={styles.userBox}>
        <Text style={styles.userName}>Olá, Jhonata!</Text>
        <Text style={styles.userRole}>Almoxarifado</Text>
      </View>

      {/* Menu de navegação */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Inicio' })}
      >
        <Home color="#C5D4EB" size={20} />
        <Text style={styles.link}>Início</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'Ferramentas',
          })
        }
      >
        <Hammer color="#C5D4EB" size={20} />
        <Text style={styles.link}>Ferramentas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'Colaboradores',
          })
        }
      >
        <User color="#C5D4EB" size={20} />
        <Text style={styles.link}>Colaboradores</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'Patrimonios',
          })
        }
      >
        <Shield color="#C5D4EB" size={20} />
        <Text style={styles.link}>Patrimônios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Cautela' })}
      >
        <ClipboardList color="#C5D4EB" size={20} />
        <Text style={styles.link}>Cautelas</Text>
      </TouchableOpacity>

      {/* Botão de sair */}
      <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]}>
        <LogOut color="#C5D4EB" size={20} />
        <Text style={styles.link}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#162B4D',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  userBox: {
    backgroundColor: '#19325E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  userName: {
    color: '#C5D4EB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#C5D4EB',
    fontSize: 14,
    opacity: 0.7,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  link: {
    color: '#C5D4EB',
    fontSize: 18,
  },
});
