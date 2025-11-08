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
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

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
      Alert.alert('Atenção', 'A descrição é obrigatória');
      return;
    }

    if (!quantidade || Number(quantidade) < 0) {
      Alert.alert('Atenção', 'Informe uma quantidade válida');
      return;
    }

    try {
      await atualizarFerramenta(ferramenta.id, {
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        marca: marca.trim(),
        modelo: modelo.trim(),
      });

      Alert.alert('Sucesso', 'Ferramenta atualizada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar ferramenta:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a ferramenta');
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

          <Button
            onPress={handleSalvar}
            title="Salvar Alterações"
            style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
