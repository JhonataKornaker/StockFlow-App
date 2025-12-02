import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import ScreenCadastro from '@/components/ScreenCadastro';
import { Screen } from '@/components/ScreenProps';
import { CriarFerramentaDto } from '@/dtos/ferramentasDto';
import { createFerramentas } from '@/service/ferramenta.service';
import { Ferramenta } from '@/types/ListaDeItens';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SkeletonCadastroForm } from '@/components/Skeleton/SkeletonCadastroForm';

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'CadastroFerramentas'
>;

export default function CadastroFerramentas() {
  const [formData, setFormData] = useState<CriarFerramentaDto>({
    descricao: '',
    quantidade: 1,
    marca: '',
    modelo: '',
  });
  const [carregando, setCarregando] = useState(true);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const t = setTimeout(() => setCarregando(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (
    field: keyof CriarFerramentaDto,
    value: string | number,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, quantidade, marca, modelo } = formData;

    if (!descricao) {
      console.error('Preencher pelo menos a descrição da ferramenta');
      return;
    }
    try {
      await createFerramentas(formData);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
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
      <View style={{ marginTop: 20, gap: 14 }}>
        <Input
          placeholder="Descricao"
          icon={CircleAlert}
          iconColors="#FF001F80"
          value={formData.descricao}
          onChangeText={text => handleChange('descricao', text)}
        />
        <Input
          placeholder="Quantidade"
          value={String(formData.quantidade)} // ou formData.quantidade.toString()
          keyboardType="numeric"
          onChangeText={text => handleChange('quantidade', Number(text))}
        />
        <Input
          placeholder="Marca"
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
        title="Salvar"
        style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
      />
    </Screen>
  );
}
