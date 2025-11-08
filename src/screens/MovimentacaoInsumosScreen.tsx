import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { MovimentacaoListaDto } from '@/dtos/movimentacaoDto';
import { listarTodasMovimentacoes } from '@/service/movimentacao.service';
import { theme } from '@/styles/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, AlertCircle } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { showErrorToast } from '@/util/toast';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/types/MainStackNavigator';

type NavigationProps = StackNavigationProp<MainStackParamList, 'MovimentacaoInsumo'>;

export default function MovimentacoesScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoListaDto[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [busca, setBusca] = useState('');

  useFocusEffect(
    useCallback(() => {
      carregarMovimentacoes();
    }, []),
  );

  async function carregarMovimentacoes(isReload = false) {
    try {
      if (isReload) {
        setRecarregando(true);
      } else {
        setCarregando(true);
      }

      const dados = await listarTodasMovimentacoes();
      setMovimentacoes(dados);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      showErrorToast('Não foi possível carregar as movimentações', 'Erro');
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }

  // Filtrar movimentações
  const movimentacoesFiltradas = useMemo(() => {
    if (!busca.trim()) {
      return movimentacoes;
    }

    const textoBusca = busca.toLowerCase();

    return movimentacoes.filter(mov => {
      return (
        mov.insumo.toLowerCase().includes(textoBusca) ||
        mov.fornecedor?.toLowerCase().includes(textoBusca) ||
        mov.colaborador?.toLowerCase().includes(textoBusca) ||
        mov.observacao?.toLowerCase().includes(textoBusca)
      );
    });
  }, [movimentacoes, busca]);

  // Agrupar por data
  const movimentacoesAgrupadas = useMemo(() => {
    const grupos: Record<string, MovimentacaoListaDto[]> = {};

    movimentacoesFiltradas.forEach(mov => {
      const data = new Date(mov.data).toLocaleDateString('pt-BR');
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(mov);
    });

    return Object.entries(grupos).map(([data, itens]) => ({
      data,
      itens,
    }));
  }, [movimentacoesFiltradas]);

  // Contadores
  const totalEntradas = movimentacoes.filter(m => m.tipo === 'ENTRADA').length;
  const totalSaidas = movimentacoes.filter(m => m.tipo === 'SAIDA').length;

  // Atualizar parâmetros da navegação com os totais
  useEffect(() => {
    if (!carregando && movimentacoes.length > 0) {
      navigation.setParams({ totalEntradas, totalSaidas });
    }
  }, [totalEntradas, totalSaidas, carregando, movimentacoes.length]);

  // Renderizar loading inicial
  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  // Renderizar lista vazia
  if (movimentacoes.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma movimentação</Text>
          <Text style={styles.emptySubtitle}>
            Ainda não há movimentações de entrada ou saída registradas.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Campo de busca */}
        <Input
          style={styles.searchInput}
          placeholder="Buscar por insumo, colaborador..."
          icon={Search}
          value={busca}
          onChangeText={setBusca}
        />

        {/* Contador de resultados */}
        {busca.trim() && (
          <Text style={styles.resultadosText}>
            {movimentacoesFiltradas.length}{' '}
            {movimentacoesFiltradas.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        )}

        {/* Lista agrupada por data */}
        <FlatList
          data={movimentacoesAgrupadas}
          keyExtractor={item => item.data}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              {/* Cabeçalho da Data */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{item.data}</Text>
              </View>

              {/* Movimentações do dia */}
              {item.itens.map((mov, index) => (
                <View key={mov.id} style={styles.itemContainer}>
                  {/* Quantidade */}
                  <View style={styles.quantidadeContainer}>
                    <Text style={styles.quantidadeText}>
                      {mov.quantidade.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.unidadeText}>{mov.unidade}</Text>
                  </View>

                  {/* Insumo */}
                  <View style={styles.insumoContainer}>
                    <Text style={styles.insumoText}>{mov.insumo}</Text>
                    {mov.observacao && (
                      <Text style={styles.observacaoText} numberOfLines={1}>
                        {mov.observacao}
                      </Text>
                    )}
                  </View>

                  {/* Responsável */}
                  <View style={styles.responsavelContainer}>
                    <Text style={styles.responsavelText} numberOfLines={1}>
                      {mov.tipo === 'ENTRADA'
                        ? mov.fornecedor || 'Não informado'
                        : mov.colaborador || 'Não informado'}
                    </Text>
                  </View>

                  {/* Ícone de tipo */}
                  <View style={styles.iconContainer}>
                    <Image
                      source={require('../../assets/img_movimentacao.png')}
                      style={[
                        styles.iconImage,
                        {
                          tintColor:
                            mov.tipo === 'ENTRADA'
                              ? 'rgba(34, 197, 94, 0.7)'
                              : 'rgba(239, 68, 68, 0.7)',
                          transform: [
                            {
                              rotate:
                                mov.tipo === 'ENTRADA' ? '0deg' : '180deg',
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={recarregando}
              onRefresh={() => carregarMovimentacoes(true)}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyFilterContainer}>
              <Search size={48} color="#9ca3af" />
              <Text style={styles.emptyFilterText}>
                Nenhuma movimentação encontrada com "{busca}"
              </Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  resultadosText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  dateGroup: {
    backgroundColor: '#ffffff44',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  dateHeader: {
    backgroundColor: '#ffffff44',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#19325E',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quantidadeContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  quantidadeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#19325E',
  },
  unidadeText: {
    fontSize: 11,
    color: '#666',
  },
  insumoContainer: {
    flex: 2,
    paddingHorizontal: 8,
  },
  insumoText: {
    fontSize: 15,
    color: '#19325E',
    fontWeight: '500',
  },
  observacaoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  responsavelContainer: {
    flex: 1.5,
    paddingHorizontal: 8,
  },
  responsavelText: {
    fontSize: 13,
    color: '#374151',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
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
  emptyFilterContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});
