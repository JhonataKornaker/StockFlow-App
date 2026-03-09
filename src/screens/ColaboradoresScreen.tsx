import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { ColaboradorDto } from '@/dtos/colaboradorDto';
import { buscarColaboradores, deletarColaborador } from '@/service/colaborador.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Contact, Edit2, History, Search, Trash2, UserPlus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { showErrorToast, showSuccessToast } from '@/util/toast';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Colaboradores'>;

function getInitials(nome: string) {
  const parts = nome.trim().split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

function ColaboradorCard({
  item,
  onHistorico,
  onEditar,
  onExcluir,
}: {
  item: ColaboradorDto;
  onHistorico: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const initials = getInitials(item.nome);

  return (
    <View style={styles.card}>
      {/* Avatar + info */}
      <TouchableOpacity style={styles.cardMain} onPress={onHistorico} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{item.funcao}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{item.empresa}</Text>
        </View>
      </TouchableOpacity>

      {/* Ações */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onHistorico} activeOpacity={0.7}>
          <History size={18} color={theme.colors.primary} />
          <Text style={styles.actionLabel}>Histórico</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.iconBtn} onPress={onEditar} activeOpacity={0.7}>
          <Edit2 size={18} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onExcluir} activeOpacity={0.7}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Colaboradores() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaColaboradores, setListaColaboradores] = useState<ColaboradorDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarColaboradores();
    }, []),
  );

  async function carregarColaboradores() {
    const startedAt = Date.now();
    try {
      setCarregando(true);
      const dados = await buscarColaboradores();
      setListaColaboradores(dados);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise(res => setTimeout(res, wait));
      setCarregando(false);
    }
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listaColaboradores.filter(item =>
      item.nome.toLowerCase().includes(texto) ||
      item.funcao.toLowerCase().includes(texto) ||
      item.empresa.toLowerCase().includes(texto),
    );
  }, [busca, listaColaboradores]);

  const sections = useMemo(() => agruparPorLetra(itensFiltrados), [itensFiltrados]);

  function handleExcluir(item: ColaboradorDto) {
    Alert.alert(
      'Excluir Colaborador',
      `Tem certeza que deseja excluir "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarColaborador(item.id);
              showSuccessToast('Colaborador excluído com sucesso!');
              carregarColaboradores();
            } catch (error: any) {
              const message =
                error.response?.data?.message ?? 'Não foi possível excluir o colaborador.';
              showErrorToast(message, 'Erro ao excluir colaborador');
            }
          },
        },
      ],
    );
  }

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (listaColaboradores.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Contact size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum colaborador cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Comece cadastrando o primeiro colaborador para gerenciar cautelas e retiradas.
          </Text>
          <Button
            title="Cadastrar Colaborador"
            onPress={() => navigation.navigate('CadastroColaborador')}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Input
        style={{ marginTop: 8, marginBottom: 4 }}
        placeholder="Buscar por nome, função ou empresa..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ColaboradorCard
            item={item}
            onHistorico={() => navigation.navigate('DetalhesColaborador', { colaborador: item })}
            onEditar={() => navigation.navigate('EditarColaborador', { colaborador: item })}
            onExcluir={() => handleExcluir(item)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>{title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      <Button
        style={{ alignSelf: 'center', marginBottom: 16 }}
        title="Cadastrar Novo Colaborador"
        onPress={() => navigation.navigate('CadastroColaborador')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section header
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardSub: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Ações
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
