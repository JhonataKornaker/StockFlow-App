import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/ScreenProps';
import { atualizarPatrimonio } from '@/service/patrimonio.service';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CircleAlert, Hash, Tag, Package } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/util/toast';

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
    nomeLocadora: patrimonio.nomeLocadora || '',
    dataLocacao: patrimonio.dataLocacao || '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    const { descricao, numeroSerie, marca, modelo } = formData;

    if (!descricao.trim()) {
      showInfoToast('A descrição é obrigatória', 'Atenção');
      return;
    }

    if (!numeroSerie.trim()) {
      showInfoToast('O número de série é obrigatório', 'Atenção');
      return;
    }

    try {
      const payload: any = {
        descricao: descricao.trim(),
        numeroSerie: numeroSerie.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
      };
      if (patrimonio.locado) {
        payload.nomeLocadora = formData.nomeLocadora?.trim() || undefined;
        payload.dataLocacao = formData.dataLocacao
          ? parseDateFromBrFormat(formData.dataLocacao)
          : undefined;
      }

      await atualizarPatrimonio(patrimonio.id, payload);

      showSuccessToast('Patrimônio atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar patrimônio:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o patrimônio';
      showErrorToast(String(message), 'Erro ao atualizar');
    }
  };

  function formatDate(date: Date) {
    return date.toLocaleDateString('pt-BR');
  }

  function parseDateFromBrFormat(dateString: string): Date {
    const [day, month, year] = dateString.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
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
            {patrimonio.locado && (
              <View style={{ marginTop: 20, gap: 16 }}>
                <Input
                  placeholder="Fornecedor (Locadora)"
                  icon={CircleAlert}
                  iconColors="#FF001F80"
                  iconPosition="right"
                  value={formData.nomeLocadora}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, nomeLocadora: text }))
                  }
                />

                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Input
                    placeholder="Data da Locação"
                    icon={CircleAlert}
                    iconColors="#FF001F80"
                    iconPosition="right"
                    value={formData.dataLocacao || formatDate(new Date())}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.dataLocacao
                        ? parseDateFromBrFormat(formData.dataLocacao)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setFormData(prev => ({
                          ...prev,
                          dataLocacao: formatDate(selectedDate),
                        }));
                      }
                    }}
                    locale="pt-BR"
                  />
                )}
              </View>
            )}
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
