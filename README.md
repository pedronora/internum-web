# **Internum Web**

![status](https://img.shields.io/badge/status-active-brightgreen)
![vue](https://img.shields.io/badge/Vue-3.x-42b883?logo=vuedotjs&logoColor=white)
![vite](https://img.shields.io/badge/Vite-latest-646cff?logo=vite&logoColor=white)
![node](https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white)
![license](https://img.shields.io/badge/license-MIT-blue)

Aplicação frontend construída com **Vue 3** e **Vite** para o projeto Internum.

---

## 🚀 Tecnologias

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Bootstrap + Bootstrap Icons
- Vuelidate
- Yup
- ESLint + Prettier

---

## ▶️ Como rodar

```bash
npm install
npm run dev
```

## Acesse em:

```bash
http://localhost:5173
```

## 📦 Build para produção

```bash
npm run build
npm run preview
```

## 🐳 Docker (TrueNAS)

Build da imagem (usando a versão do `package.json`, tag: `internum-web:latest`):

```bash
npm run docker:build
```

Rodar local para validação:

```bash
docker run --rm -p 8080:80 \
  -e VITE_API_BASE_URL="https://api.seu-dominio.com" \
  internum-web:latest
```

No TrueNAS (Apps):

1. Publique a imagem em um registry (`ghcr.io`, `docker hub`, etc.).
2. Crie o app usando essa imagem e exponha a porta `80` do container.
3. Configure as variáveis de ambiente:
   - `VITE_API_BASE_URL`: URL da API backend.
4. Ao alterar essa variável, basta reiniciar o app (não precisa rebuild da imagem).

## 📁 Estrutura do Projeto

```bash
.
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── public
│   ├── apple-touch-icon.png
│   ├── favicon-96x96.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── site.webmanifest
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
├── README.md
├── src
│   ├── App.vue
│   ├── assets
│   │   ├── main.css
│   │   └── vue.svg
│   ├── components
│   │   ├── Footer.vue
│   │   ├── Nav.vue
│   │   └── Toasts.vue
│   ├── composables
│   │   ├── useCPF.js
│   │   ├── useDate.js
│   │   ├── useTheme.js
│   │   ├── useToast.js
│   │   └── useVacation.js
│   ├── main.js
│   ├── pages
│   │   ├── auth
│   │   │   ├── ForgotPassword.vue
│   │   │   ├── Login.vue
│   │   │   └── ResetPassword.vue
│   │   ├── Home.vue
│   │   ├── legalBriefs
│   │   │   ├── Create.vue
│   │   │   ├── List.vue
│   │   │   └── Update.vue
│   │   ├── library
│   │   │   ├── books
│   │   │   │   ├── Create.vue
│   │   │   │   ├── Detail.vue
│   │   │   │   ├── Edit.vue
│   │   │   │   ├── List.vue
│   │   │   │   └── requestList.vue
│   │   │   └── loans
│   │   │       ├── AdminLoansList.vue
│   │   │       └── MyLoansList.vue
│   │   ├── NotFound.vue
│   │   ├── notices
│   │   │   ├── Create.vue
│   │   │   ├── Detail.vue
│   │   │   ├── List.vue
│   │   │   └── NoticesUser.vue
│   │   ├── profile
│   │   │   ├── UserChangePassword.vue
│   │   │   └── UserProfile.vue
│   │   ├── RouterLayout.vue
│   │   ├── users
│   │   │   ├── Create.vue
│   │   │   ├── Detail.vue
│   │   │   ├── List.vue
│   │   │   └── Update.vue
│   │   └── vacation
│   │       ├── AdminAccrualList.vue
│   │       ├── AdminAlerts.vue
│   │       ├── AdminGrantsList.vue
│   │       ├── AdminRequestDetail.vue
│   │       ├── AdminRequestsList.vue
│   │       ├── MyRequestsList.vue
│   │       ├── MyVacation.vue
│   │       ├── RequestDetail.vue
│   │       └── RequestForm.vue
│   ├── router
│   │   └── index.js
│   ├── services
│   │   ├── api.js
│   │   ├── auth.services.js
│   │   ├── books.services.js
│   │   ├── home.services.js
│   │   ├── legalBriefs.services.js
│   │   ├── loans.services.js
│   │   ├── notices.services.js
│   │   ├── users.services.js
│   │   ├── vacation.services.js
│   │   └── __tests__
│   │       └── vacation.services.test.js
│   └── stores
│       ├── auth.js
│       └── notices.js
└── vite.config.js

28 directories, 96 files
```

## 🧹 Lint

```bash
npm run lint:eslint:check
npm run lint:prettier:check
```

## 👤 Autor

**Pedro Nora**

[![GitHub](https://img.shields.io/badge/GitHub-pedronora-181717?logo=github)](https://github.com/pedronora)  
[![Email](https://img.shields.io/badge/Email-pedro@nora.vc-blue?logo=gmail&logoColor=white)](mailto:pedro@nora.vc)
