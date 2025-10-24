import api from './api'

const ENDPOINT = '/api/v1/users/'

export const UsersService = {
  list(offset = 0, limit = 10, search = '') {
    const params = {
      offset,
      limit,
    }
    if (search) params.search = search
    return api.get(ENDPOINT, { params })
  },
  me: () => api.get(ENDPOINT + 'me'),
  getById: (id) => api.get(ENDPOINT + `${id}`).then((r) => r.data),
  create: (payload) => api.post(ENDPOINT, payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(ENDPOINT + `${id}`, payload).then((r) => r.data),
  deactivate: (id) => api.delete(ENDPOINT + `${id}`),
}
