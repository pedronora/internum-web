# AGENTS.md — Internum Web Frontend Architecture & AI Agent Specification

> This document defines the architecture, design principles, and technical specification for AI agents operating within the Internum Web codebase (Vue 3 + Vite + Pinia + Vue Router). It serves as a contract for both human and AI contributors.

---

## 1. Project Overview

| Aspect               | Detail                                                     |
| -------------------- | ---------------------------------------------------------- |
| **Framework**        | Vue 3 (Composition API, `<script setup>`)                  |
| **Build Tool**       | Vite 7                                                     |
| **State Management** | Pinia 3 (stores in `src/stores/`)                          |
| **Routing**          | Vue Router 4 (guarded by role/permission)                  |
| **HTTP Client**      | Axios with interceptors (auto token refresh)               |
| **UI Library**       | Tailwind CSS 4 (utility-first, sem preflight de terceiros) |
| **Validation**       | Vuelidate + Yup                                            |
| **Testing**          | Vitest (unit/integration)                                  |
| **Linting**          | ESLint (flat config) + Prettier                            |
| **Package Manager**  | npm (lockfile committed)                                   |

---

## 2. Directory Structure & Conventions

```
src/
├── api.js                 # Axios instance + interceptors (single source of truth for HTTP)
├── main.js                # App bootstrap (Pinia, Router, Tailwind, auth init)
├── App.vue                # Root layout: Nav + main + Toasts + Footer
├── router/
│   └── index.js           # Route definitions + global navigation guards
├── stores/
│   ├── auth.js            # Auth state (token, user, permissions, initFromStorage)
│   └── notices.js         # Notices store (unread count, etc.)
├── services/
│   ├── *.services.js      # Domain services (Auth, Books, Users, Loans, Notices, LegalBriefs)
│   └── __tests__/         # Vitest specs (mock api.js via vi.hoisted)
├── composables/
│   ├── useToast.js        # Global toast system (reactive store + Promise-based confirm)
│   ├── useTheme.js        # Dark/light mode (localStorage + CSS class on <html>)
│   ├── useDate.js         # Date formatting utilities
│   └── useCPF.js          # CPF validation/formatting
├── components/
│   ├── Nav.vue            # Top navbar (role-based menus, user dropdown, theme toggle)
│   ├── Footer.vue         # Static footer
│   ├── Toasts.vue         # Renders toastStore toasts (Tailwind toasts)
│   ├── Icon.vue           # Ícones SVG inline (mapa em iconPaths.js)
│   ├── BaseSpinner.vue    # Loading spinner
│   ├── BaseBadge.vue      # Badge (color: slate|dark|light|primary|success|warning|danger|info)
│   ├── BasePagination.vue # Paginação (variant: simple|pages; emite prev/next/go)
│   ├── BaseModal.vue      # Modal com Teleport (tone: default|success|danger; slots header/default/footer)
│   ├── TiptapEditor.vue   # Editor de conteúdo rico (TipTap; emite HTML sanitizado)
│   └── RichText.vue       # Renderização de HTML sanitizado (DOMPurify) — único local permitido de v-html
├── pages/
│   ├── auth/              # Login, ForgotPassword, ResetPassword (public routes)
│   ├── legalBriefs/       # List, Create, Update (admin/coord only)
│   ├── users/             # List, Create, Detail, Update (admin/coord only)
│   ├── notices/           # List, Create, Detail, NoticesUser (role-gated)
│   ├── library/
│   │   ├── books/         # List, Create, Edit, Detail, requestList
│   │   └── loans/         # MyLoansList, AdminLoansList
│   ├── profile/           # UserProfile, UserChangePassword
│   ├── Home.vue           # Dashboard (auth required)
│   ├── RouterLayout.vue   # Wrapper for nested routes (if needed)
│   └── NotFound.vue       # 404
└── assets/
    └── main.css           # Tailwind v4, tokens do design system, classes de componentes
```

### Naming Conventions

