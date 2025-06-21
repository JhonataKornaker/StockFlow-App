import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { Search } from 'lucide-react-native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function CautelaScreen() {
  const today = new Date();
  const data = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <Screen>
      <View style={styles.viewColumn}>
        <Input placeholder="Item" icon={Search} iconPosition="right" />
        <Input placeholder="Quantidade" keyboardType="numeric" />
        <Input placeholder="Colaborador" icon={Search} iconPosition="right" />
      </View>

      <View style={styles.viewRow}>
        <Text style={styles.text}>Data da Retirada: </Text>
        <Text style={{ color: '#19325EB2', fontSize: 15 }}>{data}</Text>
      </View>

      <View style={styles.flex1}>
        <TouchableOpacity>
          <Text
            style={{
              color: '#19325E',
              fontSize: 15,
              fontWeight: 'bold',
              alignSelf: 'flex-end',
              marginBottom: 14,
            }}
          >
            Criar Cautela
          </Text>
        </TouchableOpacity>
        <View style={styles.whiteBg}></View>
      </View>
      <Button style={styles.button} title="Salvar" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  viewColumn: {
    flexDirection: 'column',
    marginTop: 44,
    gap: 16,
  },
  viewRow: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 28,
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 18,
    color: '#19325E',
    fontWeight: 'bold',
  },
  flex1: {
    flex: 1,
  },
  whiteBg: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    height: '80%',
  },
  button: {
    marginBottom: 12,
    alignSelf: 'center',
  },
});
