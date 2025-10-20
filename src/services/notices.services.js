import api from "./api";

export const NoticesService = {
  listUnreads(offset = 0, limit = 10, search = "") {
    const params = new URLSearchParams();
    params.append("offset", offset);
    params.append("limit", limit);
    if (search) params.append("search", search);
    return api.get(`/api/v1/notices/unreads/me?${params.toString()}`);
  },
  listReads(offset = 0, limit = 10, search = "") {
    const params = new URLSearchParams();
    params.append("offset", offset);
    params.append("limit", limit);
    if (search) params.append("search", search);
    return api.get(`/api/v1/notices/reads/me?${params.toString()}`);
  },
  markAsRead: (id) =>
    api.post(`/api/v1/notices/${id}/mark-read/me`).then((r) => r.data),
  create: (payload) =>
    api.post(`/api/v1/notices/`, payload).then((r) => r.data),
  list(offset = 0, limit = 10, search = "") {
    const params = new URLSearchParams();
    params.append("offset", offset);
    params.append("limit", limit);
    if (search) params.append("search", search);
    return api.get(`/api/v1/notices?${params.toString()}`);
  },
  getById: (id) => api.get(`/api/v1/notices/${id}`).then((r) => r.data),
  deactivate: (id) => api.delete(`/api/v1/notices/${id}`),
};