| Type                | Convention                                    | Example                                                   |
| ------------------- | --------------------------------------------- | --------------------------------------------------------- |
| Files (components)  | PascalCase                                    | `Nav.vue`, `BookDetail.vue`                               |
| Files (composables) | camelCase, `use` prefix                       | `useToast.js`, `useTheme.js`                              |
| Files (services)    | PascalCase + `.services.js`                   | `BooksService` in `books.services.js`                     |
| Files (stores)      | camelCase                                     | `auth.js`, `notices.js`                                   |
| Files (pages)       | PascalCase                                    | `List.vue`, `Create.vue`                                  |
| Vue Components      | PascalCase                                    | `<Nav />`, `<BookDetail />`                               |
| Composables         | camelCase, `use` prefix                       | `useToast()`, `useTheme()`                                |
| Store getters       | camelCase, `is`/`has` prefix                  | `isAuthenticated`, `isAdminOrCoord`                       |
| Store actions       | camelCase, verb prefix                        | `login()`, `fetchProfile()`, `refreshToken()`             |
| Service methods     | camelCase, verb + noun                        | `list()`, `getById()`, `create()`, `update()`, `remove()` |
| CSS Classes         | Tailwind utilities + classes do design system | `.input-base`, `.btn-primary`, `.table-wrap`              |

---

## 3. Architectural Patterns

### 3.1 Service Layer (API Abstraction)

**Location:** `src/services/*.services.js`

**Pattern:**

```javascript
// books.services.js
import api from './api'

const ENDPOINT = '/api/v1/library'

export const BooksService = {
  create: (payload) =>
    api.post(ENDPOINT + '/books', payload).then((r) => r.data),
  list(offset = 0, limit = 10, search = '') {
    const params = { offset, limit }
    if (search) params.search = search
    return api.get(ENDPOINT + '/books', { params }).then((r) => r.data)
  },
  getById: (id) => api.get(ENDPOINT + '/books' + `/${id}`).then((r) => r.data),
  update: (id, payload) =>
    api.put(ENDPOINT + '/books' + `/${id}`, payload).then((r) => r.data),
  remove: (id) =>
    api.delete(ENDPOINT + '/books' + `/${id}`).then((r) => r.status === 204),
}
```

**Rules:**

- Each domain gets its own `*.services.js` file
- Export a single object (`XxxService`) with methods returning promises
- Always `.then((r) => r.data)` to unwrap axios response
- Use default params for pagination (`offset`, `limit`) and search
- Never import stores or composables in services (pure API layer)

### 3.2 State Management (Pinia Stores)

**Location:** `src/stores/*.js`

**Pattern:**

```javascript
// auth.js
import { defineStore } from 'pinia'
import { AuthService } from '@/services/auth.services'
import { UsersService } from '@/services/users.services'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'admin',
    isAdminOrCoord: (state) => ['admin', 'coord'].includes(state.user?.role),
    formattedName: (state) => {
      /* ... */
    },
  },
  actions: {
    setToken(token) {
      this.accessToken = token
    },
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    async login({ username, password }) {
      /* ... */
    },
    async fetchProfile() {
      /* ... */
    },
    async refreshToken() {
      /* ... */
    },
    async logout() {
      /* ... */
    },
    async initFromStorage() {
      /* ... */
    },
  },
})
```

**Rules:**

- One store per domain (`auth`, `notices`)
- `state()` returns a factory function (reactive)
- `getters` for derived state (permissions, formatted data)
- `actions` for async mutations (API calls + state updates)
- Persist minimal data to `localStorage` (only `user` object)
- Call `initFromStorage()` once at app bootstrap (in `main.js`)

### 3.3 HTTP Client & Token Management

**Location:** `src/services/api.js`

**Key Features:**

- Singleton axios instance with `withCredentials: true`
- Request interceptor: injects `Authorization: Bearer <token>` from `authStore`
- Response interceptor: automatic token refresh on 401 (with queue to avoid duplicate refreshes)
- `x-skip-refresh` header to opt-out (used by auth endpoints)

**Usage in Services:**

```javascript
// auth.services.js
login: (payload) =>
  api.post(ENDPOINT + '/token', new URLSearchParams(payload), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-skip-refresh': '1' },
    withCredentials: true,
  }).then((r) => r.data),
```

### 3.4 Routing & Access Control

