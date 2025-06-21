import ScreenListar from '@/components/ScreenListar';
import { Patrimonio } from '@/types/ListaDeItens';

const listaPatrimonios: Patrimonio[] = [
  {
    descricao: 'Rompedor 10Kg',
    numeroSerie: 'SN123456',
    marca: 'Makita',
    modelo: 'HR2470',
    locado: false,
    dataLocacao: undefined,
  },
  {
    descricao: 'Furadeira 13mm',
    numeroSerie: 'SN654321',
    marca: 'Bosch',
    modelo: 'GSB 13 RE',
    locado: true,
    dataLocacao: '2023-10-01',
  },
  {
    descricao: 'Serra Circular 7-1/4"',
    numeroSerie: 'SN789012',
    marca: 'DeWalt',
    modelo: 'DWE575SB',
    locado: false,
    dataLocacao: undefined,
  },
  {
    descricao: 'Parafusadeira 18V',
    numeroSerie: 'SN345678',
    marca: 'Black & Decker',
    modelo: 'BDCDE120C',
    locado: true,
    dataLocacao: '2023-10-05',
  },
  {
    descricao: 'Esmerilhadeira Angular 4-1/2"',
    numeroSerie: 'SN901234',
    marca: 'Makita',
    modelo: 'GA4530R',
    locado: false,
    dataLocacao: undefined,
  },
];

export default function Patrimonios() {
  return <ScreenListar patrimonios={listaPatrimonios} />;
}
