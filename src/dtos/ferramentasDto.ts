export type CriarFerramentaDto = {
  descricao: string;
  quantidade: number;
  marca: string;
  modelo: string;
};

export type FerramentasDto = {
  id: number;
  descricao: string;
  quantidade: number;
  disponivel: number;
  marca: string;
  modelo: string;
};
