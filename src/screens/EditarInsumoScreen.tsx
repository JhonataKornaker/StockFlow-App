import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import {
  atualizarEstoqueInsumo,
  atualizarInsumo,
} from '@/service/controleEstoque.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Hash, Tag, Package } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type NavigationProps = StackNavigationProp<MainStackParamList, 'EditarInsumo'>;

type RouteProps = RouteProp<MainStackParamList, 'EditarInsumo'>;

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

export default function EditarInsumo() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { insumo } = route.params;

  const [formData, setFormData] = useState({
    descricao: insumo.insumo.descricao,
    codigo: insumo.insumo.codigo || '',
    marca: insumo.insumo.marca || '',
    unidade: insumo.insumo.unidade,
    categoria: insumo.insumo.categoria || '',
    observacao: insumo.insumo.observacao || '',
    quantidadeMinima: String(insumo.quantidadeMinima || 0),
    quantidadeMaxima: insumo.quantidadeMaxima
      ? String(insumo.quantidadeMaxima)
      : '',
    localizacao: insumo.localizacao || '',
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, unidade } = formData;

    if (!descricao.trim()) {
      Alert.alert('Atenção', 'A descrição do insumo é obrigatória');
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
      };

      await atualizarInsumo(insumo.id, payload);

      // Se houver mudança nas quantidades mínima/máxima, atualizar o estoque
      if (formData.quantidadeMinima || formData.quantidadeMaxima) {
        await atualizarEstoqueInsumo(insumo.id, {
          quantidadeMinima: formData.quantidadeMinima
            ? Number(formData.quantidadeMinima)
            : undefined,
          quantidadeMaxima: formData.quantidadeMaxima
            ? Number(formData.quantidadeMaxima)
            : undefined,
          localizacao: formData.localizacao.trim() || undefined,
        });
      }

      Alert.alert('Sucesso', 'Insumo atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Erro ao atualizar insumo:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Erro ao atualizar insumo',
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
                  <Picker.Item key={unidade} label={unidade} value={unidade} />
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
            title="Salvar Alterações"
            style={{ marginTop: 24, marginBottom: 12, alignSelf: 'center' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
