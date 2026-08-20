import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/pages/auth/Login.vue'),
    meta: { title: 'Login - ', isPublicRoute: true },
  },
  {
    path: '/auth/esqueci-senha',
    name: 'forgot-password',
    component: () => import('@/pages/auth/ForgotPassword.vue'),
    meta: { title: 'Esqueci a senha - ', isPublicRoute: true },
  },

  {
    path: '/auth/redefinir-senha',
    name: 'reset-password',
    component: () => import('@/pages/auth/ResetPassword.vue'),
    meta: { title: 'Resetar a senha - ', isPublicRoute: true },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: true, title: 'Home - ' },
  },
  {
    path: '/ementas',
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
        path: 'admin/criar',
        name: 'LegalBriefsCreate',
        component: () => import('@/pages/legalBriefs/Create.vue'),
        meta: { requiresAuth: true, title: 'Criar Ementa - ' },
      },
      {
        path: 'admin/:id/editar',
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
    path: '/biblioteca',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'admin/livros',
        name: 'BooksList',
        component: () => import('@/pages/library/books/List.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerenciar Livros - ',
        },
      },
      {
        path: 'livros/criar',
        name: 'BooksCreate',
        component: () => import('@/pages/library/books/Create.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Cadastrar Livro - ',
        },
      },
      {
        path: 'livros/:id/detalhes',
        name: 'BookDetail',
        component: () => import('@/pages/library/books/Detail.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Visualizar Livro - ',
        },
      },
      {
        path: 'livros/:id/editar',
        name: 'BookEdit',
        component: () => import('@/pages/library/books/Edit.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Editar Livro - ',
        },
      },
      {
        path: 'livros',
        name: 'BooksReqList',
        component: () => import('@/pages/library/books/requestList.vue'),
        meta: { requiresAuth: true, title: 'Acervo - ' },
      },
      {
        path: 'emprestimos',
        name: 'MyLoansList',
        component: () => import('@/pages/library/loans/MyLoansList.vue'),
        meta: { requiresAuth: true, title: 'Meus Empréstimos - ' },
      },
      {
        path: 'admin/emprestimos',
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
    path: '/avisos',
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
        path: 'admin/lista',
        name: 'NoticesList',
        component: () => import('@/pages/notices/List.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerir Avisos - ',
        },
      },
      {
        path: 'admin/criar',
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
    path: '/perfil',
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
        path: 'alterar-senha',
        name: 'UserChangePassword',
        component: () => import('@/pages/profile/UserChangePassword.vue'),
        meta: { requiresAuth: true, title: 'Alterar Senha - ' },
      },
    ],
  },
  {
    path: '/usuarios',
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
        path: 'admin/criar',
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
        path: 'admin/:id/editar',
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
    path: '/ferias',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'VacationMyVacation',
        component: () => import('@/pages/vacation/MyVacation.vue'),
        meta: { requiresAuth: true, title: 'Minhas Férias - ' },
      },
      {
        path: 'requerimentos',
        name: 'VacationRequestsList',
        component: () => import('@/pages/vacation/MyRequestsList.vue'),
        meta: { requiresAuth: true, title: 'Minhas Solicitações - ' },
      },
      {
        path: 'requerimentos/criar',
        name: 'VacationRequestsCreate',
        component: () => import('@/pages/vacation/RequestForm.vue'),
        meta: { requiresAuth: true, title: 'Nova Solicitação - ' },
      },
      {
        path: 'requerimentos/:id',
        name: 'VacationRequestDetail',
        component: () => import('@/pages/vacation/RequestDetail.vue'),
        props: true,
        meta: { requiresAuth: true, title: 'Solicitação - ' },
      },
      {
        path: 'admin/requerimentos',
        name: 'VacationAdminRequestsList',
        component: () => import('@/pages/vacation/AdminRequestsList.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerir Solicitações - ',
        },
      },
      {
        path: 'admin/requerimentos/:id',
        name: 'VacationAdminRequestDetail',
        component: () => import('@/pages/vacation/AdminRequestDetail.vue'),
        props: true,
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Solicitação - ',
        },
      },
      {
        path: 'admin/concessoes',
        name: 'VacationAdminGrantsList',
        component: () => import('@/pages/vacation/AdminGrantsList.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Gerir Concessões - ',
        },
      },
      {
        path: 'admin/usuarios/:userId/adquiridas',
        name: 'VacationAdminAccrualList',
        component: () => import('@/pages/vacation/AdminAccrualList.vue'),
        props: true,
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Períodos do Usuário - ',
        },
      },
      {
        path: 'admin/alertas',
        name: 'VacationAdminAlerts',
        component: () => import('@/pages/vacation/AdminAlerts.vue'),
        meta: {
          requiresAuth: true,
          requiresPermission: true,
          title: 'Alertas de Férias - ',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: { title: 'Oops! Esta página não existe - ', isPublicRoute: true },
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

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.initFromStorage()
  }

  document.title = (to.meta.title || '') + 'Internum - 1º RI de Cascavel/PR'

  const isPublicRoute = to.meta.isPublicRoute === true

  if (!auth.accessToken && !isPublicRoute) {
    try {
      await auth.refreshToken()

      if (auth.accessToken && !auth.user) {
        await auth.fetchProfile()
      }
    } catch (error) {
      console.error('Falha ao restaurar a sessão.', error)
      auth.accessToken = null
      auth.user = null
    }
  }

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
