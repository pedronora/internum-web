import api from "./api";

export const UsersService = {
    list: (offset = 0, limit = 10) =>
        api.get("/api/v1/users/", { params: { offset, limit } }).then(r => r.data),
    me: () => api.get('/api/v1/users/me'),
    getById: (id) => api.get(`/api/v1/users/${id}`).then(r => r.data),
    create: (payload) => api.post("/api/v1/users/", payload).then(r => r.data),
    update: (id, payload) => api.put(`/api/v1/users/${id}`, payload).then(r => r.data),
    deactivate: (id) => api.delete(`/api/v1/users/${id}`),
};