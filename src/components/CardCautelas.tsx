import { Cautela } from '@/types/Cautelas';
import { CheckCircle } from 'lucide-react-native';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

interface Props {
  cautelas: Cautela;
}

export default function CardCautelas({ cautelas }: Props) {
  return (
    <SafeAreaView style={styles.cardContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{cautelas.funcaoColaborador}</Text>
        <Text style={styles.headerText}>{cautelas.nomeColaborador}</Text>
        <Text style={styles.headerText}>{cautelas.empresaColaborador}</Text>
      </View>

      {/* Ferramentas */}
      {cautelas.ferramentas.map((item, index) => (
        <View key={item.id}>
          <View style={styles.itemContainer}>
            <Text>{item.quantidade} UND</Text>
            <Text style={styles.itemDescription}>{item.descricao}</Text>
            <Text>{cautelas.dataCautela}</Text>
            <TouchableOpacity>
              <CheckCircle size={24} />
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
        <View key={item.id}>
          <View style={styles.itemContainer}>
            <Text>{item.numeroSerie}</Text>
            <Text style={styles.itemDescription}>{item.descricao}</Text>
            <Text>{cautelas.dataCautela}</Text>
            <TouchableOpacity>
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
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 10,
    color: '#007bff', // text-primary
    fontWeight: 'bold',
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
    borderColor: '#D1D5DB', // border-gray-300
    marginVertical: 4,
  },
});
