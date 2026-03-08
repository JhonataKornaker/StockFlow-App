import CardCautelas from '@/components/CardCautelas';
import CardMovimentacao from '@/components/CardMovimentacao';
import { SkeletonInicioDashboard } from '@/components/Skeleton/SkeletonInicioDashboard';
import { CautelaDTO } from '@/dtos/cautelaDto';
import { EstoqueDto, ResumoNumerico } from '@/dtos/estoqueDto';
import { ResumoMovimentacaoEstoque } from '@/dtos/movimentacaoDto';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { buscarCautelas, finalizarCautelas } from '@/service/cautela.service';
import {
  buscarResumoNumerico,
  listarEstoques,
} from '@/service/controleEstoque.service';
import { buscarResumoMovimentacao } from '@/service/movimentacao.service';
import { listarLocacoes } from '@/service/patrimonio.service';
import { buscarUsuarioLogado } from '@/service/usuario.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  CopyPlus,
  Hammer,
  Menu,
  Package,
  PackageOpen,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type NavigationProps = NativeStackNavigationProp<MainStackParamList>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getPrimeiroNome(nome: string) {
  return nome.split(' ')[0] || nome;
}

function getDataFormatada() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
}

function diasParaDevolucao(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// ─── Sub-componentes locais ──────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
  Icon,
}: {
  label: string;
  value: number;
  color: string;
  Icon: any;
}) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: color }]}>
      <View style={[styles.kpiIconWrapper, { backgroundColor: color + '18' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function AtalhoBtn({
  Icon,
  label,
  onPress,
}: {
  Icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.atalhoBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.atalhoIconWrapper}>
        <Icon size={22} color={theme.colors.primary} />
      </View>
      <Text style={styles.atalhoLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export default function InicioScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [listaDeCautelas, setListaDeCautelas] = useState<CautelaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumo, setResumo] = useState<ResumoNumerico | null>(null);
  const [movimentacao, setMovimentacao] = useState<ResumoMovimentacaoEstoque | null>(null);
  const [estoqueBaixo, setEstoqueBaixo] = useState<EstoqueDto[]>([]);
  const [locacoesUrgentes, setLocacoesUrgentes] = useState<PatrimonioDto[]>([]);
  const [patrimoniosAlugados, setPatrimoniosAlugados] = useState<PatrimonioDto[]>([]);
  const [nomeUsuario, setNomeUsuario] = useState('');

  async function carregarDados() {
    const startedAt = Date.now();
    try {
      const [cautelas, movRes, resumoRes, estoques, locacoes, usuario] =
        await Promise.allSettled([
          buscarCautelas(),
          buscarResumoMovimentacao(),
          buscarResumoNumerico(),
          listarEstoques(),
          listarLocacoes(),
          buscarUsuarioLogado(),
        ]);

      if (cautelas.status === 'fulfilled') {
        setListaDeCautelas(cautelas.value.filter(c => !c.entregue));
      }
      if (movRes.status === 'fulfilled') setMovimentacao(movRes.value);
      if (resumoRes.status === 'fulfilled') setResumo(resumoRes.value);
      if (estoques.status === 'fulfilled') {
        setEstoqueBaixo(estoques.value.filter(e => e.estoqueBaixo));
      }
      if (locacoes.status === 'fulfilled') {
        const todas = locacoes.value;
        setPatrimoniosAlugados(todas.slice(0, 3));
        setLocacoesUrgentes(
          todas.filter(p => {
            if (!p.dataDevolucao) return false;
            const dias = diasParaDevolucao(p.dataDevolucao);
            return dias <= 3;
          }),
        );
      }
      if (usuario.status === 'fulfilled') {
        setNomeUsuario(getPrimeiroNome(usuario.value.nome));
      }
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise(res => setTimeout(res, wait));
    }
  }

  async function carregarTudo() {
    setCarregando(true);
    await carregarDados();
    setCarregando(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { carregarTudo(); }, []));

  async function finalizarCautelaHandler(id: number) {
    try {
      await finalizarCautelas(id);
      const dados = await buscarCautelas();
      setListaDeCautelas(dados.filter(c => !c.entregue));
    } catch (error) {
      console.error('Erro ao finalizar cautela:', error);
    }
  }

  const temAlertas = estoqueBaixo.length > 0 || locacoesUrgentes.length > 0;

  // ─── Header ───────────────────────────────────────────────────────────────

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Menu color="#B0C4DC" size={24} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerSaudacao}>
          {getSaudacao()}{nomeUsuario ? `, ${nomeUsuario}` : ''}
        </Text>
        <Text style={styles.headerData}>{getDataFormatada()}</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Cautela')}>
        <CopyPlus size={24} color="#B0C4DC" />
      </TouchableOpacity>
    </View>
  );

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <View style={styles.container}>
        {header}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonInicioDashboard />
        </ScrollView>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {header}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#B0C4DC"
            colors={['#B0C4DC']}
          />
        }
      >
        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiCard
            label="Entradas"
            value={resumo?.totalEntradas ?? 0}
            color="#22c55e"
            Icon={TrendingUp}
          />
          <KpiCard
            label="Saídas"
            value={resumo?.totalSaidas ?? 0}
            color="#ef4444"
            Icon={TrendingDown}
          />
          <KpiCard
            label="Cautelas"
            value={resumo?.cautelasAbertas ?? 0}
            color="#f59e0b"
            Icon={ClipboardList}
          />
        </View>

        {/* Alertas */}
        {temAlertas && (
          <SectionCard title="Alertas">
            {estoqueBaixo.map(e => (
              <TouchableOpacity
                key={e.id}
                style={styles.alertaItem}
                onPress={() => navigation.navigate('Estoques')}
                activeOpacity={0.8}
              >
                <AlertTriangle size={15} color="#ef4444" />
                <Text style={styles.alertaTexto} numberOfLines={1}>
                  <Text style={{ fontWeight: '700' }}>{e.insumo.descricao}</Text>
                  {` — ${e.quantidadeAtual} / mín. ${e.quantidadeMinima}`}
                </Text>
              </TouchableOpacity>
            ))}

            {locacoesUrgentes.map(p => {
              const dias = diasParaDevolucao(p.dataDevolucao!);
              const cor = dias < 0 ? '#ef4444' : '#f97316';
              const label =
                dias < 0
                  ? `Vencido há ${Math.abs(dias)}d`
                  : dias === 0
                  ? 'Vence hoje!'
                  : `Vence em ${dias}d`;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.alertaItem}
                  onPress={() => navigation.navigate('Locacoes')}
                  activeOpacity={0.8}
                >
                  <CalendarClock size={15} color={cor} />
                  <Text style={styles.alertaTexto} numberOfLines={1}>
                    <Text style={{ fontWeight: '700', color: cor }}>{p.descricao}</Text>
                    {` — ${label}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </SectionCard>
        )}

        {/* Atalhos rápidos */}
        <SectionCard title="Acesso Rápido">
          <View style={styles.atalhoGrid}>
            <AtalhoBtn Icon={Hammer} label="Ferramentas" onPress={() => navigation.navigate('Ferramentas')} />
            <AtalhoBtn Icon={User} label="Colaboradores" onPress={() => navigation.navigate('Colaboradores')} />
            <AtalhoBtn Icon={Shield} label="Patrimônios" onPress={() => navigation.navigate('Patrimonios')} />
            <AtalhoBtn Icon={Package} label="Estoque" onPress={() => navigation.navigate('Estoques')} />
            <AtalhoBtn Icon={CalendarClock} label="Locações" onPress={() => navigation.navigate('Locacoes')} />
            <AtalhoBtn Icon={PackageOpen} label="Saída" onPress={() => navigation.navigate('SaidaInsumo')} />
          </View>
        </SectionCard>

        {/* Cautelas abertas */}
        <SectionCard title="Cautelas Abertas">
          {listaDeCautelas.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardList size={36} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhuma cautela aberta</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Cautela')}
              >
                <Text style={styles.emptyBtnText}>Criar Cautela</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {listaDeCautelas.slice(0, 2).map(item => (
                <View key={item.id} style={{ marginBottom: 10 }}>
                  <CardCautelas cautelas={item} onFinalizar={finalizarCautelaHandler} />
                </View>
              ))}
              {listaDeCautelas.length > 2 && (
                <TouchableOpacity
                  style={styles.verMaisBtn}
                  onPress={() =>
                    navigation.navigate('CautelasAbertas', {
                      quantidadeCautelas: listaDeCautelas.length,
                    })
                  }
                >
                  <Text style={styles.verMaisText}>
                    Ver todas ({listaDeCautelas.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </SectionCard>

        {/* Locações resumo */}
        {patrimoniosAlugados.length > 0 && (
          <SectionCard title="Equipamentos Alugados">
            {patrimoniosAlugados.map(p => {
              const dias = p.dataDevolucao ? diasParaDevolucao(p.dataDevolucao) : null;
              const cor =
                dias === null ? '#9ca3af' : dias < 0 ? '#ef4444' : dias <= 3 ? '#f97316' : '#22c55e';
              return (
                <View key={p.id} style={styles.locacaoRow}>
                  <Text style={styles.locacaoNome} numberOfLines={1}>{p.descricao}</Text>
                  {dias !== null && (
                    <Text style={[styles.locacaoDias, { color: cor }]}>
                      {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoje!' : `${dias}d`}
                    </Text>
                  )}
                </View>
              );
            })}
            <TouchableOpacity
              style={styles.verMaisBtn}
              onPress={() => navigation.navigate('Locacoes')}
            >
              <Text style={styles.verMaisText}>Ver todas as locações</Text>
            </TouchableOpacity>
          </SectionCard>
        )}

        {/* Movimentação */}
        <SectionCard title="Última Movimentação">
          {!movimentacao || (!movimentacao.ultimaEntrada && !movimentacao.ultimaSaida) ? (
            <View style={styles.emptyState}>
              <Package size={36} color="#9ca3af" />
              <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
            </View>
          ) : (
            <>
              <CardMovimentacao movimentacao={movimentacao} />
              {((resumo?.totalEntradas ?? 0) > 1 || (resumo?.totalSaidas ?? 0) > 1) && (
                <TouchableOpacity
                  style={styles.verMaisBtn}
                  onPress={() =>
                    navigation.navigate('MovimentacaoInsumo', {
                      totalEntradas: resumo?.totalEntradas ?? 0,
                      totalSaidas: resumo?.totalSaidas ?? 0,
                    })
                  }
                >
                  <Text style={styles.verMaisText}>Ver histórico completo</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </SectionCard>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#162B4D',
  },
  header: {
    backgroundColor: '#19325E',
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSaudacao: {
    color: '#B0C4DC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerData: {
    color: '#B0C4DC',
    fontSize: 11,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: '#B0C4DC',
  },

  // KPI
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Alertas
  alertaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  alertaTexto: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },

  // Atalhos
  atalhoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  atalhoBtn: {
    width: '30%',
    alignItems: 'center',
    gap: 6,
  },
  atalhoIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhoLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Locações row
  locacaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  locacaoNome: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  locacaoDias: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Ver mais
  verMaisBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  verMaisText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  emptyBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
