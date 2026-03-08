export interface UltimaEntrada {
  data: string;
  fornecedor: string;
  insumo: string;
  quantidade: number;
}

export interface UltimaSaida {
  data: string;
  colaborador: string;
  insumo: string;
  quantidade: number;
}

export interface ResumoMovimentacaoEstoque {
  ultimaEntrada: UltimaEntrada | null;
  ultimaSaida: UltimaSaida | null;
}

export interface MovimentacaoListaDto {
  id: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO' | 'TRANSFERENCIA';
  quantidade: number;
  data: string;
  insumo: string;
  unidade: string;
  fornecedor?: string;
  colaborador?: string;
  observacao?: string;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO' | 'TRANSFERENCIA';

export interface MovimentacaoFiltradaDto {
  id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  quantidadeAntes: number;
  quantidadeDepois: number;
  observacao?: string;
  fornecedor?: string;
  valorTotal?: number;
  criadoEm: string;
  estoque: {
    insumo: {
      descricao: string;
      unidade: string;
    };
  };
  colaborador?: {
    nome: string;
    funcao: string;
    empresa: string;
  };
  usuario: {
    nome: string;
  };
}
