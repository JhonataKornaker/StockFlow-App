// types/Cautela.ts
export interface Ferramenta {
  id: number;
  descricao: string;
  quantidade: number;
}

export interface Patrimonio {
  id: number;
  descricao: string;
  numeroSerie: string;
}

export interface Cautela {
  descricao: string;
  quantidade: number;
  funcaoColaborador: string;
  nomeColaborador: string;
  empresaColaborador: string;
  dataCautela: string;
  ferramentas: Ferramenta[];
  patrimonios: Patrimonio[];
}
