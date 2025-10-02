import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    const token = auth.accessToken;
    if (token && config && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const auth = useAuthStore();

        if (!error.response) return Promise.reject(error);

        const url = originalRequest?.url || "";
        const skipRefreshHeader = originalRequest?.headers?.['x-skip-refresh'] || originalRequest?.headers?.['X-Skip-Refresh'];

        if (url.includes("/api/v1/auth/token") || url.includes("/api/v1/auth/refresh_token") || skipRefreshHeader) {
            return Promise.reject(error);
        }

        if (error.response.status !== 401) return Promise.reject(error);


        if (originalRequest._retry) return Promise.reject(error);
        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = "Bearer " + token;
                    return api(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
            try {
                const result = await auth.refreshToken();
                const newToken = result.access_token || result.accessToken;
                auth.setToken(newToken);
                api.defaults.headers.common.Authorization = "Bearer " + newToken;
                originalRequest.headers.Authorization = "Bearer " + newToken;
                processQueue(null, newToken);
                resolve(api(originalRequest));
            } catch (err) {
                processQueue(err, null);
                try { await auth.logout(); } catch (e) { console.error(err) }
                reject(err);
            } finally {
                isRefreshing = false;
            }
        });
    }
);

export default api;