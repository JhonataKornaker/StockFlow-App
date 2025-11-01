import api from '@/api';
import { EstoqueDto, ResumoNumerico, SaidaInsumoDto } from '@/dtos/estoqueDto';

export async function buscarResumoNumerico(): Promise<ResumoNumerico> {
  const response = await api.get<ResumoNumerico>(
    'controle-estoque/resumo-numerico',
  );
  return response.data;
}

export async function listarEstoques(): Promise<EstoqueDto[]> {
  const response = await api.get<EstoqueDto[]>('controle-estoque/listar');
  return response.data;
}

export async function cadastrarInsumoComEntrada(data: {
  descricao: string;
  unidade: string;
  quantidadeEntrada: number;
  codigo?: string;
  marca?: string;
  categoria?: string;
  observacao?: string;
  quantidadeMinima?: number;
  quantidadeMaxima?: number;
  localizacao?: string;
  fornecedor?: string;
  valorUnitario?: number;
}) {
  const response = await api.post('controle-estoque/insumos/com-entrada', data);
  return response.data;
}

export async function registrarSaidaInsumo(data: SaidaInsumoDto) {
  const response = await api.post('controle-estoque/saida', data);
  return response.data;
}
