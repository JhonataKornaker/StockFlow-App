import api from '@/api';
import { HistoricoCautelaColaborador } from '@/dtos/historicoDto';

export async function buscarHistoricoCautelaColaborador(
  idColaborador: number,
): Promise<HistoricoCautelaColaborador[]> {
  const response = await api.get<HistoricoCautelaColaborador[]>(
    `historico/buscar-historico/${idColaborador}`,
  );

  return response.data;
}
