import { FerramentasDto } from '@/dtos/ferramentasDto';
import { Colaborador } from './Colaborador';
import { Ferramenta, Patrimonio } from './ListaDeItens';
import { ColaboradorDto } from '@/dtos/colaboradorDto';
import { PatrimonioDto } from '@/dtos/patrimonioDto';
import { EstoqueDto } from '@/dtos/estoqueDto';

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
  EditarColaborador: { colaborador: ColaboradorDto };
  CadastroFerramentas?: { ferramenta?: Ferramenta };
  EditarFerramenta: { ferramenta: FerramentasDto };
  EditarPatrimonio: { patrimonio: PatrimonioDto };
  EditarInsumo: { insumo: EstoqueDto };
  CadastroColaborador: undefined;
  CadastroPatrimonio?: { patrimonio?: Patrimonio };
  DetalhesColaborador: { colaborador: Colaborador };
};
