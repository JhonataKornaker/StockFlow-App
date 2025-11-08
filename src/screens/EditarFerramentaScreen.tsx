import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { atualizarFerramenta } from '@/service/ferramenta.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Package, Tag } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'EditarFerramenta'
>;

type RouteProps = RouteProp<MainStackParamList, 'EditarFerramenta'>;

export default function EditarFerramenta() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { ferramenta } = route.params;

  const [formData, setFormData] = useState({
    descricao: ferramenta.descricao,
    quantidade: String(ferramenta.quantidade),
    marca: ferramenta.marca,
    modelo: ferramenta.modelo,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, quantidade, marca, modelo } = formData;

    if (!descricao.trim()) {
      showInfoToast('A descrição é obrigatória', 'Atenção');
      return;
    }

    if (!quantidade || Number(quantidade) < 0) {
      showInfoToast('Informe uma quantidade válida', 'Atenção');
      return;
    }

    try {
      await atualizarFerramenta(ferramenta.id, {
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        marca: marca.trim(),
        modelo: modelo.trim(),
      });

      showSuccessToast('Ferramenta atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar ferramenta:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a ferramenta';
      showErrorToast(String(message), 'Erro ao atualizar');
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
            <Input
              placeholder="Descrição *"
              icon={CircleAlert}
              iconColors="#FF001F80"
              value={formData.descricao}
              onChangeText={text => handleChange('descricao', text)}
            />

            <Input
              placeholder="Quantidade *"
              icon={Package}
              iconColors="#FF001F80"
              value={formData.quantidade}
              keyboardType="numeric"
              onChangeText={text => handleChange('quantidade', text)}
            />

            <Input
              placeholder="Marca"
              icon={Tag}
              value={formData.marca}
              onChangeText={text => handleChange('marca', text)}
            />

            <Input
              placeholder="Modelo"
              value={formData.modelo}
              onChangeText={text => handleChange('modelo', text)}
            />
          </View>
        </ScrollView>
        <Button
          style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
          onPress={handleSalvar}
          title="Salvar"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
