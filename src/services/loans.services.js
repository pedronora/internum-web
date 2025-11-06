import api from './api'

const ENDPOINT = '/api/v1/library'

export const LoansService = {
  request: (bookId) =>
    api.post(ENDPOINT + '/loans' + `/${bookId}/request`).then((r) => r.data),
  approve: (loanId) =>
    api.patch(ENDPOINT + '/loans' + `/${loanId}/approve`).then((r) => r.data),
  reject: (loanId) =>
    api.patch(ENDPOINT + '/loans' + `/${loanId}/reject`).then((r) => r.data),
  cancel: (loanId) =>
    api.patch(ENDPOINT + '/loans' + `/${loanId}/cancel`).then((r) => r.data),
  return: (loanId) =>
    api.patch(ENDPOINT + '/loans' + `/${loanId}/return`).then((r) => r.data),
  list(
    offset = 0,
    limit = 10,
    search = '',
    status = '',
    sort_by = 'created_at',
    sort_order = 'desc',
  ) {
    const params = { offset, limit, sort_by, sort_order }
    if (search) params.search = search
    if (status) params.status = status
    return api.get(ENDPOINT + '/loans', { params }).then((r) => r.data)
  },
  listMy(
    offset = 0,
    limit = 10,
    status = '',
    sort_by = 'created_at',
    sort_order = 'desc',
  ) {
    const params = { offset, limit, sort_by, sort_order }
    if (status) params.status = status
    return api.get(ENDPOINT + '/loans/my', { params }).then((r) => r.data)
  },
}
