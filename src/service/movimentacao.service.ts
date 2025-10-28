import api from '@/api';
import { ResumoMovimentacaoEstoque } from '@/dtos/movimentacaoDto';

export async function buscarResumoMovimentacao(): Promise<ResumoMovimentacaoEstoque> {
  const response = await api.get<ResumoMovimentacaoEstoque>(
    'controle-estoque/resumo-movimentacao',
  );
  return response.data;
}
