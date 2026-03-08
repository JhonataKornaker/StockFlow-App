import { Screen } from '@/components/ScreenProps';
import { MovimentacaoFiltradaDto, TipoMovimentacao } from '@/dtos/movimentacaoDto';
import { buscarMovimentacoesRelatorio } from '@/service/movimentacao.service';
import { showErrorToast } from '@/util/toast';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  RefreshCcw,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Periodo = '7d' | '30d' | 'mes' | 'personalizado';
type FiltroTipo = TipoMovimentacao | 'TODOS';

const TIPO_CONFIG: Record<
  TipoMovimentacao,
  { label: string; color: string; bg: string }
> = {
  ENTRADA:      { label: 'Entrada',      color: '#16a34a', bg: '#dcfce7' },
  SAIDA:        { label: 'Saída',        color: '#dc2626', bg: '#fee2e2' },
  AJUSTE:       { label: 'Ajuste',       color: '#f97316', bg: '#ffedd5' },
  DEVOLUCAO:    { label: 'Devolução',    color: '#2563eb', bg: '#dbeafe' },
  TRANSFERENCIA:{ label: 'Transferência',color: '#7c3aed', bg: '#ede9fe' },
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseDateBR(str: string): Date | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

function inicioDia(d: Date): string {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.toISOString();
}

function fimDia(d: Date): string {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c.toISOString();
}

function calcularPeriodo(periodo: Periodo, dataInicioCustom: string, dataFimCustom: string) {
  const hoje = new Date();
  if (periodo === '7d') {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 6);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  if (periodo === '30d') {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 29);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  if (periodo === 'mes') {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  // personalizado
  const dInicio = parseDateBR(dataInicioCustom);
  const dFim = parseDateBR(dataFimCustom);
  return {
    dataInicio: dInicio ? inicioDia(dInicio) : undefined,
    dataFim: dFim ? fimDia(dFim) : undefined,
  };
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

function gerarHTML(
  movimentacoes: MovimentacaoFiltradaDto[],
  periodoLabel: string,
  totais: { entradas: number; saidas: number },
): string {
  const linhas = movimentacoes
    .map(m => {
      const cfg = TIPO_CONFIG[m.tipo];
      const responsavel = m.colaborador?.nome ?? m.fornecedor ?? m.usuario.nome;
      return `
        <tr>
          <td><span style="background:${cfg.bg};color:${cfg.color};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">${cfg.label}</span></td>
          <td>${m.estoque.insumo.descricao}</td>
          <td style="text-align:center">${m.quantidade} ${m.estoque.insumo.unidade}</td>
          <td style="text-align:center">${m.quantidadeAntes} → ${m.quantidadeDepois}</td>
          <td>${responsavel}</td>
          <td>${formatarData(m.criadoEm)}</td>
        </tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
      h1 { color: #19325E; font-size: 20px; margin-bottom: 4px; }
      .sub { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
      .resumo { display: flex; gap: 16px; margin-bottom: 20px; }
      .resumo-item { background: #f9fafb; border-radius: 8px; padding: 10px 16px; flex: 1; }
      .resumo-label { font-size: 11px; color: #6b7280; }
      .resumo-valor { font-size: 20px; font-weight: 700; color: #19325E; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #19325E; color: #fff; padding: 8px 10px; text-align: left; }
      td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style></head><body>
    <h1>Relatório de Movimentação de Insumos</h1>
    <p class="sub">Período: ${periodoLabel} &nbsp;|&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <div class="resumo">
      <div class="resumo-item"><div class="resumo-label">Total</div><div class="resumo-valor">${movimentacoes.length}</div></div>
      <div class="resumo-item"><div class="resumo-label">Entradas</div><div class="resumo-valor" style="color:#16a34a">${totais.entradas}</div></div>
      <div class="resumo-item"><div class="resumo-label">Saídas</div><div class="resumo-valor" style="color:#dc2626">${totais.saidas}</div></div>
    </div>
    <table>
      <thead><tr>
        <th>Tipo</th><th>Insumo</th><th>Quantidade</th><th>Saldo</th><th>Responsável</th><th>Data</th>
      </tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    </body></html>`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: '7d',          label: 'Últimos 7 dias' },
  { key: '30d',         label: 'Últimos 30 dias' },
  { key: 'mes',         label: 'Este mês' },
  { key: 'personalizado', label: 'Personalizado' },
];

const TIPOS: { key: FiltroTipo; label: string }[] = [
  { key: 'TODOS',        label: 'Todos' },
  { key: 'ENTRADA',      label: 'Entrada' },
  { key: 'SAIDA',        label: 'Saída' },
  { key: 'AJUSTE',       label: 'Ajuste' },
  { key: 'DEVOLUCAO',    label: 'Devolução' },
];

export default function RelatorioInsumosScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('30d');
  const [tipo, setTipo] = useState<FiltroTipo>('TODOS');
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFiltradaDto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const totais = {
    entradas: movimentacoes.filter(m => m.tipo === 'ENTRADA').length,
    saidas:   movimentacoes.filter(m => m.tipo === 'SAIDA').length,
  };

  async function handleFiltrar() {
    const { dataInicio, dataFim } = calcularPeriodo(periodo, dataInicioCustom, dataFimCustom);

    if (periodo === 'personalizado') {
      if (!parseDateBR(dataInicioCustom) || !parseDateBR(dataFimCustom)) {
        showErrorToast('Informe as datas no formato DD/MM/AAAA', 'Data inválida');
        return;
      }
    }

    setCarregando(true);
    try {
      const dados = await buscarMovimentacoesRelatorio({ dataInicio, dataFim, tipo });
      setMovimentacoes(dados);
      setBuscado(true);
    } catch {
      showErrorToast('Erro ao buscar movimentações', 'Erro');
    } finally {
      setCarregando(false);
    }
  }

  async function handleGerarPDF() {
    if (movimentacoes.length === 0) return;
    setExportando(true);
    try {
      const periodoLabel =
        periodo === 'personalizado'
          ? `${dataInicioCustom} a ${dataFimCustom}`
          : PERIODOS.find(p => p.key === periodo)?.label ?? '';
      const html = gerarHTML(movimentacoes, periodoLabel, totais);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      showErrorToast('Erro ao gerar PDF', 'Erro');
    } finally {
      setExportando(false);
    }
  }

  function renderItem({ item }: { item: MovimentacaoFiltradaDto }) {
    const cfg = TIPO_CONFIG[item.tipo];
    const responsavel = item.colaborador?.nome ?? item.fornecedor ?? item.usuario.nome;
    return (
      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <View style={[styles.tipoBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.tipoText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.itemData}>{formatarDataHora(item.criadoEm)}</Text>
        </View>
        <Text style={styles.itemInsumo}>{item.estoque.insumo.descricao}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemQtd}>
            {item.tipo === 'SAIDA' || item.tipo === 'TRANSFERENCIA' ? '−' : '+'}
            {item.quantidade} {item.estoque.insumo.unidade}
          </Text>
          <Text style={styles.itemSaldo}>
            {item.quantidadeAntes} → {item.quantidadeDepois}
          </Text>
          {responsavel ? (
            <Text style={styles.itemResponsavel} numberOfLines={1}>{responsavel}</Text>
          ) : null}
        </View>
        {item.observacao ? (
          <Text style={styles.itemObs} numberOfLines={1}>obs: {item.observacao}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Filtros */}
        <View style={styles.filtrosCard}>
          {/* Período */}
          <Text style={styles.filtroLabel}>Período</Text>
          <View style={styles.chips}>
            {PERIODOS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[styles.chip, periodo === p.key && styles.chipAtivo]}
                onPress={() => setPeriodo(p.key)}
              >
                <Text style={[styles.chipText, periodo === p.key && styles.chipTextAtivo]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {periodo === 'personalizado' && (
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataInicioCustom}
                onChangeText={setDataInicioCustom}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.dateSep}>até</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={dataFimCustom}
                onChangeText={setDataFimCustom}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          )}

          {/* Tipo */}
          <Text style={[styles.filtroLabel, { marginTop: 12 }]}>Tipo</Text>
          <View style={styles.chips}>
            {TIPOS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.chip, tipo === t.key && styles.chipAtivo]}
                onPress={() => setTipo(t.key)}
              >
                <Text style={[styles.chipText, tipo === t.key && styles.chipTextAtivo]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.filtrarBtn}
            onPress={handleFiltrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <RefreshCcw size={16} color="#fff" />
                <Text style={styles.filtrarBtnText}>Filtrar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Resumo */}
        {buscado && (
          <View style={styles.resumoRow}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoValor}>{movimentacoes.length}</Text>
              <Text style={styles.resumoLabel}>Total</Text>
            </View>
            <View style={[styles.resumoItem, styles.resumoItemBorder]}>
              <ArrowUpCircle size={16} color="#16a34a" />
              <Text style={[styles.resumoValor, { color: '#16a34a' }]}>{totais.entradas}</Text>
              <Text style={styles.resumoLabel}>Entradas</Text>
            </View>
            <View style={[styles.resumoItem, styles.resumoItemBorder]}>
              <ArrowDownCircle size={16} color="#dc2626" />
              <Text style={[styles.resumoValor, { color: '#dc2626' }]}>{totais.saidas}</Text>
              <Text style={styles.resumoLabel}>Saídas</Text>
            </View>
          </View>
        )}

        {/* Lista */}
        <FlatList
          data={movimentacoes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            buscado ? (
              <View style={styles.empty}>
                <FileText size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Nenhuma movimentação encontrada</Text>
              </View>
            ) : null
          }
        />

        {/* Botão PDF */}
        {movimentacoes.length > 0 && (
          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={handleGerarPDF}
            disabled={exportando}
          >
            {exportando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FileText size={18} color="#fff" />
                <Text style={styles.pdfBtnText}>Exportar PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  filtrosCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filtroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  chipAtivo: {
    backgroundColor: '#19325E',
    borderColor: '#19325E',
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextAtivo: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  dateSep: {
    color: '#6b7280',
    fontSize: 13,
  },
  filtrarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#19325E',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 14,
  },
  filtrarBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  resumoRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 2,
  },
  resumoItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#f3f4f6',
  },
  resumoValor: {
    fontSize: 22,
    fontWeight: '700',
    color: '#19325E',
  },
  resumoLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  lista: {
    gap: 8,
    paddingBottom: 80,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#19325E',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemData: {
    fontSize: 11,
    color: '#9ca3af',
  },
  itemInsumo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#19325E',
    marginBottom: 6,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  itemQtd: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  itemSaldo: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  itemResponsavel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
  },
  itemObs: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#162B4D',
    borderRadius: 10,
    paddingVertical: 13,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pdfBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
