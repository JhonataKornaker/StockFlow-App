export interface UltimaEntrada {
  data: string;
  fornecedor: string;
  insumo: string;
}

export interface UltimaSaida {
  data: string;
  colaborador: string;
  insumo: string;
}

export interface ResumoMovimentacaoEstoque {
  ultimaEntrada: UltimaEntrada | null;
  ultimaSaida: UltimaSaida | null;
}
