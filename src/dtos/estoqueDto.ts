export interface ResumoNumerico {
  totalEntradas: number;
  totalSaidas: number;
  cautelasAbertas: number;
}

export interface EstoqueDto {
  id: number;
  insumo: {
    id: number;
    descricao: string;
    codigo?: string;
    marca?: string;
    unidade: string;
    categoria?: string;
    observacao?: string;
  };
  quantidadeAtual: number;
  quantidadeMinima: number;
  quantidadeMaxima?: number;
  localizacao?: string;
  estoqueBaixo: boolean;
}

export interface SaidaInsumoDto {
  estoqueId: number;
  quantidade: number;
  colaboradorId: number;
  observacao?: string;
}
