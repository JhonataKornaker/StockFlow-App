import { Colaborador } from './Colaborador';
import { Ferramenta, Patrimonio } from './ListaDeItens';

export type MainStackParamList = {
  Login: undefined;
  Inicio: undefined;
  Cautela: undefined;
  Colaboradores: undefined;
  Ferramentas: undefined;
  Patrimonios: undefined;
  Estoques: undefined;
  CadastroInsumo: undefined;
  SaidaInsumo: undefined;
  CautelasAbertas: undefined;
  MovimentacaoInsumo: undefined;
  CadastroFerramentas?: { ferramenta?: Ferramenta };
  CadastroColaborador: undefined;
  CadastroPatrimonio?: { patrimonio?: Patrimonio };
  DetalhesColaborador: { colaborador: Colaborador };
};
