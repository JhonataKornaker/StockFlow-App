import api from '@/api';
import { ColaboradorDto, CriarColaboradorDto } from '@/dtos/colaboradorDto';

export async function buscarColaboradores(): Promise<ColaboradorDto[]> {
  const response = await api.get('/colaborador');
  return response.data;
}

export async function create(colaborador: CriarColaboradorDto) {
  const response = await api.post('/colaborador', colaborador);
  return response.data;
}

export async function listarColaboradores() {
  const response = await api.get('/colaborador');
  return response.data;
}
