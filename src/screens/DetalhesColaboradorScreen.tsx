import { Screen } from '@/components/ScreenProps';
import { HistoricoCautelaColaborador } from '@/dtos/historicoDto';
import { buscarHistoricoCautelaColaborador } from '@/service/historico.service';
import { listarTodasMovimentacoes } from '@/service/movimentacao.service';
import { MovimentacaoListaDto } from '@/dtos/movimentacaoDto';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { User, UserCircle, UserCircle2 } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';

type DetalhesColaboradorProps = RouteProp<
  MainStackParamList,
  'DetalhesColaborador'
>;

export default function DetalhesColaborador() {
  const route = useRoute<DetalhesColaboradorProps>();
  const { colaborador } = route.params;
  const [historico, setHistorico] = useState<HistoricoCautelaColaborador[]>([]);
  const [historicoInsumos, setHistoricoInsumos] = useState<
    MovimentacaoListaDto[]
  >([]);

const carregarDados = useCallback(async () => {
  try {
    const dados = await buscarHistoricoCautelaColaborador(colaborador.id);
    setHistorico(dados);

    const movs = await listarTodasMovimentacoes();
    const doColaborador = movs.filter(
      m => m.tipo === 'SAIDA' && m.colaborador === colaborador.nome,
    );
    setHistoricoInsumos(doColaborador);
  } catch (error) {
    console.error('Erro ao buscar dados do colaborador:', error);
  }
}, [colaborador.id, colaborador.nome]);

useEffect(() => {
  carregarDados();
}, [carregarDados]);

useFocusEffect(
  useCallback(() => {
    carregarDados();
  }, [carregarDados]),
);

  const tryParseDate = (str: string): Date | null => {
    // Tenta ISO completo
    const isoMillis = Date.parse(str);
    if (!Number.isNaN(isoMillis)) return new Date(isoMillis);

    // Tenta formatos brasileiros: dd/MM/yyyy e dd/MM/yyyy HH:mm[:ss]
    const brMatch = str.match(
      /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
    );
    if (brMatch) {
      const [, dd, mm, yyyy, hh, min, ss] = brMatch;
      const date = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        hh ? Number(hh) : 0,
        min ? Number(min) : 0,
        ss ? Number(ss) : 0,
      );
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Tenta yyyy-MM-dd
    const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
      const [, y, m, d] = ymd;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  };

  const formatDateStr = (str?: string) => {
    if (!str) return '-';
    const parsed = tryParseDate(str);
    return parsed ? parsed.toLocaleDateString('pt-BR') : '-';
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingRight: 7 }}
      >
      {/* Header do Colaborador */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginTop: 22,
          marginLeft: 7,
        }}
      >
        <UserCircle2 size={60} strokeWidth={1} color="#19325E" />
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#19325E',
            }}
          >
            {colaborador.nome}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#19325E',
            }}
          >
            {colaborador.funcao}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#19325E',
            }}
          >
            {colaborador.empresa}
          </Text>
        </View>
      </View>

      {/* Conteúdo em cards */}
      {historico.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.noText}>
            Nenhuma ferramenta ou patrimônio foi retirado ainda.
          </Text>
        </View>
      ) : (
        <>
          {/* Cautelas Abertas */}
          {historico.some(item => item.cautelaFechada === false) && (
            <>
              <Text style={styles.sectionTitle}>Cautelas Abertas</Text>
              {historico
                .filter(item => item.cautelaFechada === false)
                .map((item, index) => (
                  <View key={index} style={styles.card}>
                    <View style={styles.itemRowHorizontal}>
                      <Text style={styles.itemMain} numberOfLines={1}>
                        {item.descricao}
                      </Text>
                      <Text style={styles.itemMainRight}>
                        {item.numeroSerie ?? item.quantidade}
                      </Text>
                      <Text style={styles.itemMainRight}>
                        {`R • ${formatDateStr((item as any).dataRetirada || (item as any).data || (item as any).dataSaida || (item as any).dataInicio)}`}
                      </Text>
                    </View>
                  </View>
                ))}
            </>
          )}

          {/* Histórico de Cautelas */}
          {historico.some(item => item.cautelaFechada === true) && (
            <>
              <Text style={styles.sectionTitle}>Histórico de Cautelas</Text>
              {historico
                .filter(item => item.cautelaFechada === true)
                .map((item, index) => (
                  <View key={index} style={styles.card}>
                    <View style={styles.itemRowHorizontal}>
                      <Text style={styles.itemMain} numberOfLines={1}>
                        {item.descricao}
                      </Text>
                      <Text style={styles.itemMainRight}>
                        {`R • ${formatDateStr((item as any).dataRetirada || (item as any).data || (item as any).dataSaida || (item as any).dataInicio)}`}
                      </Text>
                      <Text style={styles.itemMainRight}>
                        {`D • ${formatDateStr((item as any).dataEntrega || (item as any).dataDevolucao || (item as any).dataEntrada || (item as any).dataFim || (item as any).data)}`}
                      </Text>
                    </View>
                  </View>
                ))}
            </>
          )}

          {/* Histórico de Insumos (retiradas) */}
          {historicoInsumos.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Histórico de Insumos</Text>
              {historicoInsumos.map((mov, index) => (
                <View key={index} style={styles.card}>
                  <View style={styles.itemRowHorizontal}>
                    <Text style={styles.itemMain} numberOfLines={1}>
                      {mov.insumo}
                    </Text>
                    <Text style={styles.itemMainRight}>
                      {`${formatDateStr(mov.data)}`}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff55',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19325E',
    marginTop: 24,
    marginLeft: 7,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19325E',
    marginBottom: 8,
  },
  itemRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemMain: {
    fontSize: 16,
    color: '#19325E',
    fontWeight: '500',
  },
  itemMainRight: {
    fontSize: 14,
    color: '#19325E',
    fontWeight: '500',
    textAlign: 'right',
  },
  itemSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
  },
  emptyWrapper: {
    marginLeft: 7,
    marginTop: 40,
    paddingRight: 7,
  },
});
