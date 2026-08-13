import api from './api'

const ENDPOINT = '/api/v1/vacation'

export const VacationService = {
  // --- Períodos aquisitivos ---
  getMyAccrualPeriods: () =>
    api.get(ENDPOINT + '/accrual-periods').then((r) => r.data),
  getUserAccrualPeriods: (userId) =>
    api.get(ENDPOINT + `/accrual-periods/${userId}`).then((r) => r.data),
  getUserAccrualPeriod: (userId, periodId) =>
    api
      .get(ENDPOINT + `/accrual-periods/${userId}/${periodId}`)
      .then((r) => r.data),
  sellDays: (userId, periodId, days) =>
    api
      .post(ENDPOINT + `/accrual-periods/${userId}/${periodId}/sell`, { days })
      .then((r) => r.data),
  createGrant: (userId, periodId, payload) =>
    api
      .post(ENDPOINT + `/accrual-periods/${userId}/${periodId}/grants`, payload)
      .then((r) => r.data),

  // --- Solicitações ---
  createRequest: (payload) =>
    api.post(ENDPOINT + '/requests', payload).then((r) => r.data),
  listRequests: (params = {}) =>
    api.get(ENDPOINT + '/requests', { params }).then((r) => r.data),
  listRequestsBySector: (setor, params = {}) =>
    api
      .get(ENDPOINT + `/requests/by-sector/${setor}`, { params })
      .then((r) => r.data),
  getRequest: (id) => api.get(ENDPOINT + `/requests/${id}`).then((r) => r.data),
  approveRequest: (id, payload = {}) =>
    api.post(ENDPOINT + `/requests/${id}/approve`, payload).then((r) => r.data),
  rejectRequest: (id, payload = {}) =>
    api.post(ENDPOINT + `/requests/${id}/reject`, payload).then((r) => r.data),
  cancelRequest: (id) =>
    api.post(ENDPOINT + `/requests/${id}/cancel`).then((r) => r.data),

  // --- Concessões ---
  listGrants: (params = {}) =>
    api.get(ENDPOINT + '/grants', { params }).then((r) => r.data),
  listGrantsBySector: (setor, params = {}) =>
    api
      .get(ENDPOINT + `/grants/by-sector/${setor}`, { params })
      .then((r) => r.data),
  getGrant: (id) => api.get(ENDPOINT + `/grants/${id}`).then((r) => r.data),
  confirmFruition: (id, payload) =>
    api
      .post(ENDPOINT + `/grants/${id}/confirm-fruition`, payload)
      .then((r) => r.data),

  // --- Preview e alertas ---
  preview: (payload) =>
    api.post(ENDPOINT + '/preview', payload).then((r) => r.data),
  getAlerts: () => api.get(ENDPOINT + '/alerts').then((r) => r.data),
}
