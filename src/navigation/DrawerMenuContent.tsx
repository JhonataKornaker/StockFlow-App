import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Home,
  User,
  Hammer,
  ClipboardList,
  LogOut,
  Shield,
  Package,
  PackageOpen,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Usuario } from '@/dtos/usuarioDto';
import { useFocusEffect } from '@react-navigation/native';
import { buscarUsuarioLogado } from '@/service/usuario.service';
import { extractFirstAndLastName } from '@/util/extrairNomeSobrenome';

export default function DrawerMenuContent({ navigation }) {
  const { signOut } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  async function buscarUsuario(isReload = false) {
    try {
      if (isReload) {
        setRecarregando(true);
      } else {
        setCarregando(true);
      }
      const dados = await buscarUsuarioLogado();
      const nomeSobrenome = extractFirstAndLastName(dados.nome);

      const usuarioFormatado = {
        ...dados,
        nome: nomeSobrenome,
      };

      setUsuario(usuarioFormatado);
    } catch (error) {
      console.error('Erro ao buscar usuario:', error);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarUsuario();
    }, []),
  );

  return (
    <View style={styles.drawer}>
      {/* Header com nome do usuário */}
      <View style={styles.userBox}>
        <Text style={styles.userName}>{usuario?.nome}</Text>
        <Text style={styles.userRole}>{usuario?.funcao}</Text>
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
        onPress={() =>
          navigation.navigate('Home', { screen: 'CautelasAbertas' })
        }
      >
        <ClipboardList color="#C5D4EB" size={20} />
        <Text style={styles.link}>Cautelas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Estoques' })}
      >
        <Package color="#C5D4EB" size={20} />
        <Text style={styles.link}>Estoque</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'SaidaInsumo' })}
      >
        <PackageOpen color="#C5D4EB" size={20} />
        <Text style={styles.link}>Saida De Insumo</Text>
      </TouchableOpacity>

      {/* Botão de sair */}
      <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]}>
        <LogOut color="#C5D4EB" size={20} />
        <Text
          style={styles.link}
          //Resetar a stack de telas e mandar para tela login
          onPress={signOut}
        >
          Sair
        </Text>
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
