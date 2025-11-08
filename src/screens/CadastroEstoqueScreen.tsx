import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { cadastrarInsumoComEntrada } from '@/service/controleEstoque.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Package, Hash, Tag } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'CadastroInsumo'
>;

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

const unidadesDisponiveis = [
  'UNIDADE',
  'CAIXA',
  'PACOTE',
  'QUILO',
  'METRO',
  'LITRO',
  'ROLO',
  'SACO',
];

export default function CadastroInsumo() {
  const [formData, setFormData] = useState<CadastroInsumoForm>({
    descricao: '',
    codigo: '',
    marca: '',
    unidade: 'UNIDADE',
    categoria: '',
    quantidadeMinima: '0',
    quantidadeMaxima: '',
    localizacao: '',
    quantidadeEntrada: '',
    fornecedor: '',
    valorUnitario: '',
    observacao: '',
  });

  const navigation = useNavigation<NavigationProps>();

  const handleChange = (field: keyof CadastroInsumoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, unidade, quantidadeEntrada } = formData;

    // Validações obrigatórias
    if (!descricao.trim()) {
      showInfoToast('A descrição do insumo é obrigatória', 'Atenção');
      return;
    }

    if (!quantidadeEntrada || Number(quantidadeEntrada) <= 0) {
      showInfoToast('Informe a quantidade inicial de entrada', 'Atenção');
      return;
    }

    try {
      const payload = {
        descricao: descricao.trim(),
        codigo: formData.codigo.trim() || undefined,
        marca: formData.marca.trim() || undefined,
        unidade: formData.unidade,
        categoria: formData.categoria.trim() || undefined,
        observacao: formData.observacao.trim() || undefined,
        quantidadeMinima: formData.quantidadeMinima
          ? Number(formData.quantidadeMinima)
          : undefined,
        quantidadeMaxima: formData.quantidadeMaxima
          ? Number(formData.quantidadeMaxima)
          : undefined,
        localizacao: formData.localizacao.trim() || undefined,
        quantidadeEntrada: Number(quantidadeEntrada),
        fornecedor: formData.fornecedor.trim() || undefined,
        valorUnitario: formData.valorUnitario
          ? Number(formData.valorUnitario)
          : undefined,
      };

      await cadastrarInsumoComEntrada(payload);

      showSuccessToast('Insumo cadastrado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao cadastrar insumo:', error);
      showErrorToast(
        error?.response?.data?.message || 'Erro ao cadastrar insumo',
        'Erro ao cadastrar',
      );
    }
  };

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
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', color: '#19325E' }}
            >
              Dados do Insumo
            </Text>

            <Input
              placeholder="Descrição *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              value={formData.descricao}
              onChangeText={text => handleChange('descricao', text)}
            />

            <Input
              placeholder="Código (opcional)"
              icon={Hash}
              value={formData.codigo}
              onChangeText={text => handleChange('codigo', text)}
            />

            <Input
              placeholder="Marca (opcional)"
              icon={Tag}
              value={formData.marca}
              onChangeText={text => handleChange('marca', text)}
            />

            <View style={{ marginVertical: 8 }}>
              <Text style={{ marginBottom: 4, color: '#666' }}>
                Unidade de Medida *
              </Text>
              <Picker
                selectedValue={formData.unidade}
                onValueChange={value => handleChange('unidade', value)}
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                }}
              >
                {unidadesDisponiveis.map(unidade => (
                  <Picker.Item
                    key={unidade}
                    label={unidade}
                    value={unidade}
                    color="#000000"
                  />
                ))}
              </Picker>
            </View>

            <Input
              placeholder="Categoria (opcional)"
              value={formData.categoria}
              onChangeText={text => handleChange('categoria', text)}
            />

            <Input
              placeholder="Localização (opcional)"
              icon={Package}
              value={formData.localizacao}
              onChangeText={text => handleChange('localizacao', text)}
            />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Input
                placeholder="Qtd Mínima"
                value={formData.quantidadeMinima}
                keyboardType="numeric"
                onChangeText={text => handleChange('quantidadeMinima', text)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="Qtd Máxima"
                value={formData.quantidadeMaxima}
                keyboardType="numeric"
                onChangeText={text => handleChange('quantidadeMaxima', text)}
                style={{ flex: 1 }}
              />
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#19325E',
                marginTop: 16,
              }}
            >
              Entrada Inicial
            </Text>

            <Input
              placeholder="Quantidade de Entrada *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              value={formData.quantidadeEntrada}
              keyboardType="numeric"
              onChangeText={text => handleChange('quantidadeEntrada', text)}
            />

            <Input
              placeholder="Fornecedor (opcional)"
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
              value={formData.observacao}
              onChangeText={text => handleChange('observacao', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            onPress={handleSalvar}
            title="Salvar Insumo"
            style={{ marginTop: 24, marginBottom: 12, alignSelf: 'center' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
