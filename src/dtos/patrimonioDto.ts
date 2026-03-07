export type CriarPatrimonioDto = {
  descricao: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  nomeLocadora?: string;
  dataLocacao?: Date;
  dataDevolucao?: Date;
  comprovanteUrl?: string;
};

export type PatrimonioDto = {
  id: number;
  descricao: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  nomeLocadora?: string;
  dataLocacao?: string;
  dataDevolucao?: string;
  comprovanteUrl?: string;
  locado: boolean;
};
