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
