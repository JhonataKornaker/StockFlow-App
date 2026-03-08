import { CheckCircle, Clock, Hammer, Shield } from 'lucide-react-native';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

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

interface Props {
  cautelas: Cautela;
  onFinalizar: (id: number) => void;
}

function diasAbertos(dataStr: string): number {
  const [dd, mm, yyyy] = dataStr.split('/');
  const data = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Math.floor((Date.now() - data.getTime()) / 86400000);
}

export default function CardCautelas({ cautelas, onFinalizar }: Props) {
  const dias = diasAbertos(cautelas.data);
  const diasColor = dias >= 8 ? '#ef4444' : dias >= 4 ? '#f97316' : '#6b7280';
  const diasLabel = dias === 0 ? 'Hoje' : dias === 1 ? '1 dia aberto' : `${dias} dias aberto`;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.nome}>{cautelas.colaborador.nome}</Text>
          <Text style={styles.sub}>
            {cautelas.colaborador.funcao} · {cautelas.colaborador.empresa}
          </Text>
        </View>
        <View style={[styles.diasBadge, { borderColor: diasColor }]}>
          <Clock size={11} color={diasColor} />
          <Text style={[styles.diasText, { color: diasColor }]}>{diasLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Ferramentas */}
      {cautelas.ferramentas.map((item, index) => (
        <View key={`f-${index}`} style={styles.itemRow}>
          <Hammer size={14} color="#6b7280" style={styles.itemIcon} />
          <Text style={styles.itemDesc} numberOfLines={1}>{item.descricao}</Text>
          <Text style={styles.itemQtd}>{item.quantidade} UND</Text>
          <Text style={styles.itemData}>{cautelas.data}</Text>
        </View>
      ))}

      {/* Patrimônios */}
      {cautelas.patrimonios.map((item, index) => (
        <View key={`p-${index}`} style={styles.itemRow}>
          <Shield size={14} color="#6b7280" style={styles.itemIcon} />
          <Text style={styles.itemDesc} numberOfLines={1}>{item.descricao}</Text>
          <Text style={styles.itemQtd} numberOfLines={1}>{item.numeroSerie}</Text>
          <Text style={styles.itemData}>{cautelas.data}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      {/* Botão Dar Baixa */}
      <TouchableOpacity
        style={styles.baixaBtn}
        onPress={() => onFinalizar(cautelas.id)}
        activeOpacity={0.8}
      >
        <CheckCircle size={18} color="#fff" />
        <Text style={styles.baixaBtnText}>Dar Baixa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#19325E',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#19325E',
  },
  sub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  diasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  diasText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  itemIcon: {
    width: 18,
  },
  itemDesc: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  itemQtd: {
    fontSize: 12,
    color: '#6b7280',
    maxWidth: 80,
  },
  itemData: {
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 64,
    textAlign: 'right',
  },
  baixaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#19325E',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  baixaBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
