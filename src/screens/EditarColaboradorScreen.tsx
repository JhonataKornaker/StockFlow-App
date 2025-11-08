import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { atualizarColaborador } from '@/service/colaborador.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, User, Briefcase, Building } from 'lucide-react-native';
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
  'EditarColaborador'
>;

type RouteProps = RouteProp<MainStackParamList, 'EditarColaborador'>;

export default function EditarColaborador() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { colaborador } = route.params;

  const [formData, setFormData] = useState({
    nome: colaborador.nome,
    funcao: colaborador.funcao,
    empresa: colaborador.empresa,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { nome, funcao, empresa } = formData;

    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return;
    }

    if (!funcao.trim()) {
      Alert.alert('Atenção', 'A função é obrigatória');
      return;
    }

    if (!empresa.trim()) {
      Alert.alert('Atenção', 'A empresa é obrigatória');
      return;
    }

    try {
      await atualizarColaborador(colaborador.id, formData);
      Alert.alert('Sucesso', 'Colaborador atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o colaborador');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginTop: 20, gap: 14 }}>
              <Input
                placeholder="Nome *"
                icon={CircleAlert}
                iconColors="#FF001F80"
                value={formData.nome}
                onChangeText={text => handleChange('nome', text)}
              />

              <Input
                placeholder="Função *"
                icon={Briefcase}
                iconColors="#FF001F80"
                value={formData.funcao}
                onChangeText={text => handleChange('funcao', text)}
              />

              <Input
                placeholder="Empresa *"
                icon={Building}
                iconColors="#FF001F80"
                value={formData.empresa}
                onChangeText={text => handleChange('empresa', text)}
              />
            </View>
          </ScrollView>

          {/* Botão fixo no rodapé */}

          <Button
            style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
            onPress={handleSalvar}
            title="Salvar"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
