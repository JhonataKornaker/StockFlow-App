import api from '@/api';
import { CriarFerramentaDto, FerramentasDto } from '@/dtos/ferramentasDto';

export async function createFerramentas(ferramenta: CriarFerramentaDto) {
  const response = await api.post('/ferramenta', ferramenta);
  return response.data;
}

export async function listarFerramentas(): Promise<FerramentasDto[]> {
  const response = await api.get('/ferramenta');
  return response.data;
}
