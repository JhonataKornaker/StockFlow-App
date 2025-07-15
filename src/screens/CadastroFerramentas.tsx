import ScreenCadastro from '@/components/ScreenCadastro';
import { Ferramenta } from '@/types/ListaDeItens';
import { MainStackParamList } from '@/types/MainStackNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CircleAlert } from 'lucide-react-native';

type CadastroFerramentasProps = RouteProp<
  MainStackParamList,
  'CadastroFerramentas'
>;

export default function CadastroFerramentas() {
  const route =
    useRoute<RouteProp<MainStackParamList, 'CadastroFerramentas'>>();
  const ferramenta = route.params?.ferramenta;

  return (
    <ScreenCadastro<Ferramenta>
      placeholders={['Nome da Ferramenta', 'Marca', 'Modelo', 'Quantidade']}
      icons={[CircleAlert, undefined, undefined, CircleAlert]}
      iconColors={['#FF001F80', '', '', '#FF001F80']}
      defaultValues={ferramenta}
      fieldKeys={['descricao', 'marca', 'modelo', 'quantidade']}
    />
  );
}
