import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import CardCautelas from '@/components/CardCautelas';
import { Screen } from '@/components/ScreenProps';
import { theme } from '@/styles/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, AlertCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { buscarCautelas, finalizarCautelas } from '@/service/cautela.service';
import { showErrorToast, showSuccessToast } from '@/util/toast';

interface Ferramenta {
  descricao: string;
  quantidade: number;
  modelo: string;
  marca: string;
}

interface Patrimonio {
  descricao: string;
  numeroSerie: string;
  modelo: string;
  marca: string;
}

interface Colaborador {
  nome: string;
  funcao: string;
  empresa: string;
}

interface Cautela {
  id: number;
  tipo: string;
  data: string;
  entregue: boolean;
  colaborador: Colaborador;
  ferramentas: Ferramenta[];
  patrimonios: Patrimonio[];
}

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'CautelasAbertas'
>;

export default function CautelasAbertasScreen() {
  const [listaDeCautelas, setListaDeCautelas] = useState<Cautela[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [busca, setBusca] = useState('');
  const navigation = useNavigation<NavigationProps>();

  useFocusEffect(
    useCallback(() => {
      carregarCautelas();
    }, []),
  );

  // Atualizar parâmetros de navegação com a quantidade de cautelas
  useEffect(() => {
    if (!carregando && listaDeCautelas.length > 0) {
      navigation.setParams({ quantidadeCautelas: listaDeCautelas.length });
    }
  }, [listaDeCautelas, carregando, navigation]);

  async function carregarCautelas(isReload = false) {
    try {
      if (isReload) {
        setRecarregando(true);
      } else {
        setCarregando(true);
      }

      const dados = await buscarCautelas();

      if (dados.length > 0) {
        // Filtrar apenas cautelas não entregues (abertas)
        const cautelasAbertas = dados.filter(cautela => !cautela.entregue);
        setListaDeCautelas(cautelasAbertas);
      } else {
        setListaDeCautelas([]);
      }
    } catch (error) {
      console.error('Erro ao buscar cautelas:', error);
      showErrorToast(
        'Não foi possível carregar as cautelas',
        'Erro ao carregar',
      );
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }

  async function handleFinalizarCautela(id: number) {
    Alert.alert(
      'Confirmar Finalização',
      'Deseja realmente finalizar esta cautela?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              await finalizarCautelas(id);
              showSuccessToast('Cautela finalizada com sucesso!');
              carregarCautelas();
            } catch (error) {
              console.error('Erro ao finalizar cautela:', error);
              showErrorToast(
                'Não foi possível finalizar a cautela',
                'Erro ao finalizar',
              );
            }
          },
        },
      ],
    );
  }

  // Filtrar cautelas por busca
  const cautelasFiltradas = useMemo(() => {
    if (!busca.trim()) {
      return listaDeCautelas;
    }

    const textoBusca = busca.toLowerCase();

    return listaDeCautelas.filter(cautela => {
      // Buscar por nome, função ou empresa do colaborador
      const colaboradorMatch =
        cautela.colaborador.nome.toLowerCase().includes(textoBusca) ||
        cautela.colaborador.funcao.toLowerCase().includes(textoBusca) ||
        cautela.colaborador.empresa.toLowerCase().includes(textoBusca);

      // Buscar em ferramentas
      const ferramentasMatch = cautela.ferramentas.some(
        ferramenta =>
          ferramenta.descricao.toLowerCase().includes(textoBusca) ||
          ferramenta.marca.toLowerCase().includes(textoBusca) ||
          ferramenta.modelo.toLowerCase().includes(textoBusca),
      );

      // Buscar em patrimônios
      const patrimoniosMatch = cautela.patrimonios.some(
        patrimonio =>
          patrimonio.descricao.toLowerCase().includes(textoBusca) ||
          patrimonio.numeroSerie.toLowerCase().includes(textoBusca) ||
          patrimonio.marca.toLowerCase().includes(textoBusca) ||
          patrimonio.modelo.toLowerCase().includes(textoBusca),
      );

      return colaboradorMatch || ferramentasMatch || patrimoniosMatch;
    });
  }, [listaDeCautelas, busca]);

  // Renderizar loading inicial
  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  // Renderizar lista vazia
  if (listaDeCautelas.length === 0) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma cautela em aberto</Text>
          <Text style={styles.emptySubtitle}>
            Todas as cautelas foram finalizadas ou não há cautelas cadastradas.
          </Text>
          <Button
            title="Recarregar"
            onPress={() => carregarCautelas(true)}
            style={{ marginTop: 20 }}
          />
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
          placeholder="Buscar por colaborador, item..."
          icon={Search}
          value={busca}
          onChangeText={setBusca}
        />

        {/* Contador de resultados filtrados */}
        {busca.trim() && (
          <Text style={styles.resultadosText}>
            {cautelasFiltradas.length}{' '}
            {cautelasFiltradas.length === 1 ? 'resultado' : 'resultados'}{' '}
            encontrado{cautelasFiltradas.length !== 1 ? 's' : ''}
          </Text>
        )}

        {/* Lista de cautelas */}
        <FlatList
          data={cautelasFiltradas}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <CardCautelas
                cautelas={item}
                onFinalizar={handleFinalizarCautela}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={recarregando}
              onRefresh={() => carregarCautelas(true)}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyFilterContainer}>
              <Search size={48} color="#9ca3af" />
              <Text style={styles.emptyFilterText}>
                Nenhuma cautela encontrada com "{busca}"
              </Text>
              <Button
                title="Limpar busca"
                onPress={() => setBusca('')}
                style={{ marginTop: 16 }}
              />
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
  cardWrapper: {
    marginBottom: 12,
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
