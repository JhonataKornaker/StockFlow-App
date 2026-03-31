import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { SelectPicker } from '@/components/SelectPicker';
import { cadastrarInsumoComEntrada } from '@/service/controleEstoque.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Package, Hash, Tag, Trash2, ListOrdered } from 'lucide-react-native';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';
import { SkeletonCadastroForm } from '@/components/Skeleton/SkeletonCadastroForm';

type NavigationProps = StackNavigationProp<MainStackParamList, 'CadastroInsumo'>;

interface CadastroInsumoForm {
  descricao: string;
  codigo: string;
  marca: string;
  unidade: string;
  categoria: string;
  quantidadeMinima: string;
  quantidadeMaxima: string;
  localizacao: string;
  quantidadeEntrada: string;
  fornecedor: string;
  valorUnitario: string;
  observacao: string;
}

interface InsumoNaFila {
  id: number;
  descricao: string;
  marca: string;
  categoria: string;
  unidade: string;
  quantidadeEntrada: number;
  payload: object;
}

interface FormErros {
  descricao?: string;
  quantidadeEntrada?: string;
}

const FORM_VAZIO: CadastroInsumoForm = {
  descricao: '',
  codigo: '',
  marca: '',
  unidade: 'UNIDADE',
  categoria: '',
  quantidadeMinima: '',
  quantidadeMaxima: '',
  localizacao: '',
  quantidadeEntrada: '',
  fornecedor: '',
  valorUnitario: '',
  observacao: '',
};

const unidadesDisponiveis = [
  'UNIDADE', 'CAIXA', 'PACOTE', 'QUILO', 'METRO', 'LITRO', 'ROLO', 'SACO',
];

