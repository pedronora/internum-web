import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/legal-briefs',
    component: () => import('@/pages/RouterLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'LegalBriefsList',
        component: () => import('@/pages/legalBriefs/List.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'create',
        name: 'LegalBriefsCreate',
        component: () => import('@/pages/legalBriefs/Create.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: ':id/edit',
        name: 'LegalBriefEdit',
        component: () => import('@/pages/legalBriefs/Update.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
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
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: 'books/create',
        name: 'BooksCreate',
        component: () => import('@/pages/library/books/Create.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: '/books/:id/detail',
        name: 'BookDetail',
        component: () => import('@/pages/library/books/Detail.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: '/books/:id/edit',
        name: 'BookEdit',
        component: () => import('@/pages/library/books/Edit.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: 'books/list',
        name: 'BooksReqList',
        component: () => import('@/pages/library/books/requestList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'loans/list/my',
        name: 'MyLoansList',
        component: () => import('@/pages/library/loans/MyLoansList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'loans/list/admin',
        name: 'AdminLoansList',
        component: () => import('@/pages/library/loans/AdminLoansList.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
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
        meta: { requiresAuth: true },
      },
      {
        path: 'list',
        name: 'NoticesList',
        component: () => import('@/pages/notices/List.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: 'create',
        name: 'NoticesCreate',
        component: () => import('@/pages/notices/Create.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: ':id',
        name: 'NoticesDetail',
        component: () => import('@/pages/notices/Detail.vue'),
        meta: { requiresAuth: true },
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
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: 'create',
        name: 'UsersCreate',
        component: () => import('@/pages/users/Create.vue'),
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: ':id',
        name: 'UsersDetail',
        component: () => import('@/pages/users/Detail.vue'),
        props: true,
        meta: { requiresAuth: true, requiresPermission: true },
      },
      {
        path: ':id/edit',
        name: 'UsersEdit',
        component: () => import('@/pages/users/Update.vue'),
        props: true,
        meta: { requiresAuth: true, requiresPermission: true },
      },
    ],
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

  if (!auth.accessToken) {
    try {
      await auth.initFromStorage()
    } catch (e) {
      console.warn('Falha ao inicializar sessão:', e)
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
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
