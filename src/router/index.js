import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { title: 'Login - ' },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: true, title: 'Home - ' },
  },
  {
    path: '/legal-briefs',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true, title: 'Ementas - ' },
    children: [
      {
        path: '',
        name: 'LegalBriefsList',
        component: () => import('@/pages/legalBriefs/List.vue'),
        meta: { requiresAuth: true, title: 'Ementas - ' },
      },
      {
        path: 'create',
        name: 'LegalBriefsCreate',
        component: () => import('@/pages/legalBriefs/Create.vue'),
        meta: { requiresAuth: true, title: 'Criar Ementa - ' },
      },
      {
        path: ':id/edit',
        name: 'LegalBriefEdit',
        component: () => import('@/pages/legalBriefs/Update.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Editar Ementa - ',
        },
      },
    ],
  },
  {
    path: '/library',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'books',
        name: 'BooksList',
        component: () => import('@/pages/library/books/List.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerenciar Livros - ',
        },
      },
      {
        path: 'books/create',
        name: 'BooksCreate',
        component: () => import('@/pages/library/books/Create.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Cadastrar Livro - ',
        },
      },
      {
        path: '/books/:id/detail',
        name: 'BookDetail',
        component: () => import('@/pages/library/books/Detail.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Visualizar Livro - ',
        },
      },
      {
        path: '/books/:id/edit',
        name: 'BookEdit',
        component: () => import('@/pages/library/books/Edit.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Editar Livro - ',
        },
      },
      {
        path: 'books/list',
        name: 'BooksReqList',
        component: () => import('@/pages/library/books/requestList.vue'),
        meta: { requiresAuth: true, title: 'Acerco - ' },
      },
      {
        path: 'loans/list/my',
        name: 'MyLoansList',
        component: () => import('@/pages/library/loans/MyLoansList.vue'),
        meta: { requiresAuth: true, title: 'Meus Empréstimos - ' },
      },
      {
        path: 'loans/list/admin',
        name: 'AdminLoansList',
        component: () => import('@/pages/library/loans/AdminLoansList.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerenciar Empréstimos - ',
        },
      },
    ],
  },
  {
    path: '/notices',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'NoticesListByUser',
        component: () => import('@/pages/notices/NoticesUser.vue'),
        meta: { requiresAuth: true, title: 'Meus Avisos - ' },
      },
      {
        path: 'list',
        name: 'NoticesList',
        component: () => import('@/pages/notices/List.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerir Avisos - ',
        },
      },
      {
        path: 'create',
        name: 'NoticesCreate',
        component: () => import('@/pages/notices/Create.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Criar Aviso - ',
        },
      },
      {
        path: ':id',
        name: 'NoticesDetail',
        component: () => import('@/pages/notices/Detail.vue'),
        meta: { requiresAuth: true, title: 'Aviso - ' },
      },
    ],
  },
  {
    path: '/profile',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true, title: 'Meu Perfil - ' },
    children: [
      {
        path: '',
        name: 'UserProfile',
        component: () => import('@/pages/profile/UserProfile.vue'),
        meta: { requiresAuth: true, title: 'Meu Perfil - ' },
      },
      {
        path: 'change-password',
        name: 'UserChangePassword',
        component: () => import('@/pages/profile/UserChangePassword.vue'),
        meta: { requiresAuth: true, title: 'Alterar Senha - ' },
      },
    ],
  },
  {
    path: '/users',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true, requiresPermission: true },
    children: [
      {
        path: '',
        name: 'UsersList',
        component: () => import('@/pages/users/List.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Usuários - ',
        },
      },
      {
        path: 'create',
        name: 'UsersCreate',
        component: () => import('@/pages/users/Create.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Cadastrar Usuário - ',
        },
      },
      {
        path: ':id',
        name: 'UsersDetail',
        component: () => import('@/pages/users/Detail.vue'),
        props: true,
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Usuário - ',
        },
      },
      {
        path: ':id/edit',
        name: 'UsersEdit',
        component: () => import('@/pages/users/Update.vue'),
        props: true,
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Editar Usuário - ',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'active',
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  document.title = (to.meta.title || '') + 'Internum - 1º RI de Cascavel/PR'

  if (to.meta.requiresAuth && !auth.accessToken) {
    return next({ name: 'Login', query: { next: to.fullPath } })
  }

  if (
    to.meta.requiresPermission &&
    (!auth.user || !['coord', 'admin'].includes(auth.user.role))
  ) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
