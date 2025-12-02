# StockFlow – Controle de Almoxarifado de Obras

Aplicativo mobile desenvolvido para resolver um problema real enfrentado por almoxarifes de obra: o controle de estoque feito em papel, sujeito a erros, perda de informações e retrabalho. Com base na experiência pessoal do autor como almoxarife, o StockFlow digitaliza processos de movimentação, cautelas e cadastros, oferecendo um fluxo claro, rápido e confiável — tanto online quanto offline.

## Sumário

- Introdução
- Funcionalidades
- Tecnologias
- Arquitetura e organização
- Instalação e execução
- Variáveis de ambiente
- Build Android (APK/AAB)
- Capturas e UX
- Repositório

## Introdução

- Objetivo: substituir controles manuais por um app simples e eficiente para o dia a dia de obra.
- Benefícios: menos erros, rastreabilidade de movimentações, visibilidade de estoque, cautelas organizadas e integração futura com sistemas.

## Funcionalidades

- Autenticação com tela de login e feedback de carregamento.
- Dashboard com skeleton dedicado e cabeçalho consistente.
- Cadastros: colaboradores, insumos/estoque, ferramentas, patrimônios.
- Movimentações: entrada/saída de insumos e histórico.
- Cautelas: criação e acompanhamento de cautelas abertas.
- Pesquisa, filtros e listagens por tela.
- Splash screen com animação de logo e spinner.
- Sincronização e detecção de rede (online/offline) para uso resiliente.

## Tecnologias

- `React Native 0.81` e `Expo SDK 54`.
- Navegação: `@react-navigation` (stack/drawer).
- UI: `react-native-paper`, `react-native-vector-icons`.
- Animações: `react-native-reanimated`, `Animated` API.
- Estado/armazenamento: `@react-native-async-storage/async-storage`.
- Rede e API: `axios`, `@react-native-community/netinfo`.
- Build: `eas-cli` (EAS Build), perfis configurados em `eas.json`.

## Arquitetura e organização

Estrutura principal do projeto:

- `App.tsx` e `index.ts`: bootstrap do app.
- `assets/`: ícones, imagens e splash.
- `src/navigation/`: rotas, drawer, stacks e fluxo de autenticação.
- `src/screens/`: telas (Login, Início, Estoque, Ferramentas, Patrimônios, etc.).
- `src/components/`: componentes reutilizáveis (Button, Input, Skeleton, Cards).
- `src/context/`: `AuthContext` e `SyncContext`.
- `src/service/`: serviços de API e sincronização.
- `src/config/`: configuração de ambiente.
- `src/styles/`: tema padrão.
- `src/dtos/` e `src/types/`: contratos de dados e tipos do app.
- `src/util/`: utilitários e helpers.

Pontos de navegação importantes:

- `src/navigation/AppNavigation.tsx`: container de navegação e gate de Splash.
- `src/navigation/Routes.tsx`: alterna entre rotas autenticadas (`AppDrawer`) e não autenticadas (`AuthRoutes`).

## Instalação e execução

Pré-requisitos:

- Node.js 18+ e npm.
- `expo-cli` e `eas-cli` instalados globalmente (opcional para build):
  - `npm i -g expo-cli eas-cli`

Passos:

1. Clone o repositório:
   - `git clone https://github.com/JhonataKornaker/StockFlow-App.git`
   - `cd StockFlow-App`
2. Instale as dependências:
   - `npm install`
3. Configure o `.env` (veja a seção abaixo).
4. Execute em desenvolvimento:
   - `npm run start` (abre o menu do Expo)
   - `npm run android` (abre direto no emulador/dispositivo Android)
   - `npm run web` (modo web via React Native Web)

## Variáveis de ambiente

Defina o arquivo `.env` na raiz com:

```
API_BASE_URL=https://sua-api.exemplo.com
```

O app lê essa variável via `src/config/env.ts`.

## Build Android (APK/AAB)

Este projeto já possui perfis no `eas.json` para gerar tanto APK quanto AAB.

Perfis disponíveis:

- `apk`: gera um APK instalável diretamente.
- `production`: gera um AAB (formato recomendado para Play Store).

Passos para gerar APK (distribuição interna/testes):

1. Instale e faça login no EAS:
   - `npm i -g eas-cli`
   - `eas login`
2. Execute o build APK:
   - `eas build -p android --profile apk`
3. Acompanhe o link do build no terminal e baixe o artefato `.apk` ao final.

Passos para gerar AAB (publicação na Play Store):

1. `eas login`
2. `eas build -p android --profile production`
3. Após o build, você pode enviar com:
   - `eas submit -p android --latest`

Observações:

- Em primeiro build, o EAS solicitará configuração de credenciais (keystore). Siga o fluxo interativo.
- Para build local, é possível usar `eas build --local`, mas requer SDK/NDK e ambiente Android configurado.

## Capturas e UX

- Splash com logo animado (`assets/img_login.png`) e spinner.
- Login com spinner e feedback visual durante autenticação.
- Skeletons de carregamento no dashboard (Início) para transições mais suaves.

Exemplos (imagens na pasta `assets/`):

- `assets/img_login.png`
- `assets/img_title.png`
- `assets/img_movimentacao.png`

## Repositório

- GitHub: `https://github.com/JhonataKornaker/StockFlow-App.git`

---

Feito para tornar o trabalho do almoxarife mais simples, confiável e produtivo. Caso queira contribuir, abra uma issue ou envie um pull request com melhorias.
