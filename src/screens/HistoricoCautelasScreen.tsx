import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { CautelaDTO } from '@/dtos/cautelaDto';
import { buscarCautelas } from '@/service/cautela.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { parseApiError, showErrorToast } from '@/util/toast';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CheckCircle2, ChevronRight, ClipboardList, Clock } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'HistoricoCautelas'>;
type Filtro = 'todas' | 'abertas' | 'entregues';

// ─── Tipos internos ──────────────────────────────────────────────────────────

interface ColaboradorAgrupado {
  colaboradorId: number;
  colaborador: { nome: string; funcao: string; empresa: string };
  abertas: number;
  entregues: number;
  total: number;
}

interface GrupoData {
  data: string;
  timestamp: number;
  colaboradores: ColaboradorAgrupado[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDataBR(dataStr: string): number {
  const [dd, mm, yyyy] = dataStr.split('/');
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
}

function getInitials(nome: string): string {
  const partes = nome.trim().split(' ').filter(Boolean);
  const a = partes[0]?.[0] ?? '';
  const b = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';
  return `${a}${b}`.toUpperCase();
}

function agrupar(cautelas: CautelaDTO[], filtro: Filtro): GrupoData[] {
  // Agrupa por data → colaborador
  const porData = new Map<string, Map<number, ColaboradorAgrupado>>();

  for (const c of cautelas) {
    if (!porData.has(c.data)) porData.set(c.data, new Map());
    const porColab = porData.get(c.data)!;

    if (!porColab.has(c.colaboradorId)) {
      porColab.set(c.colaboradorId, {
        colaboradorId: c.colaboradorId,
        colaborador: c.colaborador,
        abertas: 0,
        entregues: 0,
        total: 0,
      });
    }

    const item = porColab.get(c.colaboradorId)!;
    item.total += 1;
    if (c.entregue) item.entregues += 1;
    else item.abertas += 1;
  }

  const grupos: GrupoData[] = [];

  for (const [data, porColab] of porData) {
    let colaboradores = Array.from(porColab.values());

    // Filtrar colaboradores conforme o chip
    if (filtro === 'abertas') colaboradores = colaboradores.filter(c => c.abertas > 0);
    if (filtro === 'entregues') colaboradores = colaboradores.filter(c => c.entregues > 0);

    if (colaboradores.length === 0) continue;

    grupos.push({ data, timestamp: parseDataBR(data), colaboradores });
  }

  // Datas mais recentes primeiro
  return grupos.sort((a, b) => b.timestamp - a.timestamp);
}

// ─── Card do colaborador ─────────────────────────────────────────────────────

function ColaboradorCautelaCard({
  item,
  filtro,
  onPress,
}: {
  item: ColaboradorAgrupado;
  filtro: Filtro;
  onPress: () => void;
}) {
  const initials = getInitials(item.colaborador.nome);
  const mostrarAberta = filtro !== 'entregues' && item.abertas > 0;
  const mostrarEntregue = filtro !== 'abertas' && item.entregues > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Info do colaborador */}
      <View style={styles.cardInfo}>
        <Text style={styles.colabNome} numberOfLines={1}>
          {item.colaborador.nome}
        </Text>
        <Text style={styles.colabSub} numberOfLines={1}>
          {item.colaborador.funcao} · {item.colaborador.empresa}
        </Text>

        {/* Badges de status */}
        <View style={styles.badgesRow}>
          {mostrarAberta && (
            <View style={styles.badgeAberta}>
              <Clock size={11} color="#f97316" />
              <Text style={styles.badgeAbertaText}>{item.abertas}</Text>
            </View>
          )}
          {mostrarEntregue && (
            <View style={styles.badgeEntregue}>
              <CheckCircle2 size={11} color="#22c55e" />
              <Text style={styles.badgeEntregueText}>{item.entregues}</Text>
            </View>
          )}
          <View style={styles.badgeTotal}>
            <Text style={styles.badgeTotalText}>
              {item.total} {item.total === 1 ? 'cautela' : 'cautelas'}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function HistoricoCautelasScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [cautelas, setCautelas] = useState<CautelaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todas');

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  async function carregar(isReload = false) {
    const startedAt = Date.now();
    try {
      if (isReload) setRecarregando(true);
      else setCarregando(true);
      const dados = await buscarCautelas();
      setCautelas(dados);
    } catch (error) {
      showErrorToast(
        parseApiError(error, 'Não foi possível carregar o histórico.'),
        'Erro',
      );
    } finally {
      if (!isReload) {
        const wait = Math.max(0, 600 - (Date.now() - startedAt));
        if (wait > 0) await new Promise(res => setTimeout(res, wait));
        setCarregando(false);
      } else {
        setCarregando(false);
      }
      setRecarregando(false);
    }
  }

  const grupos = useMemo(() => agrupar(cautelas, filtro), [cautelas, filtro]);

  const totalAbertas = cautelas.filter(c => !c.entregue).length;
  const totalEntregues = cautelas.filter(c => c.entregue).length;

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (cautelas.length === 0) {
    return (
      <Screen>
        <View style={styles.empty}>
          <ClipboardList size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma cautela registrada</Text>
          <Text style={styles.emptySubtitle}>
            As cautelas criadas aparecerão aqui com o histórico completo.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiNum}>{cautelas.length}</Text>
          <Text style={styles.kpiLabel}>Total</Text>
        </View>
        <View style={[styles.kpi, styles.kpiAberta]}>
          <Text style={[styles.kpiNum, { color: '#f97316' }]}>{totalAbertas}</Text>
          <Text style={styles.kpiLabel}>Abertas</Text>
        </View>
        <View style={[styles.kpi, styles.kpiEntregue]}>
          <Text style={[styles.kpiNum, { color: '#22c55e' }]}>{totalEntregues}</Text>
          <Text style={styles.kpiLabel}>Entregues</Text>
        </View>
      </View>

      {/* Chips de filtro */}
      <View style={styles.chipRow}>
        {(['todas', 'abertas', 'entregues'] as Filtro[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filtro === f && styles.chipAtivo]}
            onPress={() => setFiltro(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, filtro === f && styles.chipTextAtivo]}>
              {f === 'todas' ? 'Todas' : f === 'abertas' ? 'Abertas' : 'Entregues'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista agrupada por data */}
      <FlatList
        data={grupos}
        keyExtractor={g => g.data}
        renderItem={({ item: grupo }) => (
          <View>
            {/* Cabeçalho da data */}
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{grupo.data}</Text>
              <View style={styles.dateLine} />
              <View style={styles.dateCountBadge}>
                <Text style={styles.dateCountText}>
                  {grupo.colaboradores.reduce((acc, c) => acc + c.total, 0)}
                </Text>
              </View>
            </View>

            {/* Cards dos colaboradores */}
            {grupo.colaboradores.map(c => (
              <ColaboradorCautelaCard
                key={c.colaboradorId}
                item={c}
                filtro={filtro}
                onPress={() =>
                  navigation.navigate('DetalhesColaborador', {
                    colaborador: {
                      id: c.colaboradorId,
                      nome: c.colaborador.nome,
                      funcao: c.colaborador.funcao,
                      empresa: c.colaborador.empresa,
                    },
                  })
                }
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={() => carregar(true)}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyFilter}>
            <Text style={styles.emptyFilterText}>
              Nenhuma cautela{' '}
              {filtro === 'abertas' ? 'aberta' : 'entregue'} encontrada.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // KPIs
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  kpi: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  kpiAberta: { borderColor: '#fdba74' },
  kpiEntregue: { borderColor: '#86efac' },
  kpiNum: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  chipAtivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  chipTextAtivo: {
    color: '#fff',
  },

  // Lista
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dateCountBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dateCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },

  // Card do colaborador
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  colabNome: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  colabSub: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badgeAberta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeAbertaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  badgeEntregue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeEntregueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
  },
  badgeTotal: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTotalText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyFilter: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFilterText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
