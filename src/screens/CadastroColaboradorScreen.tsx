import { useState } from 'react';
import { View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { CriarColaboradorDto } from '@/dtos/colaboradorDto';
import { create } from '@/service/colaboradorService';
import Toast from 'react-native-toast-message';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Screen } from '@/components/ScreenProps';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { useNavigation } from '@react-navigation/native';

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'CadastroColaborador'
>;

export default function CadastroColaborador() {
  const [formData, setFormData] = useState<CriarColaboradorDto>({
    nome: '',
    funcao: '',
    empresa: '',
  });
  const navigation = useNavigation<NavigationProps>();

  const handleChange = (field: keyof CriarColaboradorDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { nome, funcao, empresa } = formData;

    if (!nome || !funcao || !empresa) {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha todos os campos.',
      });
      return;
    }

    try {
      await create(formData);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar colaborador.',
      });
    }
  };

  return (
    <Screen>
      <View style={{ marginTop: 20, gap: 14 }}>
        <Input
          placeholder="Nome"
          icon={CircleAlert}
          iconColors="#FF001F80"
          value={formData.nome}
          onChangeText={text => handleChange('nome', text)}
        />
        <Input
          placeholder="Função"
          value={formData.funcao}
          onChangeText={text => handleChange('funcao', text)}
        />
        <Input
          placeholder="Empresa"
          value={formData.empresa}
          onChangeText={text => handleChange('empresa', text)}
        />
      </View>

      <Button
        onPress={handleSalvar}
        title="Salvar"
        style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
      />
    </Screen>
  );
}
