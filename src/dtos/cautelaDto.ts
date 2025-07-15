export type CautelaDTO = {
  id: number;
  tipo: string;
  data: string;
  entregue: boolean;
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
