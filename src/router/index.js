import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
    {
        path: "/login",
        name: "Login",
        component: () => import('@/pages/Login.vue')
    },
    {
        path: "/",
        name: "Home",
        component: () => import('@/pages/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/users',
        name: 'UsersList',
        component: () => import('@/pages/users/List.vue'),
        meta: { requiresAuth: true, requiresPermission: true }
    },
    {
        path: '/users/create',
        name: 'UsersCreate',
        component: () => import('@/pages/users/Create.vue'),
        meta: { requiresAuth: true, requiresPermission: true }
    },
    {
        path: '/users/:id',
        name: 'UsersDetail',
        component: () => import('@/pages/users/Detail.vue'),
        props: true,
        meta: { requiresAuth: true, requiresPermission: true }
    },
    {
        path: '/users/:id/edit',
        name: 'UsersEdit',
        component: () => import('@/pages/users/Update.vue'),
        props: true,
        meta: { requiresAuth: true, requiresPermission: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    if (!auth.accessToken) auth.initFromStorage();

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next({ name: "Login", query: { next: to.fullPath } });
    }

    if (to.meta.requiresPermission && !['coord', 'admin'].includes(auth.user.role)) {
        return next({ name: "Home" })
    }
    next();
});

export default router;