**Location:** `src/router/index.js`

**Route Meta:**

```javascript
{
  path: '/users',
  component: () => import('@/pages/RouterLayout.vue'),
  meta: { requiresAuth: true, requiresPermission: true }, // admin/coord only
  children: [ ... ]
}
```

**Guard Logic (`router.beforeEach`):**

1. Ensure `authStore.initFromStorage()` completed
2. If no token & route not public → try `refreshToken()` → `fetchProfile()`
3. If `requiresAuth` and no token → redirect to `/auth/login?next=...`
4. If `requiresPermission` and user role not `admin`/`coord` → redirect to `Home`

**Rules:**

- Lazy-load route components: `() => import('@/pages/...')`
- Public routes: `meta.isPublicRoute: true`
- Role-gated routes: `meta.requiresPermission: true`
- Always set `meta.title` for document title

### 3.5 Composables (Reusable Logic)

**Location:** `src/composables/use*.js`

**Pattern (useToast.js):**

```javascript
import { reactive } from 'vue'

const toastStore = reactive({ toasts: [] })

export function showToast({
  title,
  message,
  type,
  timeout,
  actions,
  meta,
} = {}) {
  /* ... */
}
export function success(message, opts) {
  /* ... */
}
export function error(message, opts) {
  /* ... */
}
export function confirm(message, options) {
  /* returns Promise<boolean> */
}
export {
  toastStore,
  showToast,
  removeToast,
  success,
  error,
  info,
  warning,
  confirm,
}
```

**Rules:**

- Single responsibility per composable
- Export both named functions and default object for flexibility
- Use `reactive` for shared state (toastStore, theme)
- Return Promises for async interactions (`confirm`)

### 3.6 Page Components (Feature Views)

**Location:** `src/pages/**/*.vue`

**Pattern (List.vue):**

```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { BooksService } from '@/services/books.services'
import { success as successToast, error as errorToast, confirm as confirmToast } from '@/composables/useToast'

const books = ref([])
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const limit = ref(10)
const q = ref('')
const meta = ref({ total: null, offset: 0, limit: 10 })
const totalPages = computed(() => meta.value.total_pages || 1)

async function load() {
  loading.value = true; error.value = null
  try {
    const data = await BooksService.list((page.value - 1) * limit.value, limit.value, q.value)
    books.value = data.books || []
    meta.value = { total: data.meta?.total ?? books.value.length, /* ... */ }
  } catch (err) { error.value = err?.response?.data?.detail || err?.message || 'Erro desconhecido' }
  finally { loading.value = false }
}

async function deleteBook(id) {
  const ok = await confirmToast('Deseja excluir este livro?', { title: 'Excluir livro' })
  if (!ok) return
  try { await BooksService.remove(id); successToast('Livro excluído.'); load() }
  catch (err) { errorToast(err?.response?.data?.detail || err?.message || 'Erro ao excluir') }
}

function reload() { page.value = 1; load() }
function next() { if (meta.value.has_next) { page.value++; load() } }
function prev() { if (meta.value.has_prev) { page.value--; load() } }

onMounted(load)
</script>

<template>
  <div class="container m-4">
    <!-- Header + Filters -->
    <!-- Loading / Error / Table + Pagination -->
  </template>
```

**Rules:**

- `<script setup>` only
- Import services from `@/services/`
- Import toasts from `@/composables/useToast`
- State: `ref` for primitives/arrays, `computed` for derived
- Error handling: extract `err?.response?.data?.detail` || `err?.message`
- Pagination: `page`, `limit`, `meta` (total, has_next, has_prev)
- Search: debounce via `@keyup.enter` + button
- Delete: `confirmToast` → service → toast → reload

### 3.7 UI Components

**Location:** `src/components/*.vue`

