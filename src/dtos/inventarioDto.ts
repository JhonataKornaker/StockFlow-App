export type StatusInventario = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface InventarioResumoDto {
  id: number;
  status: StatusInventario;
  solicitante: string;
  observacao?: string;
  criadoEm: string;
  finalizadoEm?: string;
  totalItens: number;
}

export interface ItemInventarioDto {
  id: number;
  estoqueId: number;
  quantidadeContada: number;
  quantidadeAnterior: number;
  diferenca: number;
  estoque: {
    insumo: {
      descricao: string;
      unidade: string;
      categoria?: string;
    };
  };
}

export interface InventarioDetalheDto {
  id: number;
  status: StatusInventario;
  solicitante: string;
  observacao?: string;
  fotoUrl?: string;
  criadoEm: string;
  finalizadoEm?: string;
  itens: ItemInventarioDto[];
}
