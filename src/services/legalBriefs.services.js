import api from './api'

const ENDPOINT = '/api/v1/legal-briefs/'

export const LegalBriefsService = {
  create: (payload) => api.post(ENDPOINT, payload).then((r) => r.data),
  list(offset = 0, limit = 10, search = '') {
    const params = {
      offset,
      limit,
    }
    if (search) params.search = search
    return api.get(ENDPOINT, { params })
  },
  getById: (id) => api.get(ENDPOINT + `${id}`).then((r) => r.data),
  update: (id, payload) =>
    api.put(ENDPOINT + `${id}`, payload).then((r) => r.data),
  cancel: (id) => api.patch(ENDPOINT + `${id}/cancel`).then((r) => r.data),
}
