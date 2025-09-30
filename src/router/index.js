import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
    { path: "/login", name: "Login", component: () => import('@/pages/Login.vue') },
    { path: "/", name: "Home", component: () => import('@/pages/users/List.vue'), meta: { requiresAuth: true } },
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
    next();
});

export default router;