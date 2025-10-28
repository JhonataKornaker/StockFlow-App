import { Button } from '@/components/Button';
import CardCriarCautelas from '@/components/CardCriarCautelas';
import { Screen } from '@/components/ScreenProps';
import { SkeletonCautelaForm } from '@/components/Skeleton/SkeletonCautelaForm';
import {
  criarCautelas,
  listarColaboradores,
  listarItens,
} from '@/service/cautelaService';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';

interface Item {
  id: number;
  label: string;
  tipo: string;
}

interface Cautela {
  id: string;
  nome: string;
  descricao: string;
  quantidade: string;
  data: string;
  itemId: string;
  colaboradorId: number;
}

type NavigationProps = StackNavigationProp<MainStackParamList, 'Cautela'>;

// ===== CONSTANTE DE TEMPO MÍNIMO =====
const MINIMUM_LOADING_TIME = 800; // 800ms

export default function CautelaScreen() {
  // ===== NOVO ESTADO DE LOADING =====
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [itens, setItens] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProps>();
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
  const [cautelasList, setCautelasList] = useState<Cautela[]>([]);

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

  // ===== CARREGAMENTO INICIAL COM DELAY MÍNIMO =====
  useEffect(() => {
    async function carregar() {
      setIsLoadingData(true);
      const startTime = Date.now();

      try {
        // ===== CHAMADAS À API =====
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

        // ===== DELAY MÍNIMO =====
        const elapsedTime = Date.now() - startTime;
        const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setItens(mappedItens);
        setColaboradores(mappedColaboradores);
        console.log('Colaboradores: ', mappedColaboradores);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoadingData(false);
      }
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

  // ===== SALVAR COM DELAY MÍNIMO =====
  async function handleSalvarCautela() {
    if (cautelasList.length === 0) {
      alert('Crie uma cautela antes de salvar!');
      return;
    }

    setIsSaving(true);
    const startTime = Date.now();

    try {
      const cautelasParaSalvar = cautelasList.map(cautela => {
        const itemData = itens.find(
          item => item.id.toString() === cautela.itemId,
        );

        return {
          tipo: itemData?.tipo || 'ferramenta',
          entregue: false,
          colaboradorId: cautela.colaboradorId,
          ferramentas:
            itemData?.tipo === 'ferramenta' ? [parseInt(cautela.itemId)] : [],
          patrimonios:
            itemData?.tipo === 'patrimonio' ? [parseInt(cautela.itemId)] : [],
        };
      });

      console.log(
        'Salvar Lista de Cautelas: ',
        JSON.stringify(cautelasParaSalvar, null, 2),
      );

      // ===== CHAMADA À API =====
      await criarCautelas(cautelasParaSalvar);

      // ===== DELAY MÍNIMO =====
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      alert(`${cautelasList.length} cautela(s) salva(s) com sucesso!`);
      setCautelasList([]);
      navigation.navigate('Inicio');
    } catch (error) {
      console.error('Erro ao salvar cautelas:', error);
      alert('Erro ao salvar cautelas. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
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

  function handleCriarCautela() {
    if (!itemSelecionado || !colaboradorSelecionadoId || !quantidade.trim()) {
      alert('Preencha todos os campos antes de criar a cautela!');
      return;
    }

    const novaCautela: Cautela = {
      id: Date.now().toString(),
      nome: textoColaborador,
      descricao: textoDig,
      quantidade: quantidade,
      data: data,
      itemId: itemSelecionado,
      colaboradorId: colaboradorSelecionadoId,
    };

    setCautelasList(prev => [...prev, novaCautela]);

    setTextoDig('');
    setTextoColaborador('');
    setQuantidade('');
    setItemSelecionado('');
    setColaboradorSelecionadoId(null);
  }

  function handleRemoverCautela(id: string) {
    setCautelasList(prev => prev.filter(cautela => cautela.id !== id));
  }

  // ===== RENDERIZAÇÃO COM SKELETON =====
  if (isLoadingData) {
    return (
      <Screen>
        <SkeletonCautelaForm />
      </Screen>
    );
  }

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
                      top: 50,
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
            <TouchableOpacity onPress={handleCriarCautela}>
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
            <View style={styles.whiteBg}>
              <CardCriarCautelas
                cautelas={cautelasList}
                onRemoveCautela={handleRemoverCautela}
              />
            </View>
          </View>

          {/* ===== BOTÃO COM LOADING ===== */}
          <Button
            style={styles.button}
            title={isSaving ? 'Salvando...' : 'Salvar'}
            onPress={handleSalvarCautela}
            disabled={isSaving}
          />
          {isSaving && (
            <ActivityIndicator
              size="small"
              color="#19325E"
              style={{ marginBottom: 12 }}
            />
          )}
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
