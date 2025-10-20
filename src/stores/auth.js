import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  actions: {
    setToken(token) {
      this.accessToken = token
      localStorage.setItem('access_token', token)
    },
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    async login({ username, password }) {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)

      const res = await api.post('/api/v1/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const data = res.data
      this.setToken(data.access_token)

      await this.fetchProfile()
      return data
    },
    async fetchProfile() {
      try {
        const res = await api.get('/api/v1/users/me')
        this.setUser(res.data)
      } catch (err) {
        console.error('Erro ao buscar o perfil do usuário:', err)
      }
    },
    async refreshToken() {
      const res = await api.post('/api/v1/auth/refresh_token', null, {
        headers: { 'x-skip-refresh': '1' },
      })
      this.setToken(res.data.access_token)
      return res.data
    },
    async logout() {
      this.accessToken = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      await api.post('/api/v1/auth/logout')
    },
    initFromStorage() {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      if (token) this.accessToken = token
      if (user) this.user = JSON.parse(user)
    },
  },
})
