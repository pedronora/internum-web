import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    const token = auth.accessToken

    if (token && config?.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const auth = useAuthStore()

    if (!error.response) return Promise.reject(error)

    const url = originalRequest?.url || ''
    const skipRefreshHeader =
      originalRequest?.headers?.['x-skip-refresh'] ||
      originalRequest?.headers?.['X-Skip-Refresh']

    if (url.includes('/api/v1/auth/') || skipRefreshHeader) {
      return Promise.reject(error)
    }

    if (error.response.status !== 401) return Promise.reject(error)

    if (originalRequest._retry) return Promise.reject(error)
    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    isRefreshing = true

    try {
      const result = await auth.refreshToken()
      const newToken = result.access_token

      api.defaults.headers.common.Authorization = `Bearer ${newToken}`
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)
      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)
      console.error('Erro ao atualizar token:', err)

      try {
        await auth.logout()
      } catch (logoutError) {
        console.error('Erro ao fazer logout:', logoutError)
      }
      throw err
    } finally {
      isRefreshing = false
    }
  },
)

export default api