| Component            | Responsibility                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `Nav.vue`            | Top navbar, role-based menus, user dropdown, theme toggle, unread notice badge                   |
| `Footer.vue`         | Static footer                                                                                    |
| `Toasts.vue`         | Renders `toastStore.toasts` as Tailwind toasts (auto-dismiss, actions)                           |
| `Icon.vue`           | Ícones SVG inline pelo nome (`search`, `plus-lg`, `trash`, etc.)                                 |
| `BaseSpinner.vue`    | Loading spinner reutilizável                                                                     |
| `BaseBadge.vue`      | Badge com `color` + `variant` (solid/soft)                                                       |
| `BasePagination.vue` | Paginação `simple`/`pages` a partir de `meta` (page, total_pages, has_prev, has_next)            |
| `BaseModal.vue`      | Modal com Teleport, `tone` (default/success/danger), slots header/default/footer                 |
| `TiptapEditor.vue`   | Editor de conteúdo rico (TipTap) — `v-model` emite HTML (a renderização é sempre via `RichText`) |
| `RichText.vue`       | Renderiza HTML sanitizado com DOMPurify — **único componente autorizado a usar `v-html`**        |

**Pattern:**

- Use Tailwind utilities + design-system classes (`.input-base`, `.btn-*`, `.table-wrap`) from `main.css`
- No custom CSS in `.vue` files (use `main.css`; `@apply` em `<style scoped>` exige `@reference '../../assets/main.css';`)
- Accessibility: `aria-*`, semantic HTML, keyboard navigation

---

## 4. Testing Strategy

**Location:** `src/services/__tests__/*.test.js`

**Pattern:**

```javascript
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../api', () => ({ default: mockApi }))

import { BooksService } from '../books.services'

describe('BooksService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create posts payload to books endpoint', async () => {
    const payload = { title: 'Book Title', author: 'Author' }
    mockApi.post.mockResolvedValueOnce({ data: { id: 1, ...payload } })
    const result = await BooksService.create(payload)
    expect(result).toEqual({ id: 1, ...payload })
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/library/books', payload)
  })
  // ... list, getById, update, remove
})
```

**Rules:**

- Test services only (pure logic, no Vue components)
- Mock `api.js` via `vi.hoisted` + `vi.mock`
- Test happy path + param variations (search, pagination)
- Run: `npm test` (vitest run) or `npm run test:watch`

---

## 5. Linting & Formatting

**Commands:**

- `npm run lint:eslint:check` / `lint:eslint:fix`
- `npm run lint:prettier:check` / `lint:prettier:fix`

**Config:** `eslint.config.js` (flat)

- Extends: `eslint.configs.recommended`, `eslintPluginVue.configs['flat/recommended']`, `eslintConfigPrettier`
- Globals: `window`, `document`, `localStorage`, `console`, timers
- Rules: `vue/multi-word-component-names: off`, `no-console: off`, `no-unused-vars: warn` (ignore `_` prefix)

---

## 6. Environment & Runtime Config

**Files:**

- `.env` — local dev (`VITE_API_BASE_URL`)
- `public/env.js` — injected at runtime (Docker entrypoint `40-env.sh`)
- `vite.config.js` — `@` alias to `src/`

**Access in code:**

```javascript
// Build-time (Vite)
import.meta.env.VITE_API_BASE_URL

// Runtime (Docker/ENV)
window.__ENV__?.VITE_API_BASE_URL
```

---

## 7. AI Agent Operational Constraints

When an AI agent (Gemini, etc.) operates on this codebase, it MUST adhere to:

### 7.1 Code Generation Rules

| Rule                                                                                    | Enforcement                                  |
| --------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Never create new files** unless explicitly asked                                      | Edit existing files only                     |
| **Follow existing patterns** exactly (service structure, store shape, component layout) | Match the patterns in Sections 3.1–3.7       |
| **Use `@/` alias** for imports from `src/`                                              | `@/services/`, `@/stores/`, `@/composables/` |
| **No inline styles** — use Tailwind utilities ou classes do design system (`main.css`)  |                                              |
| **No `console.log` in production code** (allowed in tests)                              | ESLint `no-console: off` but discouraged     |
| **Async functions must handle errors** with try/catch + toast feedback                  | See `deleteBook` pattern                     |
| **Pagination state** uses `page`, `limit`, `meta` (total, has_next, has_prev)           |                                              |
| **Search** uses `q` ref + `@keyup.enter` + button                                       |                                              |
| **Delete** always uses `confirmToast` → service → toast → reload                        |                                              |
| **Role checks** use `authStore.isAdminOrCoord` getter                                   |                                              |

