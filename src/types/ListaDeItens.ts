export interface Patrimonio {
  numeroSerie: string;
  descricao: string;
  marca: string;
  modelo: string;
  locado: boolean;
  dataLocacao?: string;
}

export interface Ferramenta {
  descricao: string;
  quantidade: number;
  marca: string;
  modelo: string;
}
