import CardCautelas from '@/components/CardCautelas';
import { Screen } from '@/components/ScreenProps';
import { theme } from '@/styles/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CopyPlus, Menu } from 'lucide-react-native';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useCallback, useEffect, useState } from 'react';
import { buscarCautelas, finalizarCautelas } from '@/service/cautela.service';
import { CautelaDTO } from '@/dtos/cautelaDto';
import { ActivityIndicator } from 'react-native-paper';
import { ResumoMovimentacaoEstoque } from '@/dtos/movimentacaoDto';
import { buscarResumoMovimentacao } from '@/service/movimentacao.service';
import CardMovimentacao from '@/components/CardMovimentacao';
import { buscarResumoNumerico } from '@/service/controleEstoque.service';
import { ResumoNumerico } from '@/dtos/estoqueDto';

export default function InicioScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [listaDeCautelas, setListaDeCautelas] = useState<CautelaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [resumo, setResumo] = useState<ResumoNumerico | null>(null);
  const [movimentacao, setMovimentacao] =
    useState<ResumoMovimentacaoEstoque | null>(null);

  async function carregarCautelas(isReload = false) {
    try {
      if (isReload) {
        setRecarregando(true);
      } else {
        setCarregando(true);
      }
      const dados = await buscarCautelas();
      if (dados.length > 0) {
        setListaDeCautelas(dados.filter(cautela => !cautela.entregue));
      }
    } catch (error) {
      console.error('Erro ao buscar cautelas:', error);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }

  const carregarMovimentacao = async () => {
    try {
      const data = await buscarResumoMovimentacao();
      setMovimentacao(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  const carregarResumo = async () => {
    try {
      const data = await buscarResumoNumerico();
      setResumo(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarCautelas();
      carregarMovimentacao();
      carregarResumo();
    }, []),
  );

  async function finalizarCautelaHandler(id: number) {
    try {
      console.log('Apertou');
      await finalizarCautelas(id);
      await carregarCautelas(true);
    } catch (error) {
      console.error('Erro ao buscar cautelas:', error);
    }
  }

  if (carregando) {
    return (
      <Screen
        style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Screen>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#162B4D',
      }}
    >
      {/* 🔹 HEADER FIXO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Menu color="#C5D4EB" size={24} />
        </TouchableOpacity>

        <Text style={styles.titleHeader}>StockFlow</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Cautela')}>
          <CopyPlus size={24} color="#C5D4EB" />
        </TouchableOpacity>
      </View>

      {/* 🔹 CONTEÚDO SCROLLÁVEL */}
      <Screen scrollable>
        {/* 🔸 CARD: Resumo Rápido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo Rápido</Text>
          <View style={styles.resumoInfo}>
            <Text style={styles.resumoItem}>
              {`Entradas: ${resumo?.totalEntradas || 0}`}
            </Text>
            <Text style={styles.resumoItem}>
              {`Saídas: ${resumo?.totalSaidas || 0}`}
            </Text>
            <Text style={styles.resumoItem}>
              {`Cautelas Abertas: ${resumo?.cautelasAbertas || 0}`}
            </Text>
          </View>
        </View>

        {/* 🔸 CARD: Cautelas Abertas */}
        <View style={styles.cardCautela}>
          <Text style={styles.cardTitle}>Cautelas Abertas</Text>
          {listaDeCautelas.length === 0 ? (
            <Text style={styles.noCautelaText}>
              Nenhuma cautela aberta no momento.
            </Text>
          ) : (
            <>
              {listaDeCautelas.slice(0, 2).map((item, index) => (
                <View key={index} style={styles.cardContainer}>
                  <CardCautelas
                    cautelas={item}
                    onFinalizar={finalizarCautelaHandler}
                  />
                </View>
              ))}

              {listaDeCautelas.length > 3 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CautelasAbertas')}
                  style={styles.verMaisButton}
                >
                  <Text style={styles.verMaisText}>Ver mais</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* 🔸 CARD: Movimentação do Estoque */}
        <View style={styles.cardMovimentacao}>
          <Text style={styles.cardTitle}>Movimentação do Estoque</Text>

          {!movimentacao ||
          (!movimentacao.ultimaEntrada && !movimentacao.ultimaSaida) ? (
            <Text style={styles.noCautelaText}>
              Nenhuma movimentação registrada no momento.
            </Text>
          ) : (
            <>
              <CardMovimentacao movimentacao={movimentacao} />

              {((resumo?.totalEntradas ?? 0) > 1 ||
                (resumo?.totalSaidas ?? 0) > 1) && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('MovimentacaoInsumo')}
                  style={styles.verMaisButton}
                >
                  <Text style={styles.verMaisText}>Ver mais</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 8,
  },
  card: {
    backgroundColor: '#ffffff55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  cardCautela: {
    backgroundColor: '#ffffff55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 200,
  },
  cardMovimentacao: {
    backgroundColor: '#ffffff55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    height: 200,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  resumoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumoItem: {
    color: '#19325E',
    fontSize: 16,
    fontWeight: '500',
  },
  cardContainer: {
    marginBottom: 10,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  noCautelaText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 6,
  },
  verMaisButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff11',
  },
  verMaisText: {
    color: '#1a3255ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#19325E',
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleHeader: {
    color: '#C5D4EB',
    fontWeight: 'bold',
    fontSize: 22,
  },
  movimentacaoItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detalhes: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  insumo: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
