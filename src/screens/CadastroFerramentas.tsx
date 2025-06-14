import ScreenCadastro from '@/components/ScreenCadastro';
import { CircleAlert } from 'lucide-react-native';

export default function CadastroFerramentas() {
  return (
    <ScreenCadastro
      placeholders={['Nome da Ferramenta', 'Marca', 'Modelo', 'Quantidade']}
      icons={[CircleAlert, undefined, undefined, CircleAlert]}
      iconColors={['#FF001F80', '', '', '#FF001F80']}
    ></ScreenCadastro>
  );
}
