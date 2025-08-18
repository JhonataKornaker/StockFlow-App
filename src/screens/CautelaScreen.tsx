import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { listarColaboradores, listarItens } from '@/service/cautelaService';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';

interface Item {
  id: number;
  label: string;
  tipo: string;
}

export default function CautelaScreen() {
  const [itens, setItens] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [textoDig, setTextoDig] = useState('');
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeHabilitada, setQuantidadeHabilitada] = useState(false);
  const [showList, setShowList] = useState(false);
  const [filteredColaboradores, setFilteredColaboradores] = useState<
    { id: number; label: string }[]
  >([]);
  const [colaboradorSelecionadoId, setColaboradorSelecionadoId] = useState<
    number | null
  >(null);
  const [textoColaborador, setTextoColaborador] = useState('');
  const [showColaboradorList, setShowColaboradorList] = useState(false);

  const today = new Date();
  const data = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  useEffect(() => {
    if (textoColaborador.length > 0) {
      const newData = colaboradores.filter(item =>
        item.label.toLowerCase().includes(textoColaborador.toLowerCase()),
      );
      setFilteredColaboradores(newData);
    } else {
      setFilteredColaboradores(colaboradores);
    }
  }, [textoColaborador, colaboradores]);

  const handleSelectColaborador = (item: { id: number; label: string }) => {
    setTextoColaborador(item.label);
    setColaboradorSelecionadoId(item.id);
    setShowColaboradorList(false);
  };

  useEffect(() => {
    async function carregar() {
      const listaItens = await listarItens();
      const listaColaboradores = await listarColaboradores();

      const mappedItens = listaItens.map(item => ({
        id: item.id,
        label: `${item.descricao} - ${item.marca} ${item.modelo}`,
        tipo: item.tipo,
      }));

      const mappedColaboradores = listaColaboradores.map(col => ({
        id: col.id,
        label: `${col.nome}`,
      }));

      setItens(mappedItens);
      setColaboradores(mappedColaboradores);
      console.log('Colaboradores: ', colaboradores);
    }
    carregar();
  }, []);

  useEffect(() => {
    if (textoDig.length > 0) {
      const newData = itens.filter(item =>
        item.label.toLowerCase().includes(textoDig.toLowerCase()),
      );
      setFiltered(newData);
    } else {
      setFiltered(itens);
    }
  }, [textoDig, itens]);

  function handleSalvarCautela() {
    if (!itemSelecionado || !colaboradorSelecionadoId) {
      alert('Selecione item e colaborador!');
      return;
    }

    const dadosParaSalvar = {
      itemId: itemSelecionado,
      colaboradorId: colaboradorSelecionadoId,
      quantidade,
      data,
    };

    console.log('Salvar Dados: ', dadosParaSalvar);
  }

  const handleSelect = (item: { id: number; label: string; tipo: string }) => {
    setTextoDig(item.label);
    setItemSelecionado(item.id.toString());
    setShowList(false);

    if (item.tipo === 'patrimonio') {
      setQuantidade('1');
      setQuantidadeHabilitada(false);
    } else {
      setQuantidade('');
      setQuantidadeHabilitada(true);
    }
  };

  return (
    <Screen>
      <TouchableWithoutFeedback
        onPress={() => {
          setShowList(false);
          setShowColaboradorList(false);
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.viewColumn}>
            <TextInput
              style={styles.input}
              value={textoDig}
              onChangeText={text => {
                setTextoDig(text);
                setShowList(true);
              }}
              placeholder="Digite o item..."
              onFocus={() => setShowList(true)}
            />

            {showList && (
              <FlatList
                style={[
                  styles.list,
                  {
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                  },
                ]}
                data={filtered}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelect(item)}>
                    <Text style={styles.listItem}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Campo de Quantidade */}
            <TextInput
              placeholder="Quantidade"
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
              editable={quantidadeHabilitada}
            />

            <View style={{ position: 'relative', marginBottom: 20 }}>
              <TextInput
                placeholder="Colaborador"
                style={styles.input}
                value={textoColaborador}
                onChangeText={text => {
                  setTextoColaborador(text);
                  setShowColaboradorList(true);
                }}
                onFocus={() => setShowColaboradorList(true)}
              />

              {showColaboradorList && (
                <FlatList
                  style={[
                    styles.list,
                    {
                      position: 'absolute',
                      top: 50, // ou use input height
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                    },
                  ]}
                  data={filteredColaboradores}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectColaborador(item)}
                    >
                      <Text style={styles.listItem}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
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

          <Button
            style={styles.button}
            title="Salvar"
            onPress={handleSalvarCautela}
          />
        </View>
      </TouchableWithoutFeedback>
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
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
  },
  list: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    maxHeight: 150,
    backgroundColor: '#fff',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
