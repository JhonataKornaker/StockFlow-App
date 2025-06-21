import ScreenListar from '@/components/ScreenListar';
import { Ferramenta } from '@/types/ListaDeItens';

const listaFerramentas: Ferramenta[] = [
  {
    descricao: 'Alicate de Corte',
    quantidade: 3,
    marca: 'Tramontina',
    modelo: 'TC-100',
  },
  {
    descricao: 'Martelo de Borracha',
    quantidade: 2,
    marca: 'Vonder',
    modelo: 'VB-200',
  },
  {
    descricao: 'Chave de Fenda',
    quantidade: 5,
    marca: 'Gedore',
    modelo: 'GF-10',
  },
  {
    descricao: 'Alicate Universal',
    quantidade: 4,
    marca: 'Tramontina',
    modelo: 'TU-300',
  },
  {
    descricao: 'Marreta',
    quantidade: 1,
    marca: 'Stanley',
    modelo: 'ST-700',
  },
];

export default function Ferramentas() {
  return <ScreenListar ferramentas={listaFerramentas} />;
}
