import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import RadionComponent from '@/components/RadionComponent';
import { Screen } from '@/components/ScreenProps';
import { CriarPatrimonioDto, PatrimonioDto } from '@/dtos/patrimonioDto';
import { createPatrimonio } from '@/service/patrimonio.service';
import { theme } from '@/styles/theme';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProps = StackNavigationProp<
  MainStackParamList,
  'CadastroPatrimonio'
>;
type RouteProps = RouteProp<MainStackParamList, 'CadastroPatrimonio'>;

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

export default function CadastroPatrimonio() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const patrimonio = route.params?.patrimonio as PatrimonioDto | undefined;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEdicao = !!patrimonio;
  const [opcao, setOpcao] = useState(patrimonio?.locado ? 'sim' : 'nao');

  const [formData, setFormData] = useState({
    descricao: patrimonio?.descricao || '',
    numeroSerie: patrimonio?.numeroSerie || '',
    marca: patrimonio?.marca || '',
    modelo: patrimonio?.modelo || '',
    nomeLocadora: patrimonio?.nomeLocadora || '',
    dataLocacao: patrimonio?.dataLocacao ?? '', // ← ainda como string no input
  });

  const handleChange = (field: keyof CriarPatrimonioDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, numeroSerie, marca, modelo, nomeLocadora, dataLocacao } =
      formData;

    if (!descricao || !numeroSerie || !marca || !modelo) {
      showInfoToast('Preencha todos os campos.', 'Campos obrigatórios');
      return;
    }

    try {
      const patrimonioDto: CriarPatrimonioDto = {
        descricao,
        numeroSerie,
        marca,
        modelo,
        nomeLocadora,
        dataLocacao: dataLocacao
          ? parseDateFromBrFormat(dataLocacao)
          : undefined,
      };

      await createPatrimonio(patrimonioDto);

      setFormData({
        descricao: '',
        numeroSerie: '',
        marca: '',
        modelo: '',
        nomeLocadora: '',
        dataLocacao: formatDate(new Date()),
      });

      showSuccessToast('Patrimônio cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar patrimônio:', error);
      showErrorToast('Erro ao salvar patrimônio.', 'Erro');
    }
  };

  function parseDateFromBrFormat(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function onChangeDate(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('dataLocacao', formatDate(selectedDate));
    }
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
          placeholder="Numero De Serie"
          value={formData.numeroSerie}
          onChangeText={text => handleChange('numeroSerie', text)}
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

      <View
        style={{
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: 'bold',
            fontSize: 18,
          }}
        >
          Equipamento Alugado ?
        </Text>
        <RadionComponent
          value={opcao}
          onChange={setOpcao}
          disabled={isEdicao}
        />
      </View>

      {opcao === 'sim' && (
        <View style={{ marginTop: 20, gap: 16 }}>
          <Input
            placeholder="Fornecedor (Locadora)"
            icon={CircleAlert}
            iconColors="#FF001F80"
            iconPosition="right"
            value={formData.nomeLocadora}
            onChangeText={text => handleChange('nomeLocadora', text)}
          />

          {/* Campo Data da Locação */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              placeholder="Data da Locação"
              icon={CircleAlert}
              iconColors="#FF001F80"
              iconPosition="right"
              value={formData.dataLocacao || formatDate(new Date())}
              editable={false} // impede teclado
              pointerEvents="none"
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onChangeDate}
              locale="pt-BR"
            />
          )}
        </View>
      )}

      <Button
        onPress={handleSalvar}
        title="Salvar"
        style={{ marginTop: 'auto', marginBottom: 12, alignSelf: 'center' }}
      />
    </Screen>
  );
}
