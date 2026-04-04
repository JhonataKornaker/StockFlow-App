import api from '@/api';
import { InventarioDetalheDto, InventarioResumoDto } from '@/dtos/inventarioDto';

export async function listarInventarios(): Promise<InventarioResumoDto[]> {
  const response = await api.get<InventarioResumoDto[]>('inventario');
  return response.data;
}

export async function buscarInventario(id: number): Promise<InventarioDetalheDto> {
  const response = await api.get<InventarioDetalheDto>(`inventario/${id}`);
  return response.data;
}

export async function criarInventario(data: {
  solicitante: string;
  observacao?: string;
}): Promise<{ id: number }> {
  const response = await api.post('inventario', data);
  return response.data;
}

export async function salvarItemInventario(
  inventarioId: number,
  estoqueId: number,
  quantidadeContada: number,
): Promise<void> {
  await api.post(`inventario/${inventarioId}/itens`, { estoqueId, quantidadeContada });
}

export async function atualizarFotoInventario(
  inventarioId: number,
  fotoUrl: string,
): Promise<void> {
  await api.put(`inventario/${inventarioId}/foto`, { fotoUrl });
}

export async function finalizarInventario(inventarioId: number): Promise<void> {
  await api.put(`inventario/${inventarioId}/finalizar`);
}

export async function cancelarInventario(inventarioId: number): Promise<void> {
  await api.put(`inventario/${inventarioId}/cancelar`);
}
