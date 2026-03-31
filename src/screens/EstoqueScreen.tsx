import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { EstoqueDto } from '@/dtos/estoqueDto';
import { deletarInsumo, listarEstoques } from '@/service/controleEstoque.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { agruparPorLetra } from '@/util/agrupadores';
import { showErrorToast, showSuccessToast } from '@/util/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlertTriangle, MapPin, Package, PackagePlus, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'Estoques'>;

function EstoqueCard({
  item,
  onEditar,
  onExcluir,
  onReabastecer,
}: {
  item: EstoqueDto;
  onEditar: () => void;
  onExcluir: () => void;
  onReabastecer: () => void;
}) {
  const baixo = item.estoqueBaixo;
  const iconColor = baixo ? '#ef4444' : theme.colors.primary;
  const iconBg = baixo ? '#fee2e2' : '#EEF2FF';

  const pct = item.quantidadeMaxima
    ? Math.min(item.quantidadeAtual / item.quantidadeMaxima, 1)
    : null;
  const barColor = baixo ? '#ef4444' : pct !== null && pct > 0.5 ? '#22c55e' : '#f59e0b';

  return (
    <TouchableOpacity style={styles.card} onPress={onEditar} activeOpacity={0.85}>
      <View style={styles.cardMain}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          {baixo
            ? <AlertTriangle size={22} color={iconColor} />
            : <Package size={22} color={iconColor} />
          }
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardNomeRow}>
            <Text
              style={[styles.cardNome, baixo && { color: '#ef4444' }]}
              numberOfLines={1}
            >
              {item.insumo.descricao}
            </Text>
            {baixo && (
              <View style={styles.baixoBadge}>
                <Text style={styles.baixoBadgeText}>BAIXO</Text>
              </View>
            )}
          </View>

          <View style={styles.qtdRow}>
            <Text style={styles.qtdText}>
              <Text style={[styles.qtdNum, { color: barColor }]}>{item.quantidadeAtual}</Text>
              <Text style={styles.qtdSep}> / mín. {item.quantidadeMinima} {item.insumo.unidade}</Text>
            </Text>
          </View>

          {pct !== null && (
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
            </View>
          )}

          <View style={styles.metaRow}>
            {item.insumo.marca && (
              <Text style={styles.metaText}>{item.insumo.marca}</Text>
            )}
            {item.localizacao && (
              <View style={styles.metaChip}>
                <MapPin size={10} color="#6b7280" />
                <Text style={styles.metaText}>{item.localizacao}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ícones de ação à direita */}
        <View style={styles.cardIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={e => { e.stopPropagation?.(); onReabastecer(); }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <PackagePlus size={20} color="#162B4D" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={e => { e.stopPropagation?.(); onExcluir(); }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Estoques() {
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();
  const [estoques, setEstoques] = useState<EstoqueDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarEstoques();
    }, []),
  );

  async function carregarEstoques() {
    const startedAt = Date.now();
    try {
      setCarregando(true);
      const dados = await listarEstoques();
      setEstoques(dados);
    } catch (error) {
      console.error('Erro ao carregar estoques:', error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise(res => setTimeout(res, wait));
      setCarregando(false);
    }
  }

  function handleExcluir(item: EstoqueDto) {
    Alert.alert(
      'Excluir Insumo',
      `Tem certeza que deseja excluir "${item.insumo.descricao}"?\n\nIsso também excluirá o estoque e o histórico de movimentações.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarInsumo(item.insumo.id);
              showSuccessToast('Insumo excluído com sucesso!');
              carregarEstoques();
            } catch (error: any) {
              const message =
                error.response?.data?.message ?? 'Não foi possível excluir o insumo';
              showErrorToast(message, 'Erro ao excluir');
            }
          },
        },
      ],
    );
  }

  const itensFiltrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return estoques.filter(
      item =>
        item.insumo.descricao.toLowerCase().includes(texto) ||
        (item.insumo.marca ?? '').toLowerCase().includes(texto) ||
        (item.insumo.codigo ?? '').toLowerCase().includes(texto) ||
        (item.localizacao ?? '').toLowerCase().includes(texto),
    );
  }, [busca, estoques]);

  // agruparPorLetra espera objetos com `descricao` — mapeia a partir do insumo
  const sections = useMemo(() => {
    const mapped = itensFiltrados.map(e => ({ ...e, descricao: e.insumo.descricao }));
    return agruparPorLetra(mapped);
  }, [itensFiltrados]);

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (estoques.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum insumo cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre insumos para controlar entrada e saída de materiais de consumo.
          </Text>
          <Button
            title="Cadastrar Insumo"
            onPress={() => navigation.navigate('CadastroInsumo')}
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
        placeholder="Buscar por nome, marca, código..."
        icon={Search}
        value={busca}
        onChangeText={setBusca}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <EstoqueCard
            item={item}
            onEditar={() => navigation.navigate('EditarInsumo', { insumo: item })}
            onExcluir={() => handleExcluir(item)}
            onReabastecer={() => navigation.navigate('ReabastecerInsumo', { estoque: item })}
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
        title="Cadastrar Novo Insumo"
        onPress={() => navigation.navigate('CadastroInsumo')}
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
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardNomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardNome: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    flexShrink: 1,
  },
  baixoBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  baixoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.5,
  },
  qtdRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  qtdText: {
    fontSize: 13,
  },
  qtdNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  qtdSep: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  iconBtn: {
    padding: 4,
  },
});
