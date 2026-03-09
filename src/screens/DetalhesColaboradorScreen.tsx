import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { HistoricoCautelaColaborador } from '@/dtos/historicoDto';
import { MovimentacaoListaDto } from '@/dtos/movimentacaoDto';
import { buscarHistoricoCautelaColaborador } from '@/service/historico.service';
import { listarTodasMovimentacoes } from '@/service/movimentacao.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  Briefcase,
  Building2,
  ClipboardList,
  Package,
  UserCircle2,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type DetalhesColaboradorProps = RouteProp<MainStackParamList, 'DetalhesColaborador'>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(nome: string) {
  const parts = nome.trim().split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

function tryParseDate(str: string): Date | null {
  const isoMillis = Date.parse(str);
  if (!Number.isNaN(isoMillis)) return new Date(isoMillis);

  const brMatch = str.match(
    /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (brMatch) {
    const [, dd, mm, yyyy, hh, min, ss] = brMatch;
    const date = new Date(
      Number(yyyy), Number(mm) - 1, Number(dd),
      hh ? Number(hh) : 0, min ? Number(min) : 0, ss ? Number(ss) : 0,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function fmt(str?: string) {
  if (!str) return '—';
  const parsed = tryParseDate(str);
  return parsed ? parsed.toLocaleDateString('pt-BR') : '—';
}

function getDataRetirada(item: HistoricoCautelaColaborador): string {
  return fmt(
    (item as any).dataRetirada ||
    (item as any).dataSaida ||
    (item as any).dataInicio ||
    item.data,
  );
}

function getDataEntrega(item: HistoricoCautelaColaborador): string {
  return fmt(
    (item as any).dataEntrega ||
    (item as any).dataDevolucao ||
    (item as any).dataFim,
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function Badge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SectionHeader({ icon: Icon, label, count }: { icon: any; label: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={16} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.sectionCount}>
        <Text style={styles.sectionCountText}>{count}</Text>
      </View>
    </View>
  );
}

function CautelaAbertaCard({ item }: { item: HistoricoCautelaColaborador }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDescricao} numberOfLines={2}>{item.descricao}</Text>
        <Badge label="ABERTA" color="#b45309" bg="#fef3c7" />
      </View>
      <View style={styles.cardDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Retirada</Text>
          <Text style={styles.dateValue}>{getDataRetirada(item)}</Text>
        </View>
        {(item.numeroSerie || item.quantidade) && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>
              {item.numeroSerie ? 'Nº Série' : 'Qtd'}
            </Text>
            <Text style={styles.dateValue}>
              {item.numeroSerie ?? item.quantidade}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CautelaHistoricoCard({ item }: { item: HistoricoCautelaColaborador }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDescricao} numberOfLines={2}>{item.descricao}</Text>
        <Badge label="ENTREGUE" color="#166534" bg="#dcfce7" />
      </View>
      <View style={styles.cardDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Retirada</Text>
          <Text style={styles.dateValue}>{getDataRetirada(item)}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Devolvida</Text>
          <Text style={styles.dateValue}>{getDataEntrega(item)}</Text>
        </View>
      </View>
    </View>
  );
}

function InsumoCard({ mov }: { mov: MovimentacaoListaDto }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDescricao} numberOfLines={2}>{mov.insumo}</Text>
        <Badge label="SAÍDA" color="#6d28d9" bg="#ede9fe" />
      </View>
      <View style={styles.cardDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Data</Text>
          <Text style={styles.dateValue}>{fmt(mov.data)}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Quantidade</Text>
          <Text style={styles.dateValue}>{mov.quantidade} {mov.unidade}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Tela ───────────────────────────────────────────────────────────────────

export default function DetalhesColaborador() {
  const route = useRoute<DetalhesColaboradorProps>();
  const { colaborador } = route.params;

  const [historico, setHistorico] = useState<HistoricoCautelaColaborador[]>([]);
  const [historicoInsumos, setHistoricoInsumos] = useState<MovimentacaoListaDto[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const [dados, movs] = await Promise.all([
        buscarHistoricoCautelaColaborador(colaborador.id),
        listarTodasMovimentacoes(),
      ]);
      setHistorico(dados);
      setHistoricoInsumos(
        movs.filter(m => m.tipo === 'SAIDA' && m.colaborador === colaborador.nome),
      );
    } catch (error) {
      console.error('Erro ao buscar dados do colaborador:', error);
    } finally {
      setCarregando(false);
    }
  }, [colaborador.id, colaborador.nome]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  const abertas = historico.filter(h => !h.cautelaFechada);
  const fechadas = historico.filter(h => h.cautelaFechada);
  const initials = getInitials(colaborador.nome);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ─── Header ─── */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerNome}>{colaborador.nome}</Text>
            <View style={styles.headerMeta}>
              <Briefcase size={13} color="#B0C4DC" />
              <Text style={styles.headerMetaText}>{colaborador.funcao}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Building2 size={13} color="#B0C4DC" />
              <Text style={styles.headerMetaText}>{colaborador.empresa}</Text>
            </View>
          </View>

          {/* Badges de resumo */}
          <View style={styles.resumoBadges}>
            {abertas.length > 0 && (
              <View style={[styles.resumoBadge, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.resumoBadgeNum, { color: '#b45309' }]}>{abertas.length}</Text>
                <Text style={[styles.resumoBadgeLabel, { color: '#b45309' }]}>abertas</Text>
              </View>
            )}
            {fechadas.length > 0 && (
              <View style={[styles.resumoBadge, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.resumoBadgeNum, { color: '#166534' }]}>{fechadas.length}</Text>
                <Text style={[styles.resumoBadgeLabel, { color: '#166534' }]}>entregues</Text>
              </View>
            )}
            {historicoInsumos.length > 0 && (
              <View style={[styles.resumoBadge, { backgroundColor: '#ede9fe' }]}>
                <Text style={[styles.resumoBadgeNum, { color: '#6d28d9' }]}>{historicoInsumos.length}</Text>
                <Text style={[styles.resumoBadgeLabel, { color: '#6d28d9' }]}>insumos</Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── Empty state ─── */}
        {historico.length === 0 && historicoInsumos.length === 0 && (
          <View style={styles.emptyContainer}>
            <UserCircle2 size={56} color="#9ca3af" strokeWidth={1.2} />
            <Text style={styles.emptyTitle}>Nenhum histórico encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Esse colaborador ainda não realizou nenhuma retirada de ferramenta, patrimônio ou insumo.
            </Text>
          </View>
        )}

        {/* ─── Cautelas Abertas ─── */}
        {abertas.length > 0 && (
          <View>
            <SectionHeader icon={ClipboardList} label="Cautelas Abertas" count={abertas.length} />
            {abertas.map((item, i) => (
              <CautelaAbertaCard key={i} item={item} />
            ))}
          </View>
        )}

        {/* ─── Histórico de Cautelas ─── */}
        {fechadas.length > 0 && (
          <View>
            <SectionHeader icon={ClipboardList} label="Histórico de Cautelas" count={fechadas.length} />
            {fechadas.map((item, i) => (
              <CautelaHistoricoCard key={i} item={item} />
            ))}
          </View>
        )}

        {/* ─── Insumos ─── */}
        {historicoInsumos.length > 0 && (
          <View>
            <SectionHeader icon={Package} label="Insumos Retirados" count={historicoInsumos.length} />
            {historicoInsumos.map((mov, i) => (
              <InsumoCard key={mov.id ?? i} mov={mov} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    padding: 14,
    paddingBottom: 32,
    gap: 12,
  },

  // Header card
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#27406E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B0C4DC',
  },
  avatarText: {
    color: '#B0C4DC',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    alignItems: 'center',
    gap: 4,
  },
  headerNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerMetaText: {
    fontSize: 13,
    color: '#B0C4DC',
  },

  // Resumo badges
  resumoBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  resumoBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 64,
  },
  resumoBadgeNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  resumoBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sectionCount: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardDescricao: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardDates: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    gap: 2,
  },
  dateLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Badge
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
