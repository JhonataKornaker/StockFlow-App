# StockFlow — Guia do Projeto

App mobile de controle de estoque e ferramentas para uso em campo.
Stack: Expo ~54 / React Native 0.81 / TypeScript / React Navigation.

Repositório da API: `D:\Programacao\ReactNative\StockApp\stockflow-api`

---

## Padrões de commit

- Mensagem curta e direta em português, sem tópicos ou corpo
- Prefixos: `feat:` `fix:` `refactor:` `chore:`
- Sem Co-Authored-By ou qualquer referência a ferramentas de IA

```
feat: adicionar tela de historico de cautelas
fix: corrigir quantidade exibida na cautela de ferramenta
refactor: extrair logica de agrupamento para funcao separada
```

---

## Padrões de código

- Sem comentários óbvios — só comentar o "porquê", nunca o "o quê"
- Sem `console.log` em código de produção
- Sem `any` desnecessário — tipar sempre que possível
- Tratar erros com `parseApiError` + `showErrorToast` de `@/util/toast`
- Componentes de tela exportados como `default`, helpers inline no mesmo arquivo
- Estilos sempre via `StyleSheet.create` no final do arquivo

---

## Estrutura de pastas

```
src/
  components/    componentes reutilizáveis
  dtos/          tipos de dados que vêm da API
  navigation/    rotas e menu lateral
  screens/       telas (uma por arquivo)
  service/       chamadas à API
  styles/        tema global (theme.colors.primary = #19325E)
  types/         tipos do navigator (MainStackParamList)
  util/          helpers (toast, agrupadores, etc)
```

---

## Navegação

Todas as rotas ficam em `src/types/MainStackNavigator.ts` e registradas em `src/navigation/StackRoutes.tsx`.

---

## Toast / Erros

Sempre usar:
```ts
import { parseApiError, showErrorToast, showSuccessToast, showInfoToast } from '@/util/toast';

// Em catch:
showErrorToast(parseApiError(error, 'Mensagem fallback'), 'Título');
```

---

## Tema

Cor primária navy: `#19325E` — acessível via `theme.colors.primary`.

---

<!-- Seção de padrões a expandir aos poucos -->
