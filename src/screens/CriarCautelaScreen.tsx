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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';

interface Item {
  id: number;
  uniqueId: string; // ← NOVO: ID único combinando tipo + id
  label: string;
  tipo: string;
}

interface Cautela {
  id: string;
  nome: string;
  descricao: string;
  quantidade: string;
  data: string;
  itemId: number; // ← ID real da ferramenta/patrimônio
  tipo: string; // ← Tipo do item
  colaboradorId: number;
}

type NavigationProps = StackNavigationProp<MainStackParamList, 'Cautela'>;

const MINIMUM_LOADING_TIME = 800;

export default function CautelaScreen() {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [itens, setItens] = useState<Item[]>([]);
  const navigation = useNavigation<NavigationProps>();
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
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

        // ✅ CORREÇÃO: Criar uniqueId combinando tipo + id
        const mappedItens = listaItens.map(item => ({
          id: item.id,
          uniqueId: `${item.tipo}-${item.id}`,
          label:
            `${item.descricao} - ${item.marca} ${item.modelo}` +
            (item.tipo === 'ferramenta' ? ` • Disp: ${item.disponivel}` : ''),
          tipo: item.tipo,
          disponivel: item.disponivel, // 👈 use no RN
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
        showErrorToast('Erro ao carregar dados. Tente novamente.', 'Erro');
      } finally {
        setIsLoadingData(false);
      }
    }
    carregar();
  }, []);

  // Buscar itens sugeridos aqui
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
  const selecionarItem = (item: Item & { disponivel?: number }) => {
    if (item.tipo === 'ferramenta') {
      if ((item as any).disponivel === 0) {
        showInfoToast('Sem saldo disponível desta ferramenta.', 'Atenção');
        return;
      }
      setQuantidadeHabilitada(true);
      setQuantidade(''); // usuário digita
    } else {
      // patrimônio
      setQuantidade('1');
      setQuantidadeHabilitada(false);
    }

    setBuscaItem('');
    setItemSelecionado(item);
    setItensSugeridos([]);
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
  const itemAtual = itemSelecionado;

  // Colaborador selecionado
  const colaboradorAtual = colaboradores.find(
    col => col.id === colaboradorSelecionadoId,
  );

  // Salvar cautelas
  async function handleSalvarCautela() {
    if (cautelasList.length === 0) {
      showInfoToast('Crie uma cautela antes de salvar!', 'Atenção');
      return;
    }

    setIsSaving(true);
    const startTime = Date.now();

    try {
      // ✅ CORREÇÃO: Usar o tipo correto de cada cautela
      const cautelasParaSalvar = cautelasList.map(cautela => ({
        tipo: cautela.tipo, // ← Usa o tipo salvo na cautela
        entregue: false,
        colaboradorId: cautela.colaboradorId,
        ferramentas: cautela.tipo === 'ferramenta' ? [cautela.itemId] : [],
        patrimonios: cautela.tipo === 'patrimonio' ? [cautela.itemId] : [],
      }));

      console.log('📤 Enviando cautelas:', cautelasParaSalvar);

      await criarCautelas(cautelasParaSalvar);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      showSuccessToast(`${cautelasList.length} cautela(s) salva(s) com sucesso!`);
      setCautelasList([]);
      navigation.navigate('Inicio');
    } catch (error) {
      console.error('Erro ao salvar cautelas:', error);
      showErrorToast('Erro ao salvar cautelas. Tente novamente.', 'Erro');
    } finally {
      setIsSaving(false);
    }
  }

  // Criar cautela
  function handleCriarCautela() {
    if (!itemSelecionado || !colaboradorSelecionadoId) {
      showInfoToast('Preencha todos os campos!', 'Campos obrigatórios');
      return;
    }

    if (itemSelecionado.tipo === 'ferramenta') {
      const disponivel = (itemSelecionado as any).disponivel ?? 0;
      const qtd = Number(quantidade);
      if (!qtd || qtd <= 0) {
        showInfoToast('Informe uma quantidade válida.', 'Atenção');
        return;
      }
      if (qtd > disponivel) {
        showInfoToast(`Quantidade solicitada maior que disponível (${disponivel}).`, 'Atenção');
        return;
      }
    } else {
      // patrimônio
      if (quantidade !== '1') setQuantidade('1');
    }

    // ✅ CORREÇÃO: Salvar tipo e id real do item
    const novaCautela: Cautela = {
      id: Date.now().toString(),
      nome: colaboradorAtual?.label || '',
      descricao: itemAtual?.label || '',
      quantidade: quantidade,
      data: data,
      itemId: itemSelecionado.id, // ← ID real (número)
      tipo: itemSelecionado.tipo, // ← Tipo correto
      colaboradorId: colaboradorSelecionadoId,
    };

    console.log('➕ Criando cautela:', novaCautela);

    setCautelasList(prev => [...prev, novaCautela]);

    // Limpar campos
    setBuscaItem('');
    setBuscaColaborador('');
    setQuantidade('');
    setItemSelecionado(null);
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
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setItensSugeridos([]);
            setColaboradoresSugeridos([]);
          }}
          style={{ flex: 1 }}
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

                {/* Se não tiver item selecionado, mostra busca */}
                {!itemAtual ? (
                  <>
                    <Input
                      placeholder="Digite para buscar item..."
                      icon={Package}
                      value={buscaItem}
                      onChangeText={buscarItensSugeridos}
                    />

                    {/* Botão Ver Todos */}
                    <TouchableOpacity
                      onPress={() => setItensSugeridos(itens.slice(0, 10))}
                      style={styles.verTodosButton}
                    >
                      <Text style={styles.verTodosText}>
                        📋 Ver todos os itens
                      </Text>
                    </TouchableOpacity>

                    {/* Sugestões de Itens */}
                    {itensSugeridos.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <ScrollView
                          style={styles.suggestionsList}
                          nestedScrollEnabled={true}
                        >
                          {itensSugeridos.map((item, index) => (
                            <TouchableOpacity
                              key={`item-${item.uniqueId}-${index}`}
                              onPress={() => selecionarItem(item)}
                              style={styles.suggestionItem}
                            >
                              <Text style={styles.suggestionText}>
                                {item.label}
                              </Text>
                              <Text style={styles.suggestionType}>
                                {item.tipo === 'patrimonio'
                                  ? '🏢 Patrimônio'
                                  : '🔧 Ferramenta'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </>
                ) : (
                  /* Item Selecionado com opção de trocar */
                  <View style={styles.selectedCard}>
                    <View style={styles.selectedHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedTitle}>
                          {itemAtual.label}
                        </Text>
                        <Text style={styles.selectedType}>
                          {itemAtual.tipo === 'patrimonio'
                            ? '🏢 Patrimônio'
                            : '🔧 Ferramenta'}{' '}
                          • ID: {itemAtual.id}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setItemSelecionado(null);
                          setBuscaItem('');
                          setQuantidade('');
                          setQuantidadeHabilitada(false);
                        }}
                        style={styles.trocarButton}
                      >
                        <Text style={styles.trocarButtonText}>Trocar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Quantidade */}
              <View style={styles.inputContainer}>
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

                {/* Se não tiver colaborador selecionado, mostra busca */}
                {!colaboradorAtual ? (
                  <>
                    <Input
                      placeholder="Digite para buscar colaborador..."
                      icon={User}
                      value={buscaColaborador}
                      onChangeText={buscarColaboradoresSugeridos}
                    />

                    {/* Botão Ver Todos */}
                    <TouchableOpacity
                      onPress={() =>
                        setColaboradoresSugeridos(colaboradores.slice(0, 10))
                      }
                      style={styles.verTodosButton}
                    >
                      <Text style={styles.verTodosText}>
                        👥 Ver todos os colaboradores
                      </Text>
                    </TouchableOpacity>

                    {/* Sugestões de Colaboradores */}
                    {colaboradoresSugeridos.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <ScrollView
                          style={styles.suggestionsList}
                          nestedScrollEnabled={true}
                        >
                          {colaboradoresSugeridos.map((colaborador, index) => (
                            <TouchableOpacity
                              key={`colaborador-${colaborador.id}-${index}`}
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
                  </>
                ) : (
                  /* Colaborador Selecionado com opção de trocar */
                  <View style={styles.selectedCard}>
                    <View style={styles.selectedHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedTitle}>
                          {colaboradorAtual.label}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setColaboradorSelecionadoId(null);
                          setBuscaColaborador('');
                        }}
                        style={styles.trocarButton}
                      >
                        <Text style={styles.trocarButtonText}>Trocar</Text>
                      </TouchableOpacity>
                    </View>
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
              {/* Removido spinner para manter padrão sem ícone de carregamento */}
            </View>
          </ScrollView>
        </TouchableOpacity>
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
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  trocarButton: {
    backgroundColor: '#19325E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trocarButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verTodosButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verTodosText: {
    color: '#19325E',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
