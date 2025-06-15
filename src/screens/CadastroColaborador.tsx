import ScreenCadastro from '@/components/ScreenCadastro';
import { CircleAlert } from 'lucide-react-native';

export default function CadastroColaborador() {
  return (
    <ScreenCadastro
      placeholders={['Nome', 'Função', 'Empresa']}
      icons={[CircleAlert, undefined, undefined]}
      iconColors={['#FF001F80', '', '']}
    ></ScreenCadastro>
  );
}
