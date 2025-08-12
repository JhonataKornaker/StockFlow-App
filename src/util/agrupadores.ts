export function agruparPorLetra<T>(itens: T[]): {
  title: string;
  data: T[];
}[] {
  // Detecta automaticamente se tem 'nome' ou 'descricao'
  const chave = (['nome', 'descricao'].find(k => k in (itens[0] || {})) ??
    '') as keyof T;

  if (!chave || typeof itens[0]?.[chave] !== 'string') {
    return []; // Ou lançar erro, se quiser
  }

  const agrupado: Record<string, T[]> = {};

  for (const item of itens) {
    const valor = item[chave] as string;
    const letra = valor[0]?.toUpperCase() ?? '';

    if (!agrupado[letra]) {
      agrupado[letra] = [];
    }

    agrupado[letra].push(item);
  }

  return Object.keys(agrupado)
    .sort()
    .map(letra => ({
      title: letra,
      data: agrupado[letra].sort((a, b) => {
        const aVal = a[chave] as string;
        const bVal = b[chave] as string;
        return aVal.localeCompare(bVal);
      }),
    }));
}
