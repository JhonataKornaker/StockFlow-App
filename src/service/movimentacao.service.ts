import api from '@/api';
import {
  MovimentacaoListaDto,
  ResumoMovimentacaoEstoque,
} from '@/dtos/movimentacaoDto';

export async function buscarResumoMovimentacao(): Promise<ResumoMovimentacaoEstoque> {
  const response = await api.get<ResumoMovimentacaoEstoque>(
    'controle-estoque/resumo-movimentacao',
  );
  return response.data;
}

export async function listarTodasMovimentacoes(): Promise<
  MovimentacaoListaDto[]
> {
  const response = await api.get<MovimentacaoListaDto[]>(
    'controle-estoque/movimentacoes-todas',
  );
  return response.data;
}
