import { Screen } from '@/components/ScreenProps';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { ItemInventarioDto, StatusInventario } from '@/dtos/inventarioDto';
import { buscarInventario } from '@/service/inventario.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { parseApiError, showErrorToast } from '@/util/toast';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  User,
  XCircle,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'DetalhesInventario'>;
type RouteProps = RouteProp<MainStackParamList, 'DetalhesInventario'>;

function statusConfig(status: StatusInventario) {
  switch (status) {
    case 'EM_ANDAMENTO':
      return { label: 'Em andamento', color: '#f59e0b', Icon: Clock };
    case 'FINALIZADO':
      return { label: 'Finalizado', color: '#22c55e', Icon: CheckCircle2 };
    case 'CANCELADO':
      return { label: 'Cancelado', color: '#9ca3af', Icon: XCircle };
  }
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

function gerarHTML(inv: {
  solicitante: string;
  observacao?: string;
  fotoUrl?: string;
  criadoEm: string;
  finalizadoEm?: string;
  itens: ItemInventarioDto[];
}): string {
  const dataFormatada = new Date(inv.criadoEm).toLocaleDateString('pt-BR');
  const geradoEm = new Date().toLocaleString('pt-BR');

  const comDivergencia = inv.itens.filter(i => i.diferenca !== 0).length;

  const linhas = inv.itens
    .map(item => {
      const difColor =
        item.diferenca > 0 ? '#16a34a' : item.diferenca < 0 ? '#dc2626' : '#6b7280';
      const difLabel =
        item.diferenca > 0
          ? `+${item.diferenca}`
          : item.diferenca.toString();

      return `
        <tr>
          <td>${item.estoque.insumo.descricao}</td>
          <td style="text-align:center">${item.estoque.insumo.unidade}</td>
          <td style="text-align:center">${item.quantidadeAnterior}</td>
          <td style="text-align:center">${item.quantidadeContada}</td>
          <td style="text-align:center;color:${difColor};font-weight:700">${difLabel}</td>
        </tr>`;
    })
    .join('');

  const fotoHtml = inv.fotoUrl
    ? `<div style="margin:20px 0"><img src="${inv.fotoUrl}" style="max-width:100%;border-radius:8px;max-height:300px;object-fit:cover" /></div>`
    : '';

  return `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
      h1 { color: #19325E; font-size: 20px; margin-bottom: 4px; }
      .sub { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
      .resumo { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
      .resumo-item { background: #f9fafb; border-radius: 8px; padding: 10px 16px; min-width: 120px; }
      .resumo-label { font-size: 11px; color: #6b7280; }
      .resumo-valor { font-size: 20px; font-weight: 700; color: #19325E; }
      .meta { background: #f0f4ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #374151; }
      .meta strong { color: #19325E; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #19325E; color: #fff; padding: 8px; text-align: left; }
      th:not(:first-child) { text-align: center; }
      td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style></head><body>
    <h1>Relatório de Inventário</h1>
    <p class="sub">Data: ${dataFormatada} &nbsp;|&nbsp; Gerado em ${geradoEm}</p>
    <div class="meta">
      <strong>Solicitante:</strong> ${inv.solicitante}
      ${inv.observacao ? `&nbsp;&nbsp;|&nbsp;&nbsp;<strong>Obs.:</strong> ${inv.observacao}` : ''}
    </div>
    <div class="resumo">
      <div class="resumo-item"><div class="resumo-label">Total de itens</div><div class="resumo-valor">${inv.itens.length}</div></div>
      <div class="resumo-item"><div class="resumo-label">Com divergência</div><div class="resumo-valor" style="color:${comDivergencia > 0 ? '#dc2626' : '#16a34a'}">${comDivergencia}</div></div>
    </div>
    ${fotoHtml}
    <table>
      <thead><tr>
        <th>Insumo</th><th>Unidade</th><th>Qtd. Sistema</th><th>Qtd. Contada</th><th>Diferença</th>
      </tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    </body></html>`;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DetalhesInventarioScreen() {
  const route = useRoute<RouteProps>();
  const { inventarioId } = route.params;

  const [inventario, setInventario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await buscarInventario(inventarioId);
      setInventario(dados);
    } catch (error) {
      showErrorToast(parseApiError(error, 'Erro ao carregar inventário.'), 'Erro');
    } finally {
      setCarregando(false);
    }
  }

  async function handleExportarPDF() {
    if (!inventario) return;
    setExportando(true);
    try {
      const html = gerarHTML(inventario);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      showErrorToast('Erro ao gerar o PDF. Tente novamente.', 'Erro');
    } finally {
      setExportando(false);
    }
  }

  if (carregando) {
    return (
      <Screen>
        <SkeletonGeneric variant="list" />
      </Screen>
    );
  }

  if (!inventario) return null;

  const { label, color, Icon } = statusConfig(inventario.status);
  const data = new Date(inventario.criadoEm).toLocaleDateString('pt-BR');
  const comDivergencia = inventario.itens.filter((i: ItemInventarioDto) => i.diferenca !== 0);
  const semDivergencia = inventario.itens.filter((i: ItemInventarioDto) => i.diferenca === 0);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Cabeçalho */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
              <Icon size={12} color={color} />
              <Text style={[styles.statusText, { color }]}>{label}</Text>
            </View>
            <Text style={styles.headerData}>{data}</Text>
          </View>

          <View style={styles.metaRow}>
            <User size={14} color="#6b7280" />
            <Text style={styles.metaText}>{inventario.solicitante}</Text>
          </View>

          {inventario.observacao ? (
            <Text style={styles.obsText}>{inventario.observacao}</Text>
          ) : null}

          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiValor}>{inventario.itens.length}</Text>
              <Text style={styles.kpiLabel}>Total contados</Text>
            </View>
            <View style={[styles.kpi, comDivergencia.length > 0 && styles.kpiAlerta]}>
              <Text style={[styles.kpiValor, comDivergencia.length > 0 && { color: '#dc2626' }]}>
                {comDivergencia.length}
              </Text>
              <Text style={styles.kpiLabel}>Com divergência</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={[styles.kpiValor, { color: '#16a34a' }]}>{semDivergencia.length}</Text>
              <Text style={styles.kpiLabel}>Sem divergência</Text>
            </View>
          </View>
        </View>

        {/* Foto */}
        {inventario.fotoUrl ? (
          <View style={styles.fotoCard}>
            <Text style={styles.sectionLabel}>Foto do inventário</Text>
            <Image source={{ uri: inventario.fotoUrl }} style={styles.foto} />
          </View>
        ) : null}

        {/* Divergências em destaque */}
        {comDivergencia.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Divergências</Text>
            {comDivergencia.map((item: ItemInventarioDto) => (
              <View key={item.id} style={styles.itemDiverg}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={1}>
                    {item.estoque.insumo.descricao}
                  </Text>
                  <Text style={styles.itemDetalhe}>
                    Sistema: {item.quantidadeAnterior} → Contado: {item.quantidadeContada} {item.estoque.insumo.unidade}
                  </Text>
                </View>
                <View style={[
                  styles.diffBadge,
                  { backgroundColor: item.diferenca > 0 ? '#dcfce7' : '#fee2e2' },
                ]}>
                  <Text style={[
                    styles.diffText,
                    { color: item.diferenca > 0 ? '#16a34a' : '#dc2626' },
                  ]}>
                    {item.diferenca > 0 ? '+' : ''}{item.diferenca}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Todos os itens */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Todos os itens</Text>
          {inventario.itens.map((item: ItemInventarioDto) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemRowNome} numberOfLines={1}>{item.estoque.insumo.descricao}</Text>
              <Text style={styles.itemRowUnidade}>{item.estoque.insumo.unidade}</Text>
              <Text style={styles.itemRowQtd}>{item.quantidadeAnterior}</Text>
              <Text style={styles.itemRowSeta}>→</Text>
              <Text style={[
                styles.itemRowQtd,
                item.diferenca !== 0 && { color: item.diferenca > 0 ? '#16a34a' : '#dc2626', fontWeight: '700' },
              ]}>
                {item.quantidadeContada}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão PDF */}
      {inventario.status === 'FINALIZADO' && (
        <TouchableOpacity
          style={styles.pdfBtn}
          onPress={handleExportarPDF}
          disabled={exportando}
        >
          {exportando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FileText size={18} color="#fff" />
              <Text style={styles.pdfBtnText}>Exportar PDF</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10, paddingBottom: 90 },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  headerData: { fontSize: 13, color: '#9ca3af' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
  obsText: { fontSize: 13, color: '#6b7280', fontStyle: 'italic' },
  kpiRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  kpi: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  kpiAlerta: { backgroundColor: '#fef2f2' },
  kpiValor: { fontSize: 22, fontWeight: '800', color: theme.colors.primary },
  kpiLabel: { fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 2 },
  fotoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    elevation: 1,
  },
  foto: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'cover' },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemDiverg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
  itemDetalhe: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 14, fontWeight: '800' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    gap: 6,
  },
  itemRowNome: { flex: 1, fontSize: 13, color: '#374151' },
  itemRowUnidade: { fontSize: 11, color: '#9ca3af', width: 40 },
  itemRowQtd: { fontSize: 13, color: '#374151', width: 32, textAlign: 'center' },
  itemRowSeta: { fontSize: 12, color: '#d1d5db' },
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
    left: 12,
    right: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pdfBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
