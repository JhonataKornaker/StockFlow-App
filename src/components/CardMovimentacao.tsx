import { ResumoMovimentacaoEstoque } from '@/dtos/movimentacaoDto';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

interface Props {
  movimentacao: ResumoMovimentacaoEstoque;
}

export default function CardMovimentacao({ movimentacao }: Props) {
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Combinar entrada e saída e ordenar por data
  const movimentacoes = [
    movimentacao.ultimaEntrada && {
      tipo: 'entrada',
      data: movimentacao.ultimaEntrada.data,
      quantidade: movimentacao.ultimaEntrada.quantidade,
      insumo: movimentacao.ultimaEntrada.insumo,
      responsavel: movimentacao.ultimaEntrada.fornecedor,
    },
    movimentacao.ultimaSaida && {
      tipo: 'saida',
      data: movimentacao.ultimaSaida.data,
      quantidade: movimentacao.ultimaSaida.quantidade,
      insumo: movimentacao.ultimaSaida.insumo,
      responsavel: movimentacao.ultimaSaida.colaborador,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b!.data).getTime() - new Date(a!.data).getTime());

  if (movimentacoes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
      </View>
    );
  }

  // Agrupar por data
  const movimentacoesPorData = movimentacoes.reduce(
    (acc, mov) => {
      if (!mov) return acc;
      const dataFormatada = formatarData(mov.data);
      if (!acc[dataFormatada]) {
        acc[dataFormatada] = [];
      }
      acc[dataFormatada].push(mov);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <View style={styles.container}>
      {Object.entries(movimentacoesPorData).map(([data, movs]) => (
        <View key={data}>
          {/* Cabeçalho da Data */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{data}</Text>
          </View>

          {/* Lista de Movimentações */}
          {movs.map((mov, index) => (
            <View key={index} style={styles.itemContainer}>
              {/* Quantidade e Insumo */}

              <Text style={styles.quantidadeText}>
                {mov.quantidade.toString().padStart(2, '0')} und
              </Text>
              <Text style={styles.insumoText}>{mov.insumo}</Text>

              {/* Responsável */}
              <View style={styles.centerContent}>
                <Text style={styles.responsavelText}>{mov.responsavel}</Text>
              </View>

              {/* Ícone (Entrada/Saída) */}
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../assets/img_movimentacao.png')}
                  style={[
                    styles.iconImage,
                    {
                      tintColor:
                        mov.tipo === 'entrada'
                          ? 'rgba(34, 197, 94, 0.7)'
                          : 'rgba(239, 68, 68, 0.7)', // muda a cor
                      transform: [
                        { rotate: mov.tipo === 'entrada' ? '0deg' : '180deg' },
                      ], // inverte
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff44',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  dateHeader: {
    backgroundColor: '#ffffff44',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#19325E',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantidadeText: {
    flex: 1,
    fontSize: 15,
    marginBottom: 2,
    paddingLeft: 10,
  },
  insumoText: {
    flex: 2,
    fontSize: 15,
  },
  centerContent: {
    flex: 2,
    paddingHorizontal: 8,
  },
  responsavelText: {
    fontSize: 15,
    color: '#19325E',
  },
  iconContainer: {
    flex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
