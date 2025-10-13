import api from "./api";

export const UsersService = {
    list(offset = 0, limit = 10, search = '') {
        const params = new URLSearchParams();
        params.append('offset', offset);
        params.append('limit', limit);
        if (search) params.append('search', search);
        return api.get(`/api/v1/users?${params.toString()}`);
    },
    me: () => api.get('/api/v1/users/me'),
    getById: (id) => api.get(`/api/v1/users/${id}`).then(r => r.data),
    create: (payload) => api.post("/api/v1/users/", payload).then(r => r.data),
    update: (id, payload) => api.put(`/api/v1/users/${id}`, payload).then(r => r.data),
    deactivate: (id) => api.delete(`/api/v1/users/${id}`),
};