import { ResumoMovimentacaoEstoque } from '@/dtos/movimentacaoDto';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';

interface Props {
  movimentacao: ResumoMovimentacaoEstoque;
}

export default function CardMovimentacao({ movimentacao }: Props) {
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Sao_Paulo',
    });
  };

  const movimentacoes = [
    movimentacao.ultimaEntrada && {
      tipo: 'entrada' as const,
      data: movimentacao.ultimaEntrada.data,
      quantidade: movimentacao.ultimaEntrada.quantidade,
      insumo: movimentacao.ultimaEntrada.insumo,
      responsavel: movimentacao.ultimaEntrada.fornecedor,
    },
    movimentacao.ultimaSaida && {
      tipo: 'saida' as const,
      data: movimentacao.ultimaSaida.data,
      quantidade: movimentacao.ultimaSaida.quantidade,
      insumo: movimentacao.ultimaSaida.insumo,
      responsavel: movimentacao.ultimaSaida.colaborador,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b!.data).getTime() - new Date(a!.data).getTime()) as NonNullable<typeof movimentacoes[number]>[];

  if (movimentacoes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {movimentacoes.map((mov, index) => {
        const isEntrada = mov.tipo === 'entrada';
        const cor = isEntrada ? '#22c55e' : '#ef4444';
        const bgCor = isEntrada ? '#f0fdf4' : '#fef2f2';
        return (
          <View
            key={index}
            style={[styles.row, { backgroundColor: bgCor, borderLeftColor: cor }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: cor + '22' }]}>
              {isEntrada
                ? <ArrowUp size={16} color={cor} />
                : <ArrowDown size={16} color={cor} />}
            </View>

            <View style={styles.info}>
              <Text style={styles.insumoText} numberOfLines={1}>{mov.insumo}</Text>
              {mov.responsavel ? (
                <Text style={styles.responsavelText} numberOfLines={1}>{mov.responsavel}</Text>
              ) : null}
            </View>

            <View style={styles.rightCol}>
              <Text style={[styles.qtdText, { color: cor }]}>
                {isEntrada ? '+' : '-'}{mov.quantidade}
              </Text>
              <Text style={styles.dataText}>{formatarData(mov.data)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  insumoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#162B4D',
  },
  responsavelText: {
    fontSize: 12,
    color: '#64748B',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  qtdText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dataText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
