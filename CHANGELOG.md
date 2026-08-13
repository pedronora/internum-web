# Changelog — internum-web

Todas as mudanças relevantes desta imagem serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue o padrão [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
