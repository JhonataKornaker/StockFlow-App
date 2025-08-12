export type CriarPatrimonioDto = {
  descricao: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  nomeLocadora?: string;
  dataLocacao?: Date;
};

export type PatrimonioDto = {
  id: number;
  descricao: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  nomeLocadora?: string;
  dataLocacao?: string;
  locado: boolean;
};
