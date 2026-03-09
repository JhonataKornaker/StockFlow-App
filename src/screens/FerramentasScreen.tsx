import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { FerramentasDto } from '@/dtos/ferramentasDto';
import { deletarFerramenta, listarFerramentas } from '@/service/ferramenta.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { showErrorToast, showSuccessToast } from '@/util/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit2, Hammer, Package, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Ferramentas'>;

function FerramentaCard({
  item,
  onEditar,
  onExcluir,
}: {
  item: FerramentasDto;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const emprestado = item.quantidade - item.disponivel;
  const dispColor = item.disponivel === 0 ? '#ef4444' : item.disponivel <= 2 ? '#f59e0b' : '#22c55e';

  return (
    <TouchableOpacity style={styles.card} onPress={onEditar} activeOpacity={0.85}>
      {/* Ícone + info */}
      <View style={styles.cardMain}>
        <View style={styles.iconWrap}>
          <Hammer size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={1}>{item.descricao}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.marca} · {item.modelo}
          </Text>
        </View>
        <View style={styles.qtdGroup}>
          <View style={[styles.qtdPill, { backgroundColor: dispColor + '18', borderColor: dispColor }]}>
            <Text style={[styles.qtdNum, { color: dispColor }]}>{item.disponivel}</Text>
            <Text style={[styles.qtdLabel, { color: dispColor }]}>disp.</Text>
          </View>
          {emprestado > 0 && (
            <View style={[styles.qtdPill, { backgroundColor: '#fff7ed', borderColor: '#f97316' }]}>
              <Text style={[styles.qtdNum, { color: '#f97316' }]}>{emprestado}</Text>
              <Text style={[styles.qtdLabel, { color: '#f97316' }]}>emp.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Ações */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEditar} activeOpacity={0.7}>
          <Edit2 size={16} color="#6b7280" />
          <Text style={styles.actionLabel}>Editar</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionBtn} onPress={onExcluir} activeOpacity={0.7}>
          <Trash2 size={16} color="#ef4444" />
          <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function Ferramentas() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [listaFerramentas, setListaFerramentas] = useState<FerramentasDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarFerramentas();
    }, []),
  );

  async function carregarFerramentas() {
    const startedAt = Date.now();
    try {
      setCarregando(true);
      const dados = await listarFerramentas();
      setListaFerramentas(dados);
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise(res => setTimeout(res, wait));
      setCarregando(false);
    }
  }

  function handleExcluir(item: FerramentasDto) {
    Alert.alert(
      'Excluir Ferramenta',
      `Tem certeza que deseja excluir "${item.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarFerramenta(item.id);
              showSuccessToast('Ferramenta excluída com sucesso!');
              carregarFerramentas();
            } catch (error: any) {
              const message =
                error.response?.data?.message ?? 'Não foi possível excluir a ferramenta';
              showErrorToast(String(message), 'Erro ao excluir ferramenta');
            }
          },
        },
      ],
    );
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return listaFerramentas.filter(
      item =>
        item.descricao.toLowerCase().includes(texto) ||
        item.marca.toLowerCase().includes(texto) ||
        item.modelo.toLowerCase().includes(texto),
    );
  }, [busca, listaFerramentas]);

  const sections = useMemo(() => agruparPorLetra(itensFiltrados), [itensFiltrados]);

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (listaFerramentas.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma ferramenta cadastrada</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre suas ferramentas para controlar empréstimos e disponibilidade.
          </Text>
          <Button
            title="Cadastrar Ferramenta"
            onPress={() => navigation.navigate('CadastroFerramentas')}
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
        placeholder="Buscar por nome, marca ou modelo..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <FerramentaCard
            item={item}
            onEditar={() => navigation.navigate('EditarFerramenta', { ferramenta: item })}
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
        title="Cadastrar Nova Ferramenta"
        onPress={() => navigation.navigate('CadastroFerramentas')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
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
  qtdGroup: {
    flexShrink: 0,
    gap: 4,
    alignItems: 'flex-end',
  },
  qtdPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtdNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  qtdLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#f3f4f6',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
});
