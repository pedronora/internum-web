import api from './api'

const ENDPOINT = 'api/v1/home/'

export const HomeService = {
  getSummary: () => api.get(ENDPOINT).then((r) => r.data),
}
