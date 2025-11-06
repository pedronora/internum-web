import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    formattedName: (state) => {
      const fullName = state.user?.name
      if (fullName) {
        const parts = fullName.split(' ')
        if (parts.length === 1) {
          return parts[0]
        }
        return `${parts[0]} ${parts[parts.length - 1]}`
      }
      return state.user?.username || 'Usuário'
    },
  },
  actions: {
    setToken(token) {
      this.accessToken = token
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
        withCredentials: true,
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
        withCredentials: true,
      })
      this.setToken(res.data.access_token)
      return res.data
    },
    async logout() {
      await api.post('/api/v1/auth/logout', null, { withCredentials: true })
      this.accessToken = null
      this.user = null
      localStorage.removeItem('user')
    },
    async initFromStorage() {
      if (this.initialized) {
        console.log('⚠️ initFromStorage() já executado')
        return
      }
      this.initialized = true

      const savedUser = localStorage.getItem('user')
      if (savedUser) this.user = JSON.parse(savedUser)

      try {
        const data = await this.refreshToken()
        this.accessToken = data.access_token
      } catch {
        this.accessToken = null
        this.user = null
      }
    },
  },
})
