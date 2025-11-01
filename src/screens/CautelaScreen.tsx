import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import CardCriarCautelas from '@/components/CardCriarCautelas';
import { Screen } from '@/components/ScreenProps';
import { SkeletonCautelaForm } from '@/components/Skeleton/SkeletonCautelaForm';
import {
  criarCautelas,
  listarColaboradores,
  listarItens,
} from '@/service/cautela.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Package, User, Hash } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

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

const MINIMUM_LOADING_TIME = 800;

export default function CautelaScreen() {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [itens, setItens] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProps>();
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeHabilitada, setQuantidadeHabilitada] = useState(false);
  const [colaboradorSelecionadoId, setColaboradorSelecionadoId] = useState<
    number | null
  >(null);

  // Estados para busca e sugestões
  const [buscaItem, setBuscaItem] = useState('');
  const [itensSugeridos, setItensSugeridos] = useState<Item[]>([]);
  const [buscaColaborador, setBuscaColaborador] = useState('');
  const [colaboradoresSugeridos, setColaboradoresSugeridos] = useState<any[]>(
    [],
  );

  const today = new Date();
  const data = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  const [cautelasList, setCautelasList] = useState<Cautela[]>([]);

  // Carregamento inicial
  useEffect(() => {
    async function carregar() {
      setIsLoadingData(true);
      const startTime = Date.now();

      try {
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

        const elapsedTime = Date.now() - startTime;
        const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setItens(mappedItens);
        setColaboradores(mappedColaboradores);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoadingData(false);
      }
    }
    carregar();
  }, []);

  // Buscar itens sugeridos
  const buscarItensSugeridos = (texto: string) => {
    setBuscaItem(texto);

    if (!texto.trim()) {
      setItensSugeridos([]);
      return;
    }

    const sugestoes = itens.filter(item =>
      item.label.toLowerCase().includes(texto.toLowerCase()),
    );
    setItensSugeridos(sugestoes.slice(0, 5));
  };

  // Selecionar item
  const selecionarItem = (item: Item) => {
    setBuscaItem('');
    setItemSelecionado(item.id.toString());
    setItensSugeridos([]);

    if (item.tipo === 'patrimonio') {
      setQuantidade('1');
      setQuantidadeHabilitada(false);
    } else {
      setQuantidade('');
      setQuantidadeHabilitada(true);
    }
  };

  // Buscar colaboradores sugeridos
  const buscarColaboradoresSugeridos = (texto: string) => {
    setBuscaColaborador(texto);

    if (!texto.trim()) {
      setColaboradoresSugeridos([]);
      return;
    }

    const sugestoes = colaboradores.filter(col =>
      col.label.toLowerCase().includes(texto.toLowerCase()),
    );
    setColaboradoresSugeridos(sugestoes.slice(0, 5));
  };

  // Selecionar colaborador
  const selecionarColaborador = (colaborador: any) => {
    setBuscaColaborador('');
    setColaboradorSelecionadoId(colaborador.id);
    setColaboradoresSugeridos([]);
  };

  // Item selecionado
  const itemAtual = itens.find(item => item.id.toString() === itemSelecionado);

  // Colaborador selecionado
  const colaboradorAtual = colaboradores.find(
    col => col.id === colaboradorSelecionadoId,
  );

  // Salvar cautelas
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

      await criarCautelas(cautelasParaSalvar);

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

  // Criar cautela
  function handleCriarCautela() {
    if (!itemSelecionado || !colaboradorSelecionadoId || !quantidade.trim()) {
      alert('Preencha todos os campos antes de criar a cautela!');
      return;
    }

    const novaCautela: Cautela = {
      id: Date.now().toString(),
      nome: colaboradorAtual?.label || '',
      descricao: itemAtual?.label || '',
      quantidade: quantidade,
      data: data,
      itemId: itemSelecionado,
      colaboradorId: colaboradorSelecionadoId,
    };

    setCautelasList(prev => [...prev, novaCautela]);

    // Limpar campos
    setBuscaItem('');
    setBuscaColaborador('');
    setQuantidade('');
    setItemSelecionado('');
    setColaboradorSelecionadoId(null);
    setItensSugeridos([]);
    setColaboradoresSugeridos([]);
  }

  function handleRemoverCautela(id: string) {
    setCautelasList(prev => prev.filter(cautela => cautela.id !== id));
  }

  if (isLoadingData) {
    return (
      <Screen>
        <SkeletonCautelaForm />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Buscar Item */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Item *</Text>
              <Input
                placeholder="Digite para buscar item..."
                icon={Package}
                value={buscaItem}
                onChangeText={buscarItensSugeridos}
              />

              {/* Sugestões de Itens */}
              {itensSugeridos.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList}>
                    {itensSugeridos.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => selecionarItem(item)}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>{item.label}</Text>
                        <Text style={styles.suggestionType}>
                          {item.tipo === 'patrimonio'
                            ? 'Patrimônio'
                            : 'Ferramenta'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Item Selecionado */}
              {itemAtual && (
                <View style={styles.selectedCard}>
                  <Text style={styles.selectedTitle}>{itemAtual.label}</Text>
                  <Text style={styles.selectedType}>
                    Tipo:{' '}
                    {itemAtual.tipo === 'patrimonio'
                      ? 'Patrimônio'
                      : 'Ferramenta'}
                  </Text>
                </View>
              )}
            </View>

            {/* Quantidade */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantidade *</Text>
              <Input
                placeholder="Quantidade"
                icon={Hash}
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
                editable={quantidadeHabilitada}
              />
            </View>

            {/* Buscar Colaborador */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Colaborador *</Text>
              <Input
                placeholder="Digite para buscar colaborador..."
                icon={User}
                value={buscaColaborador}
                onChangeText={buscarColaboradoresSugeridos}
              />

              {/* Sugestões de Colaboradores */}
              {colaboradoresSugeridos.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList}>
                    {colaboradoresSugeridos.map(colaborador => (
                      <TouchableOpacity
                        key={colaborador.id}
                        onPress={() => selecionarColaborador(colaborador)}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>
                          {colaborador.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Colaborador Selecionado */}
              {colaboradorAtual && (
                <View style={styles.selectedCard}>
                  <Text style={styles.selectedTitle}>
                    {colaboradorAtual.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Data */}
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Data da Retirada: </Text>
              <Text style={styles.dataValue}>{data}</Text>
            </View>

            {/* Botão Criar Cautela */}
            <TouchableOpacity
              onPress={handleCriarCautela}
              style={styles.criarButton}
            >
              <Text style={styles.criarButtonText}>+ Criar Cautela</Text>
            </TouchableOpacity>

            {/* Lista de Cautelas */}
            <View style={styles.cautelasContainer}>
              <CardCriarCautelas
                cautelas={cautelasList}
                onRemoveCautela={handleRemoverCautela}
              />
            </View>

            {/* Botão Salvar */}
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
                style={{ marginTop: 8 }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  label: {
    marginBottom: 4,
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontWeight: '600',
    color: '#19325E',
    fontSize: 14,
  },
  suggestionType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedCard: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  selectedTitle: {
    fontWeight: 'bold',
    color: '#19325E',
    fontSize: 14,
  },
  selectedType: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#19325E',
    fontWeight: 'bold',
  },
  dataValue: {
    color: '#19325EB2',
    fontSize: 15,
  },
  criarButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginVertical: 8,
  },
  criarButtonText: {
    color: '#19325E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cautelasContainer: {
    backgroundColor: '#ffffff55',
    borderRadius: 8,
    minHeight: 200,
    padding: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
});
