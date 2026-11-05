# Changelog — internum-web

Todas as mudanças relevantes desta imagem serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue o padrão [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.0.2] - 2026-11-05

### Added

- Rodapé exibe a versão do sistema em execução, lida de
  `window.__ENV__.APP_VERSION` (injetada pelo nginx a partir de `APP_VERSION`),
  com fallback `dev` quando o env não está disponível.

### Fixed

- O ano do copyright estava fixo em 2025. Agora é calculado em runtime, então
  acompanha o ano corrente sem manutenção.

## [2.0.1] - 2026-11-05

### Changed

- Versão alinhada com a API 2.0.1, que corrige o boot do container da API
  (seed do oficial rodando como módulo). Sem alterações funcionais no
  frontend; a imagem `2.0.1` é publicada junto para manter as versões pareadas.

## [2.0.0] - 2026-11-04

### Removed

- **Breaking:** o perfil `admin` foi removido do seletor, das cores e da
  hierarquia de atribuição. A interface passa a refletir o **oficial único**:
  `oficial` atribui todos os perfis, exceto `oficial`; `suboficial` atribui
  todos, exceto `oficial` e `suboficial`.
- `isAdmin` foi removido do store de autenticação e de `useVacation`.

### Added

- Autorização baseada em permissões: rotas com `meta.permission`, menu e ações
  condicionados por `auth.can()`, diretório de colegas e telas de usuários
  reconstruídas para múltiplos perfis.
- `RoleSelector.vue`: seletor de perfis em grid, com descrição em tooltip no
  hover e no foco por teclado (`role="tooltip"` + `aria-describedby`).
- Badge **Sem perfil** em lista, diretório, detalhe e perfil.
- Modal **Alterar senha** no detalhe do usuário, exclusivo do oficial, com
  aviso de que as sessões do alvo serão encerradas.
- Validação de senha compartilhada entre cadastro, troca e reset
  (`usePasswordPolicy`).
- Headers de segurança e CSP no nginx, incluindo `server_tokens off` e
  `X-Robots-Tag`.

### Changed

- Criação de usuário por coordenação/gestão não envia `roles`: o formulário
  explica que o usuário nascerá sem perfil.
- A conta do `oficial` fica visualmente protegida: editar/excluir só aparece
  para o próprio oficial, e a página de edição redireciona quem tentar
  alterá-la.
- A troca da própria senha mantém a sessão atual; o refresh entre abas é
  serializado para evitar corrida.
- Férias, ementas e avisos passam a ser gateados por permissão em vez de
  perfil.

### Fixed

- Corrida de refresh token entre múltiplas abas.
- Botões e buscas de telas administrativas alinhados ao novo modelo de
  permissões.

## [1.4.0] - 2026-09-12

### Added

- Campos **Telefone** e **Salário Bruto** no CRUD de usuários e no perfil:
  inputs com validação em `Create`/`Update`, exibição em `Detail`, coluna
  Salário em `List` e telefone editável no perfil (`UserProfile`), via novos
  composables `usePhone` (máscara/normalização BR) e `useCurrency`
  (formatação/parsing pt-BR e JSON).

## [1.3.0] - 2026-08-20

### Added

- **Editor de conteúdo rico (TipTap)** nas ementas (`Create`/`Update`) e nos
  avisos (`Create`): toolbar com B/I/U/S, títulos H1-H3, listas, blockquote,
  code, alinhamento, link e undo/redo. Conteúdo armazenado como HTML e
  renderizado de forma sanitizada (`RichText` com DOMPurify no frontend e
  `bleach` no backend).
- Exibição de conteúdo rico em `Home`, listas de ementas/avisos e detalhe de
  aviso.

### Changed

- **Rotas renomeadas para slugs em português** (ex.: `/legal-briefs` →
  `/ementas`, `/library` → `/biblioteca`, `/vacation` → `/ferias`,
  `/users` → `/usuarios`), com subpaths `admin/` nas rotas restritas; links e
  redirecionamentos passam a usar rotas nomeadas.
- **Dropdowns do menu** (desktop) agora abrem **apenas por clique** — removida
  a abertura por hover, mantendo teclado, `Esc`, clique fora e o menu mobile.

## [1.2.1] - 2026-08-19

### Fixed

- Botão `Login` no desktop (deslogado) agora fica alinhado à direita, em vez de
  colado à logo (a barra com `justify-between` perdia o menu e sobrava um único
  filho à esquerda).
- Busca em "Meus Avisos": os botões "Buscar"/atualizar ficam sempre ao lado do
  campo de busca (inclusive em telas reduzidas, onde o input passa a ocupar a
  largura disponível).

## [1.2.0] - 2026-08-19

### Changed

- Migração completa de Bootstrap/Bootstrap Icons para **Tailwind CSS v4**
  (Vite plugin + tokens no `@theme` + classes do design system em `main.css`),
  removendo o CDN externo e o preflight de terceiros.
- **Nav reescrito** (`Nav.vue`): menus data-driven, drawer deslizante no mobile
  (Teleport + scroll lock), barra desktop com hover/click fixa, navegação por
  teclado (setas e Esc) e acessibilidade ARIA.
- Inputs e selects consolidados nas classes `input-base`/`select-base`
  (fim de ~48 strings inline duplicadas e dos `.input-base` scoped nas páginas
  de auth).

### Fixed

- Estado `disabled` de inputs/selects no modo escuro agora usa tons escuros
  (`dark:disabled:bg-slate-800`), em vez de manter fundo claro.
- Prop `ariaHidden` do `Icon` passa a aceitar `Boolean`/`String` (elimina
  warnings de prop inválida).

## [1.1.1] - 2026-08-13

### Fixed

- Link "Voltar ao login" na página de esqueci a senha agora usa a rota nomeada `Login`
  (`/auth/login`), em vez do caminho hardcoded `/login` que caía na página 404.

## [1.1.0] - 2026-08-13

### Added

- Botão "Marcar férias" em `AdminAccrualList.vue` para períodos concessivos: permite que
  Admin/Coord registre o gozo diretamente (grant normal), sem solicitação prévia, ao lado
  da venda de dias.

## [1.0.0] - 2026-08-13

### Added

- Lançamento inicial da aplicação web (Vue 3 + Vite + Pinia + Vue Router).
- Autenticação JWT com refresh automático de token (axios interceptors) e
  rotas protegidas por role (`admin`, `coord`, `user`).
- Módulos de usuários (CRUD, perfil, alteração de senha) e férias
  (solicitações, concessões, consulta por setor).
- Módulo da biblioteca (livros e empréstimos) com listagem, busca e paginação.
- Módulo de avisos (notices) com marcação de leitura e contador de não lidos.
- Módulo de pareceres jurídicos (legal briefs) com versionamento.
- Tema claro/escuro persistido em `localStorage` e sistema de toasts.
- Servido via Nginx com configuração de variáveis de ambiente em runtime
  (`env.js` injetado pelo entrypoint `40-env.sh`).
