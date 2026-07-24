export type CautelaDTO = {
  id: number;
  tipo: string;
  data: string;
  entregue: boolean;
  colaboradorId: number;
  colaborador: {
    nome: string;
    funcao: string;
    empresa: string;
  };
  ferramentas: {
    descricao: string;
    quantidade: number;
    modelo: string;
    marca: string;
  }[];
  patrimonios: {
    descricao: string;
    numeroSerie: string;
    modelo: string;
    marca: string;
  }[];
};

export type CriarCautelaDto = {
  tipo: string;
  entregue: boolean;
  colaboradorId: number;
  ferramentas?: { ferramentaId: number; quantidade: number }[];
  patrimonios?: number[];
};
