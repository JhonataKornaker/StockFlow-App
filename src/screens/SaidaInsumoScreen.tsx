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
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SkeletonGeneric } from '@/components/Skeleton/SkeletonGeneric';
import { SkeletonCadastroForm } from '@/components/Skeleton/SkeletonCadastroForm';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';

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
    const startedAt = Date.now();
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
      showErrorToast('Não foi possível carregar os dados', 'Erro ao carregar');
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) {
        await new Promise(res => setTimeout(res, wait));
      }
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
      showInfoToast('Selecione o insumo', 'Atenção');
      return;
    }

    if (!quantidade || Number(quantidade) <= 0) {
      showInfoToast('Informe a quantidade a ser retirada', 'Atenção');
      return;
    }

    if (!colaboradorId) {
      showInfoToast('Selecione o colaborador', 'Atenção');
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

      showSuccessToast('Saída registrada com sucesso!');
      // Limpar formulário e voltar
      setFormData({
        estoqueId: '',
        quantidade: '',
        colaboradorId: '',
        observacao: '',
      });
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      showErrorToast(
        error?.response?.data?.message || 'Erro ao registrar saída',
        'Falha ao registrar saída',
      );
    }
  };

  if (carregando) {
    return (
      <Screen>
        <SkeletonCadastroForm fields={4} />
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
                    mode="dropdown"
                    dropdownIconColor="#19325E"
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 8,
                      color: '#19325E',
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
                mode="dropdown"
                dropdownIconColor="#19325E"
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  color: '#19325E',
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
