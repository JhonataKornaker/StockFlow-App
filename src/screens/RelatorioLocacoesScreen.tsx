import { Screen } from '@/components/ScreenProps';
import { HistoricoLocacaoDto } from '@/dtos/patrimonioDto';
import { buscarHistoricoLocacoes } from '@/service/patrimonio.service';
import { showErrorToast } from '@/util/toast';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Building2, CalendarCheck, Clock, FileText, RefreshCcw } from 'lucide-react-native';
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

type Periodo = '30d' | '90d' | 'ano' | 'personalizado';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
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

function calcularPeriodo(periodo: Periodo, inicioCustom: string, fimCustom: string) {
  const hoje = new Date();
  if (periodo === '30d') {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 29);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  if (periodo === '90d') {
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 89);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  if (periodo === 'ano') {
    const inicio = new Date(hoje.getFullYear(), 0, 1);
    return { dataInicio: inicioDia(inicio), dataFim: fimDia(hoje) };
  }
  const dInicio = parseDateBR(inicioCustom);
  const dFim = parseDateBR(fimCustom);
  return {
    dataInicio: dInicio ? inicioDia(dInicio) : undefined,
    dataFim: dFim ? fimDia(dFim) : undefined,
  };
}

function diasAtraso(prevista?: string, efetiva?: string): number | null {
  if (!prevista || !efetiva) return null;
  const diff = Math.floor(
    (new Date(efetiva).getTime() - new Date(prevista).getTime()) / 86400000,
  );
  return diff;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

function gerarHTML(historico: HistoricoLocacaoDto[], periodoLabel: string): string {
  const linhas = historico
    .map(h => {
      const atraso = diasAtraso(h.dataDevolucaoPrevista, h.dataEfetivaDevolvido);
      const atrasoCell =
        atraso === null
          ? '—'
          : atraso > 0
          ? `<span style="color:#dc2626">${atraso}d atraso</span>`
          : atraso < 0
          ? `<span style="color:#16a34a">${Math.abs(atraso)}d antecipado</span>`
          : '<span style="color:#16a34a">No prazo</span>';

      return `
        <tr>
          <td>${h.patrimonio.descricao}</td>
          <td>${h.patrimonio.numeroSerie}</td>
          <td>${h.nomeLocadora}</td>
          <td>${formatarData(h.dataLocacao)}</td>
          <td>${h.dataDevolucaoPrevista ? formatarData(h.dataDevolucaoPrevista) : '—'}</td>
          <td>${formatarData(h.dataEfetivaDevolvido)}</td>
          <td>${atrasoCell}</td>
          <td>${h.observacao || '—'}</td>
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
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #19325E; color: #fff; padding: 7px 8px; text-align: left; }
      td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style></head><body>
    <h1>Relatório de Locações de Equipamentos</h1>
    <p class="sub">Período: ${periodoLabel} &nbsp;|&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')}</p>
    <div class="resumo">
      <div class="resumo-item"><div class="resumo-label">Total devolvidos</div><div class="resumo-valor">${historico.length}</div></div>
    </div>
    <table>
      <thead><tr>
        <th>Equipamento</th><th>N° Série</th><th>Locadora</th>
        <th>Chegou em</th><th>Prazo</th><th>Devolvido em</th><th>Atraso</th><th>Obs.</th>
      </tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    </body></html>`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: '30d',         label: 'Últimos 30 dias' },
  { key: '90d',         label: 'Últimos 90 dias' },
  { key: 'ano',         label: 'Este ano' },
  { key: 'personalizado', label: 'Personalizado' },
];

export default function RelatorioLocacoesScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('90d');
  const [inicioCustom, setInicioCustom] = useState('');
  const [fimCustom, setFimCustom] = useState('');

  const [historico, setHistorico] = useState<HistoricoLocacaoDto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  async function handleFiltrar() {
    if (periodo === 'personalizado') {
      if (!parseDateBR(inicioCustom) || !parseDateBR(fimCustom)) {
        showErrorToast('Informe as datas no formato DD/MM/AAAA', 'Data inválida');
        return;
      }
    }
    const { dataInicio, dataFim } = calcularPeriodo(periodo, inicioCustom, fimCustom);
    setCarregando(true);
    try {
      const dados = await buscarHistoricoLocacoes({ dataInicio, dataFim });
      setHistorico(dados);
      setBuscado(true);
    } catch {
      showErrorToast('Erro ao buscar histórico de locações', 'Erro');
    } finally {
      setCarregando(false);
    }
  }

  async function handleGerarPDF() {
    if (historico.length === 0) return;
    setExportando(true);
    try {
      const periodoLabel =
        periodo === 'personalizado'
          ? `${inicioCustom} a ${fimCustom}`
          : PERIODOS.find(p => p.key === periodo)?.label ?? '';
      const html = gerarHTML(historico, periodoLabel);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      showErrorToast('Erro ao gerar PDF', 'Erro');
    } finally {
      setExportando(false);
    }
  }

  function renderItem({ item }: { item: HistoricoLocacaoDto }) {
    const atraso = diasAtraso(item.dataDevolucaoPrevista, item.dataEfetivaDevolvido);
    const atrasoColor =
      atraso === null ? '#9ca3af' : atraso > 0 ? '#dc2626' : '#16a34a';
    const atrasoLabel =
      atraso === null
        ? 'Sem prazo definido'
        : atraso > 0
        ? `${atraso} dia(s) de atraso`
        : atraso < 0
        ? `${Math.abs(atraso)} dia(s) antecipado`
        : 'Devolvido no prazo';

    return (
      <View style={styles.item}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemNome} numberOfLines={1}>{item.patrimonio.descricao}</Text>
          <View style={[styles.atrasoBadge, { backgroundColor: atrasoColor + '20' }]}>
            <Text style={[styles.atrasoText, { color: atrasoColor }]}>{atrasoLabel}</Text>
          </View>
        </View>
        <Text style={styles.itemSerie}>N° série: {item.patrimonio.numeroSerie}</Text>

        <View style={styles.itemDates}>
          <View style={styles.dateItem}>
            <Building2 size={12} color="#6b7280" />
            <Text style={styles.dateLabel}>{item.nomeLocadora}</Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={12} color="#6b7280" />
            <Text style={styles.dateLabel}>Chegou: {formatarData(item.dataLocacao)}</Text>
          </View>
          {item.dataDevolucaoPrevista && (
            <View style={styles.dateItem}>
              <CalendarCheck size={12} color="#6b7280" />
              <Text style={styles.dateLabel}>
                Prazo: {formatarData(item.dataDevolucaoPrevista)}
              </Text>
            </View>
          )}
          <View style={styles.dateItem}>
            <CalendarCheck size={12} color="#19325E" />
            <Text style={[styles.dateLabel, { color: '#19325E', fontWeight: '600' }]}>
              Devolvido: {formatarData(item.dataEfetivaDevolvido)}
            </Text>
          </View>
        </View>

        {item.observacao ? (
          <Text style={styles.itemObs}>obs: {item.observacao}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Filtros */}
        <View style={styles.filtrosCard}>
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
                value={inicioCustom}
                onChangeText={setInicioCustom}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.dateSep}>até</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                value={fimCustom}
                onChangeText={setFimCustom}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          )}

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
            <Text style={styles.resumoTotal}>{historico.length}</Text>
            <Text style={styles.resumoLabel}>
              {historico.length === 1
                ? 'equipamento devolvido no período'
                : 'equipamentos devolvidos no período'}
            </Text>
          </View>
        )}

        {/* Lista */}
        <FlatList
          data={historico}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            buscado ? (
              <View style={styles.empty}>
                <FileText size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Nenhuma locação encontrada no período</Text>
              </View>
            ) : null
          }
        />

        {/* Botão PDF */}
        {historico.length > 0 && (
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
  container: { flex: 1, gap: 10 },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  chipAtivo: { backgroundColor: '#19325E', borderColor: '#19325E' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  chipTextAtivo: { color: '#fff' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
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
  dateSep: { color: '#6b7280', fontSize: 13 },
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
  filtrarBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resumoRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
  },
  resumoTotal: { fontSize: 28, fontWeight: '700', color: '#19325E' },
  resumoLabel: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  lista: { gap: 8, paddingBottom: 80 },
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
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 2,
  },
  itemNome: { fontSize: 14, fontWeight: '700', color: '#19325E', flex: 1 },
  itemSerie: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  atrasoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  atrasoText: { fontSize: 10, fontWeight: '700' },
  itemDates: { gap: 4 },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 12, color: '#6b7280' },
  itemObs: { fontSize: 11, color: '#9ca3af', marginTop: 6, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
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
  pdfBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
