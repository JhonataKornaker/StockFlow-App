import api from '@/api';
import { CautelaDTO } from '@/dtos/cautelaDto';

export async function buscarCautelas(): Promise<CautelaDTO[]> {
  const response = await api.get('/cautela');
  return response.data;
}

/*export async function criarCautelas(params:type) {
    
}*/
