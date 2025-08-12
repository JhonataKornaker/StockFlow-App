import api from '@/api';
import { CriarPatrimonioDto, PatrimonioDto } from '@/dtos/patrimonioDto';

export async function createPatrimonio(patrimonio: CriarPatrimonioDto) {
  const response = await api.post('/patrimonio', patrimonio);
  return response.data;
}

export async function listarPatrimonio(): Promise<PatrimonioDto[]> {
  const response = await api.get('/patrimonio');
  return response.data;
}
