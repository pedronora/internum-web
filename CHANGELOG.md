# Changelog — internum-web

Todas as mudanças relevantes desta imagem serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue o padrão [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
