import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { atualizarPatrimonio } from '@/service/patrimonio.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Hash, Tag, Package } from 'lucide-react-native';
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
  'EditarPatrimonio'
>;

type RouteProps = RouteProp<MainStackParamList, 'EditarPatrimonio'>;

export default function EditarPatrimonio() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { patrimonio } = route.params;

  const [formData, setFormData] = useState({
    descricao: patrimonio.descricao,
    numeroSerie: patrimonio.numeroSerie,
    marca: patrimonio.marca,
    modelo: patrimonio.modelo,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, numeroSerie, marca, modelo } = formData;

    if (!descricao.trim()) {
      Alert.alert('Atenção', 'A descrição é obrigatória');
      return;
    }

    if (!numeroSerie.trim()) {
      Alert.alert('Atenção', 'O número de série é obrigatório');
      return;
    }

    try {
      await atualizarPatrimonio(patrimonio.id, {
        descricao: descricao.trim(),
        numeroSerie: numeroSerie.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
      });

      Alert.alert('Sucesso', 'Patrimônio atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar patrimônio:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o patrimônio');
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
              placeholder="Número de Série *"
              icon={Hash}
              iconColors="#FF001F80"
              value={formData.numeroSerie}
              onChangeText={text => handleChange('numeroSerie', text)}
            />

            <Input
              placeholder="Marca"
              icon={Tag}
              value={formData.marca}
              onChangeText={text => handleChange('marca', text)}
            />

            <Input
              placeholder="Modelo"
              icon={Package}
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