### 7.2 Forbidden Patterns

- ❌ Importing stores/composables in `services/*.js`
- ❌ Direct `axios` imports in components (use service layer)
- ❌ Mutating props in child components
- ❌ `v-html` without sanitization (ESLint warns). Renderização de conteúdo rico **somente** via `<RichText>` (DOMPurify) e edição **somente** via `<TiptapEditor>`
- ❌ Creating new state management solutions (use Pinia)
- ❌ Custom CSS in `.vue` files (use `main.css`)

### 7.3 Required Patterns for New Features

1. **New Domain (e.g., "Reports"):**
   - Create `src/services/reports.services.js` (follow 3.1)
   - Create `src/stores/reports.js` if needs global state (follow 3.2)
   - Create pages under `src/pages/reports/` (List, Create, Detail, Edit)
   - Add routes in `router/index.js` with proper `meta`
   - Add nav entries in `Nav.vue` (role-gated)
   - Write tests in `src/services/__tests__/reports.services.test.js`

2. **New Component:**
   - Place in `src/components/` (PascalCase)
   - Use Tailwind utilities + design-system classes (`.input-base`, `.btn-*`, `.table-wrap`)
   - Export as default

3. **New Composable:**
   - Place in `src/composables/useXxx.js`
   - Export named functions + default object

### 7.4 Verification Checklist (Before Committing)

- [ ] `npm run lint:eslint:check` passes
- [ ] `npm run lint:prettier:check` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] No new `console.log` in production code
- [ ] All imports use `@/` alias
- [ ] Route guards updated for new pages
- [ ] Nav updated if feature is user-facing

---

## 8. Agent Tool Interface Specification

When an AI agent uses tools to modify this codebase, the following interface applies:

### 8.1 Read/Write Operations

| Tool   | Use Case                                                    |
| ------ | ----------------------------------------------------------- |
| `read` | Inspect existing files before editing                       |
| `edit` | Modify files (exact string replacement)                     |
| `glob` | Find files by pattern (e.g., `src/services/*.js`)           |
| `grep` | Search content (e.g., `AuthService`, `isAdminOrCoord`)      |
| `bash` | Run commands: `npm test`, `npm run build`, `npm run lint:*` |

### 8.2 Execution Model

- **Sequential by default** — edits must be applied one at a time
- **Parallel reads** — multiple `read`/`glob`/`grep` in single turn
- **Verification required** — after edits, run lint + tests
- **No auto-commit** — human must explicitly request git operations

### 8.3 Behavioral Constraints

| Constraint           | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| **Minimal diffs**    | Change only what's necessary; preserve surrounding code style                  |
| **No assumptions**   | If unclear, ask via `question` tool (e.g., "Which component should handle X?") |
| **Context-aware**    | Read related files before editing (service → page → test)                      |
| **Pattern fidelity** | Replicate existing code structure exactly (indentation, imports, naming)       |

---

## 9. Quick Reference: Key Entry Points

| Task                | File(s) to Modify                                   |
| ------------------- | --------------------------------------------------- |
| Add API endpoint    | `src/services/<domain>.services.js`                 |
| Add global state    | `src/stores/<domain>.js`                            |
| Add page            | `src/pages/<domain>/<Page>.vue` + `router/index.js` |
| Add nav item        | `src/components/Nav.vue`                            |
| Add toast type      | `src/composables/useToast.js`                       |
| Add validation rule | Use `yup` in page/component + `vuelidate`           |
| Fix 401 handling    | `src/services/api.js` (interceptor)                 |
| Change theme        | `src/composables/useTheme.js` + `main.css`          |
| Update permissions  | `router/index.js` (guard) + `auth.js` (getters)     |

---

## 10. Version & Maintenance

- **Document Version:** 1.1
- **Last Updated:** 2026-08-20
- **Maintained By:** Human + AI contributors
- **Review Cycle:** Update when architecture patterns change (new libraries, structural refactors)

---

> **Note for AI Agents:** This document is your contract. Deviations require explicit human approval. When in doubt, `question` the user.
