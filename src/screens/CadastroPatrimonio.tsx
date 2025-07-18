import { Input } from '@/components/Input';
import RadionComponent from '@/components/RadionComponent';
import ScreenCadastro from '@/components/ScreenCadastro';
import { theme } from '@/styles/theme';
import { Patrimonio } from '@/types/ListaDeItens';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function CadastroPatrimonio() {
  const route = useRoute<RouteProp<MainStackParamList, 'CadastroPatrimonio'>>();
  const patrimonio = route.params?.patrimonio;
  const [opcao, setOpcao] = useState(patrimonio ? 'sim' : 'nao');
  const isEdicao = !!patrimonio;
  const [campoAdicional, setCampoAdicional] = useState('');

  return (
    <ScreenCadastro<Patrimonio>
      placeholders={[
        'Nome do Equipamento',
        'Marca',
        'Modelo',
        'Número de Série',
      ]}
      icons={[CircleAlert, undefined, undefined, CircleAlert]}
      iconColors={['#FF001F80', '', '', '#FF001F80']}
      defaultValues={patrimonio}
      fieldKeys={[
        'numeroSerie',
        'descricao',
        'marca',
        'modelo',
        'locado',
        'dataLocacao',
      ]}
    >
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
            defaultValue={patrimonio?.locado ? 'Locadora XPTO' : ''}
          />
          <Input
            placeholder="Data da Locação"
            icon={CircleAlert}
            iconColors="#FF001F80"
            iconPosition="right"
            defaultValue={patrimonio?.dataLocacao ?? ''}
          />
        </View>
      )}
    </ScreenCadastro>
  );
}
