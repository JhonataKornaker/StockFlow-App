import api from '@/api';
import { CautelaDTO, CriarCautelaDto } from '@/dtos/cautelaDto';

export async function buscarCautelas(): Promise<CautelaDTO[]> {
  const response = await api.get('/cautela');
  return response.data;
}

export async function criarCautelas(cautela: CriarCautelaDto) {
  const response = await api.post('/cautela', cautela);
  return response.data;
}

export async function listarItens() {
  const ferramentas = await api.get('/ferramenta');
  const patrimonios = await api.get('/patrimonio');
  return [
    ...ferramentas.data.map((f: any) => ({ ...f, tipo: 'ferramenta' })),
    ...patrimonios.data.map((p: any) => ({ ...p, tipo: 'patrimonio' })),
  ];
}

export async function listarColaboradores() {
  const { data } = await api.get('/colaborador');
  console.log('Colaboradores Service: ', data);
  return data;
}
