import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { Search } from 'lucide-react-native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function CautelaScreen() {
  const today = new Date();
  const data = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <Screen style={styles.screen}>
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
  screen: {},
  viewColumn: {
    flexDirection: 'column', // flex-col
    marginTop: 44, // mt-[44px]
    gap: 16, // gap-4
  },
  viewRow: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 28,
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 18, // text-xs
    color: '#19325E', // text-primary, substitua com a cor real que você está usando
    fontWeight: 'bold', // font-bold
  },
  flex1: {
    flex: 1, // flex-1
  },
  whiteBg: {
    backgroundColor: 'white',
    borderRadius: 8, // rounded-lgs, substitua com o valor real se necessário
    width: '100%', // w-full
    height: '80%',
  },
  button: {
    marginBottom: 12,
    alignSelf: 'center',
  },
});
