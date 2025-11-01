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
