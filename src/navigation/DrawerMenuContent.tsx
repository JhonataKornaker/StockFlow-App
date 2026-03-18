import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Home,
  User,
  Hammer,
  ClipboardList,
  LogOut,
  Settings,
  Shield,
  Package,
  PackageOpen,
  CalendarClock,
  BarChart2,
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

  const initials = useMemo(() => {
    const nome = usuario?.nome?.trim() || '';
    if (!nome) return '';
    const partes = nome.split(' ').filter(Boolean);
    const primeira = partes[0]?.[0] || '';
    const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] || '' : '';
    return `${primeira}${ultima}`.toUpperCase();
  }, [usuario?.nome]);

  return (
    <View style={styles.drawer}>
      {/* Header com nome do usuário */}
      <View style={styles.userBox}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{usuario?.nome}</Text>
        {!!usuario?.funcao && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{usuario.funcao}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Menu de navegação */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Inicio' })}
      >
        <Home color="#B0C4DC" size={20} />
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
        <Hammer color="#B0C4DC" size={20} />
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
        <User color="#B0C4DC" size={20} />
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
        <Shield color="#B0C4DC" size={20} />
        <Text style={styles.link}>Patrimônios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'Locacoes',
          })
        }
      >
        <CalendarClock color="#B0C4DC" size={20} />
        <Text style={styles.link}>Locações</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', { screen: 'CautelasAbertas' })
        }
      >
        <ClipboardList color="#B0C4DC" size={20} />
        <Text style={styles.link}>Cautelas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Estoques' })}
      >
        <Package color="#B0C4DC" size={20} />
        <Text style={styles.link}>Estoque</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'SaidaInsumo' })}
      >
        <PackageOpen color="#B0C4DC" size={20} />
        <Text style={styles.link}>Saida De Insumo</Text>
      </TouchableOpacity>

      {/* Botão de sair */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'RelatorioInsumos' })}
      >
        <BarChart2 color="#B0C4DC" size={20} />
        <Text style={styles.link}>Relatório de Insumos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'RelatorioLocacoes' })}
      >
        <CalendarClock color="#B0C4DC" size={20} />
        <Text style={styles.link}>Relatório de Locações</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'Configuracoes' })}
      >
        <Settings color="#B0C4DC" size={20} />
        <Text style={styles.link}>Configurações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]}>
        <LogOut color="#B0C4DC" size={20} />
        <Text
          style={styles.link}
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
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  userBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E3A6E',
    borderWidth: 2.5,
    borderColor: '#B0C4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#B0C4DC',
    fontSize: 26,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#B0C4DC',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#162B4D',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#B0C4DC',
    opacity: 0.15,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
    paddingHorizontal: 4,
  },
  link: {
    color: '#B0C4DC',
    fontSize: 16,
  },
});
