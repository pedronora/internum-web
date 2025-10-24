import api from './api'

const ENDPOINT = '/api/v1/notices/'

export const NoticesService = {
  listUnreads(offset = 0, limit = 10, search = '') {
    const params = {
      offset,
      limit,
    }
    if (search) params.search = search
    return api.get(ENDPOINT + 'unreads/me', { params })
  },
  listReads(offset = 0, limit = 10, search = '') {
    const params = {
      offset,
      limit,
    }
    if (search) params.search = search
    return api.get(ENDPOINT + 'reads/me', { params })
  },
  markAsRead: (id) =>
    api.post(ENDPOINT + `${id}/mark-read/me`).then((r) => r.data),
  create: (payload) => api.post(ENDPOINT, payload).then((r) => r.data),
  list(offset = 0, limit = 10, search = '') {
    const params = new URLSearchParams()
    params.append('offset', offset)
    params.append('limit', limit)
    if (search) params.append('search', search)
    return api.get(ENDPOINT, { params })
  },
  getById: (id) => api.get(ENDPOINT + `${id}`).then((r) => r.data),
  deactivate: (id) => api.delete(ENDPOINT + `${id}`),
}
