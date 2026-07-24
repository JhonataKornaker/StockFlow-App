import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
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
  ClipboardCheck,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Usuario } from '@/dtos/usuarioDto';
import { useFocusEffect } from '@react-navigation/native';
import { buscarUsuarioLogado } from '@/service/usuario.service';
import { extractFirstAndLastName } from '@/util/extrairNomeSobrenome';

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrap}>
        <Icon color="#B0C4DC" size={18} />
      </View>
      <Text style={styles.link}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DrawerMenuContent({ navigation }) {
  const { signOut } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function buscarUsuario() {
    try {
      const dados = await buscarUsuarioLogado();
      setUsuario({ ...dados, nome: extractFirstAndLastName(dados.nome) });
    } catch (error) {
      console.error('Erro ao buscar usuario:', error);
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

  const nav = (screen: string) => () =>
    navigation.navigate('Home', { screen });

  return (
    <View style={styles.drawer}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.userBox}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {usuario?.nome ?? '—'}
          </Text>
          {!!usuario?.funcao && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{usuario.funcao}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Nav ────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <SectionLabel label="GESTÃO" />
        <MenuItem icon={Hammer} label="Ferramentas" onPress={nav('Ferramentas')} />
        <MenuItem icon={User} label="Colaboradores" onPress={nav('Colaboradores')} />
        <MenuItem icon={Shield} label="Patrimônios" onPress={nav('Patrimonios')} />
        <MenuItem icon={CalendarClock} label="Locações" onPress={nav('Locacoes')} />
        <MenuItem icon={ClipboardList} label="Cautelas" onPress={nav('CautelasAbertas')} />

        <SectionLabel label="ESTOQUE" />
        <MenuItem icon={Package} label="Insumos" onPress={nav('Estoques')} />
        <MenuItem icon={PackageOpen} label="Saída de Insumo" onPress={nav('SaidaInsumo')} />
        <MenuItem icon={ClipboardCheck} label="Inventários" onPress={nav('Inventarios')} />

        <SectionLabel label="RELATÓRIOS" />
        <MenuItem
          icon={BarChart2}
          label="Relatórios"
          onPress={() => navigation.navigate('Home', { screen: 'Relatorios' })}
        />

        <View style={styles.divider} />
        <MenuItem icon={Settings} label="Configurações" onPress={nav('Configuracoes')} />

        <TouchableOpacity style={styles.sairBtn} onPress={signOut} activeOpacity={0.7}>
          <LogOut color="#ef4444" size={18} />
          <Text style={styles.sairText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#162B4D',
    paddingTop: 52,
  },

  // ── Header ──
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3B6DB5',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#B0C4DC',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A6E',
    borderWidth: 1,
    borderColor: '#3B6DB5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleText: {
    color: '#B0C4DC',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: '#ffffff',
    opacity: 0.08,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // ── Section ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: '#4A6FA5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4A6FA5',
    opacity: 0.4,
  },

  // ── MenuItem ──
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  menuIconWrap: {
    width: 28,
    alignItems: 'center',
  },
  link: {
    color: '#B0C4DC',
    fontSize: 15,
  },

  // ── Sair ──
  sairBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 24,
  },
  sairText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