export default function CadastroInsumo() {
  const [formData, setFormData] = useState<CadastroInsumoForm>(FORM_VAZIO);
  const [erros, setErros] = useState<FormErros>({});
  const [fila, setFila] = useState<InsumoNaFila[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [modalFilaVisivel, setModalFilaVisivel] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const t = setTimeout(() => setCarregando(false), 300);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        fila.length > 0 ? (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => setModalFilaVisivel(true)}
          >
            <ListOrdered size={22} color="#B0C4DC" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fila.length}</Text>
            </View>
          </TouchableOpacity>
        ) : null,
    });
  }, [fila.length, navigation]);

  const handleChange = (field: keyof CadastroInsumoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in erros) {
      setErros(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const buildPayload = () => ({
    descricao: formData.descricao.trim(),
    codigo: formData.codigo.trim() || undefined,
    marca: formData.marca.trim() || undefined,
    unidade: formData.unidade,
    categoria: formData.categoria.trim() || undefined,
    observacao: formData.observacao.trim() || undefined,
    quantidadeMinima: formData.quantidadeMinima ? Number(formData.quantidadeMinima) : undefined,
    localizacao: formData.localizacao.trim() || undefined,
    quantidadeEntrada: Number(formData.quantidadeEntrada),
    fornecedor: formData.fornecedor.trim() || undefined,
    valorUnitario: formData.valorUnitario ? Number(formData.valorUnitario) : undefined,
  });

  const validar = () => {
    const novosErros: FormErros = {};
    if (!formData.descricao.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }
    if (!formData.quantidadeEntrada || Number(formData.quantidadeEntrada) <= 0) {
      novosErros.quantidadeEntrada = 'Informe uma quantidade maior que zero';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleAdicionarNaFila = () => {
    if (!validar()) return;

    const novoItem: InsumoNaFila = {
      id: Date.now(),
      descricao: formData.descricao.trim(),
      marca: formData.marca.trim(),
      categoria: formData.categoria.trim(),
      unidade: formData.unidade,
      quantidadeEntrada: Number(formData.quantidadeEntrada),
      payload: buildPayload(),
    };

    setFila(prev => [...prev, novoItem]);
    setFormData(FORM_VAZIO);
    setErros({});
    showInfoToast(`"${novoItem.descricao}" adicionado à fila`, 'Na fila');
  };

  const handleRemoverDaFila = (id: number) => {
    setFila(prev => prev.filter(item => item.id !== id));
  };

  const handleSalvarTodos = async () => {
    if (fila.length === 0) return;

    setSalvando(true);
    const falhas: string[] = [];

    for (const item of fila) {
      try {
        await cadastrarInsumoComEntrada(item.payload as any);
      } catch {
        falhas.push(item.descricao);
      }
    }

    setSalvando(false);

    if (falhas.length === 0) {
      showSuccessToast(`${fila.length} insumo(s) cadastrado(s) com sucesso!`);
      navigation.goBack();
    } else if (falhas.length < fila.length) {
      const salvos = fila.length - falhas.length;
      showErrorToast(`${salvos} salvo(s). Falha: ${falhas.join(', ')}`, 'Salvo parcialmente');
      setFila(prev => prev.filter(i => falhas.includes(i.descricao)));
    } else {
      showErrorToast('Nenhum insumo foi salvo. Verifique sua conexão.', 'Erro');
    }
  };

  const handleSalvarUnico = async () => {
    if (!validar()) return;

    setSalvando(true);
    try {
      await cadastrarInsumoComEntrada(buildPayload() as any);
      showSuccessToast('Insumo cadastrado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.message || 'Erro ao cadastrar insumo',
        'Erro ao cadastrar',
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <Screen>
        <SkeletonCadastroForm fields={6} />
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
          <View style={{ marginTop: 20, gap: 14 }}>
            <Input
              placeholder="Descrição *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              autoCapitalize="words"
              value={formData.descricao}
              onChangeText={text => handleChange('descricao', text)}
              errorMessage={erros.descricao}
            />

            <Input
              placeholder="Código (opcional)"
              icon={Hash}
              autoCapitalize="characters"
              value={formData.codigo}
              onChangeText={text => handleChange('codigo', text)}
            />

            <Input
              placeholder="Marca (opcional)"
              icon={Tag}
              autoCapitalize="words"
              value={formData.marca}
              onChangeText={text => handleChange('marca', text)}
            />

            <SelectPicker
              value={formData.unidade}
              options={unidadesDisponiveis}
              onChange={value => handleChange('unidade', value)}
            />

            <Input
              placeholder="Categoria (opcional)"
              autoCapitalize="words"
              value={formData.categoria}
              onChangeText={text => handleChange('categoria', text)}
            />

            <Input
              placeholder="Localização (opcional)"
              icon={Package}
              autoCapitalize="words"
              value={formData.localizacao}
              onChangeText={text => handleChange('localizacao', text)}
            />

            <Input
              placeholder="Alerta de estoque mínimo (opcional)"
              value={formData.quantidadeMinima}
              keyboardType="numeric"
              onChangeText={text => handleChange('quantidadeMinima', text)}
            />

            <Input
              placeholder="Quantidade de Entrada *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              value={formData.quantidadeEntrada}
              keyboardType="numeric"
              onChangeText={text => handleChange('quantidadeEntrada', text)}
              errorMessage={erros.quantidadeEntrada}
            />

            <Input
              placeholder="Fornecedor (opcional)"
              autoCapitalize="words"
              value={formData.fornecedor}
              onChangeText={text => handleChange('fornecedor', text)}
            />

            <Input
              placeholder="Valor Unitário (opcional)"
              value={formData.valorUnitario}
              keyboardType="decimal-pad"
              onChangeText={text => handleChange('valorUnitario', text)}
            />

            <Input
              placeholder="Observação (opcional)"
              autoCapitalize="sentences"
              value={formData.observacao}
              onChangeText={text => handleChange('observacao', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={{ marginTop: 24, gap: 10, alignItems: 'center' }}>
            <Button
              onPress={handleAdicionarNaFila}
              title="Adicionar"
              style={{ marginBottom: 0 }}
              disabled={salvando}
            />
            <Button
              onPress={handleSalvarUnico}
              title="Salvar apenas este"
              style={{ marginBottom: 12 }}
              disabled={salvando}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal da fila */}
      <Modal
        visible={modalFilaVisivel}
        animationType="fade"
        transparent
        onRequestClose={() => setModalFilaVisivel(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalFilaVisivel(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Itens para cadastrar</Text>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>{fila.length}</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {fila.map(item => (
                <View key={item.id} style={styles.filaCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.filaCardNome}>{item.descricao}</Text>
                    <Text style={styles.filaCardSub}>
                      {item.quantidadeEntrada} {item.unidade}
                      {item.marca ? ` · ${item.marca}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.filaCardRemover}
                    onPress={() => handleRemoverDaFila(item.id)}
                  >
                    <Trash2 size={18} color="#CC0000" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              {salvando ? (
                <ActivityIndicator color="#162B4D" size="small" />
              ) : (
                <Button onPress={handleSalvarTodos} title={`Salvar todos (${fila.length})`} />
              )}
              <TouchableOpacity onPress={() => setModalFilaVisivel(false)}>
                <Text style={styles.modalFechar}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#19325E',
    marginTop: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#CC0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#162B4D',
  },
  modalBadge: {
    backgroundColor: '#162B4D',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  modalBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalFooter: {
    marginTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  modalFechar: {
    fontSize: 14,
    color: '#888',
    paddingVertical: 4,
  },
  filaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  filaCardNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#162B4D',
  },
  filaCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filaCardRemover: {
    padding: 4,
  },
});
