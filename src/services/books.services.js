import api from './api'

const ENDPOINT = '/api/v1/library'

export const BooksService = {
  create: (payload) =>
    api.post(ENDPOINT + '/books', payload).then((r) => r.data),
  list(offset = 0, limit = 10, search = '') {
    const params = { offset, limit }
    if (search) params.search = search
    return api.get(ENDPOINT + '/books', { params }).then((r) => r.data)
  },
  getById: (id) => api.get(ENDPOINT + '/books' + `/${id}`).then((r) => r.data),
  update: (id, payload) =>
    api.put(ENDPOINT + '/books' + `/${id}`, payload).then((r) => r.data),

  remove: (id) =>
    api.delete(ENDPOINT + '/books' + `/${id}`).then((r) => r.status === 204),
}
