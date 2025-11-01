import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Cautela {
  id: string;
  nome: string;
  descricao: string;
  quantidade: string;
  data: string;
  itemId: string;
  colaboradorId: number;
}

interface CardCriarCautelasProps {
  cautelas: Cautela[];
  onRemoveCautela: (id: string) => void;
}

export default function CardCriarCautelas({
  cautelas,
  onRemoveCautela,
}: CardCriarCautelasProps) {
  if (cautelas.length > 0) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
        {cautelas.map((cautela, index) => (
          <View key={cautela.id} style={styles.cautelaItem}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <Text
                  style={{ color: '#19325E', fontSize: 16, fontWeight: 'bold' }}
                >
                  {cautela.nome}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveCautela(cautela.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}
              >
                <Text style={styles.colorSubText}>{cautela.descricao}</Text>
                <Text style={{ paddingHorizontal: 4 }}>|</Text>
                <Text style={styles.colorSubText}>
                  Qtd: {cautela.quantidade}
                </Text>
                <Text style={{ paddingHorizontal: 4 }}>|</Text>
                <Text style={styles.colorSubText}>{cautela.data}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  colorSubText: {
    color: '#6B6E71',
    fontSize: 14,
    fontWeight: '400',
  },
  // NOVOS ESTILOS:
  cautelaItem: {
    backgroundColor: '#f8f9fa99',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#19325E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ff4757',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
