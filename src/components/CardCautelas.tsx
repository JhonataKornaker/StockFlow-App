import { CheckCircle } from 'lucide-react-native';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

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
  data: string; // data formatada, ex: "07/07/2025"
  entregue: boolean;
  colaborador: Colaborador;
  ferramentas: Ferramenta[];
  patrimonios: Patrimonio[];
}

interface Props {
  cautelas: Cautela;
  onFinalizar: (id: number) => void;
}

export default function CardCautelas({ cautelas, onFinalizar }: Props) {
  return (
    <SafeAreaView style={styles.cardContainer}>
      <View style={styles.headerContainer}>
        <Text style={{ fontWeight: '500', fontSize: 16, color: '#19325E' }}>
          {cautelas.colaborador.funcao}
        </Text>
        <Text style={{ fontWeight: '500', fontSize: 16, color: '#19325E' }}>
          {cautelas.colaborador.nome}
        </Text>
        <Text style={{ fontWeight: '500', fontSize: 16, color: '#19325E' }}>
          {cautelas.colaborador.empresa}
        </Text>
      </View>

      {/* Ferramentas */}
      {cautelas.ferramentas.map((item, index) => (
        <View key={index}>
          <View style={styles.itemContainer}>
            <Text>{item.quantidade} UND</Text>
            <Text style={styles.itemDescription}>{item.descricao}</Text>
            <Text>{cautelas.data}</Text>
            <TouchableOpacity>
              <CheckCircle size={24} onPress={() => onFinalizar(cautelas.id)} />
            </TouchableOpacity>
          </View>
          {index < cautelas.ferramentas.length - 1 && (
            <View style={styles.separator} />
          )}
        </View>
      ))}

      <View style={styles.separator} />

      {/* Patrimônios */}
      {cautelas.patrimonios.map((item, index) => (
        <View key={index}>
          <View style={styles.itemContainer}>
            <Text>{item.numeroSerie}</Text>
            <Text style={styles.itemDescription}>{item.descricao}</Text>
            <Text>{cautelas.data}</Text>
            <TouchableOpacity onPress={() => onFinalizar(cautelas.id)}>
              <CheckCircle size={24} />
            </TouchableOpacity>
          </View>
          {index < cautelas.patrimonios.length - 1 && (
            <View style={styles.separator} />
          )}
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 8,
    backgroundColor: '#ffffff44',
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    gap: 8,
    alignItems: 'center',
  },
  itemDescription: {
    flex: 1,
    textAlign: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    marginVertical: 4,
  },
});
