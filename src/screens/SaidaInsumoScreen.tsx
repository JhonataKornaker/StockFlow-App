import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { listarEstoques } from '@/service/controleEstoque.service';
import { registrarSaidaInsumo } from '@/service/controleEstoque.service';
import { listarColaboradores } from '@/service/colaborador.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, ArrowDown, User, Package } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'SaidaInsumo'>;

interface SaidaInsumoForm {
  estoqueId: string;
  quantidade: string;
  colaboradorId: string;
  observacao: string;
}

export default function SaidaInsumo() {
  const [formData, setFormData] = useState<SaidaInsumoForm>({
    estoqueId: '',
    quantidade: '',
    colaboradorId: '',
    observacao: '',
  });

  const [estoques, setEstoques] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [estoquesSugeridos, setEstoquesSugeridos] = useState<any[]>([]);

  const navigation = useNavigation<NavigationProps>();

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, []),
  );

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [estoquesData, colaboradoresData] = await Promise.all([
        listarEstoques(),
        listarColaboradores(),
      ]);
      setEstoques(estoquesData);
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (field: keyof SaidaInsumoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Se mudou o estoque, limpar sugestões
    if (field === 'estoqueId') {
      setEstoquesSugeridos([]);
    }
  };

  const buscarEstoquesSugeridos = (texto: string) => {
    if (!texto.trim()) {
      setEstoquesSugeridos([]);
      return;
    }

    const sugestoes = estoques.filter(e =>
      e.insumo.descricao.toLowerCase().includes(texto.toLowerCase()),
    );
    setEstoquesSugeridos(sugestoes.slice(0, 5)); // Máximo 5 sugestões
  };

  const selecionarEstoque = (estoque: any) => {
    setFormData(prev => ({
      ...prev,
      estoqueId: estoque.id.toString(),
    }));
    setEstoquesSugeridos([]);
  };

  const estoqueSelecionado = estoques.find(
    e => e.id.toString() === formData.estoqueId,
  );

  const handleSalvar = async () => {
    const { estoqueId, quantidade, colaboradorId } = formData;

    // Validações
    if (!estoqueId) {
      Alert.alert('Atenção', 'Selecione o insumo');
      return;
    }

    if (!quantidade || Number(quantidade) <= 0) {
      Alert.alert('Atenção', 'Informe a quantidade a ser retirada');
      return;
    }

    if (!colaboradorId) {
      Alert.alert('Atenção', 'Selecione o colaborador');
      return;
    }

    try {
      const payload = {
        estoqueId: Number(estoqueId),
        quantidade: Number(quantidade),
        colaboradorId: Number(colaboradorId),
        observacao: formData.observacao.trim() || undefined,
      };

      await registrarSaidaInsumo(payload);

      Alert.alert('Sucesso', 'Saída registrada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            // Limpar formulário
            setFormData({
              estoqueId: '',
              quantidade: '',
              colaboradorId: '',
              observacao: '',
            });
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Erro ao registrar saída',
      );
    }
  };

  if (carregando) {
    return (
      <Screen
        style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
      >
        <ActivityIndicator size="large" color="#19325E" />
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
          <View style={{ gap: 14 }}>
            {/* Cabeçalho */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            ></View>

            {/* Buscar Insumo */}
            <View>
              <Text
                style={{
                  marginBottom: 4,
                  color: '#666',
                  fontWeight: '600',
                }}
              >
                Insumo *
              </Text>
              <Input
                placeholder="Digite para buscar o insumo..."
                icon={Package}
                iconColors="#FF001F80"
                onChangeText={buscarEstoquesSugeridos}
              />

              {/* Sugestões de Insumos */}
              {estoquesSugeridos.length > 0 && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    maxHeight: 200,
                  }}
                >
                  <ScrollView>
                    {estoquesSugeridos.map(estoque => (
                      <TouchableOpacity
                        key={estoque.id}
                        onPress={() => selecionarEstoque(estoque)}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f3f4f6',
                        }}
                      >
                        <Text style={{ fontWeight: '600', color: '#19325E' }}>
                          {estoque.insumo.descricao}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                          Disponível: {estoque.quantidadeAtual}{' '}
                          {estoque.insumo.unidade}
                          {estoque.localizacao &&
                            ` | Local: ${estoque.localizacao}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Insumo Selecionado */}
              {estoqueSelecionado && (
                <View
                  style={{
                    backgroundColor: '#f0f9ff',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: '#bfdbfe',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: '#19325E',
                      fontSize: 16,
                    }}
                  >
                    {estoqueSelecionado.insumo.descricao}
                  </Text>
                  <Text style={{ color: '#666', marginTop: 4 }}>
                    Disponível: {estoqueSelecionado.quantidadeAtual}{' '}
                    {estoqueSelecionado.insumo.unidade}
                  </Text>
                  {estoqueSelecionado.estoqueBaixo && (
                    <Text
                      style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}
                    >
                      ⚠️ Estoque baixo (mínimo:{' '}
                      {estoqueSelecionado.quantidadeMinima})
                    </Text>
                  )}
                </View>
              )}

              {/* Ou selecionar via Picker */}
              {!estoqueSelecionado && estoques.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 4, color: '#666' }}>
                    Ou selecione da lista:
                  </Text>
                  <Picker
                    selectedValue={formData.estoqueId}
                    onValueChange={value => handleChange('estoqueId', value)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 8,
                    }}
                  >
                    <Picker.Item label="Selecione um insumo" value="" />
                    {estoques.map(estoque => (
                      <Picker.Item
                        key={estoque.id}
                        label={`${estoque.insumo.descricao} (${estoque.quantidadeAtual} ${estoque.insumo.unidade})`}
                        value={estoque.id.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Quantidade */}
            <Input
              placeholder="Quantidade a Retirar *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              value={formData.quantidade}
              keyboardType="numeric"
              onChangeText={text => handleChange('quantidade', text)}
            />

            {/* Colaborador */}
            <View>
              <Text
                style={{
                  marginBottom: 4,
                  color: '#666',
                  fontWeight: '600',
                }}
              >
                Colaborador *
              </Text>
              <Picker
                selectedValue={formData.colaboradorId}
                onValueChange={value => handleChange('colaboradorId', value)}
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                }}
              >
                <Picker.Item label="Selecione o colaborador" value="" />
                {colaboradores.map(colaborador => (
                  <Picker.Item
                    key={colaborador.id}
                    label={`${colaborador.nome} - ${colaborador.funcao}`}
                    value={colaborador.id.toString()}
                  />
                ))}
              </Picker>
            </View>

            {/* Observação */}
            <Input
              placeholder="Observação (opcional)"
              value={formData.observacao}
              onChangeText={text => handleChange('observacao', text)}
              multiline
              numberOfLines={3}
            />

            {/* Informação de Ajuda */}
            <View
              style={{
                backgroundColor: '#fef3c7',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#fbbf24',
              }}
            >
              <Text style={{ fontSize: 12, color: '#92400e' }}>
                💡 Esta operação irá reduzir o estoque do insumo selecionado e
                registrar a retirada para o colaborador escolhido.
              </Text>
            </View>
          </View>

          <Button
            onPress={handleSalvar}
            title="Registrar Saída"
            style={{ marginTop: 24, marginBottom: 12, alignSelf: 'center' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
