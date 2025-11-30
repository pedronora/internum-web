import { defineStore } from 'pinia'
// import api from '../services/api'
import { AuthService } from '@/services/auth.services'
import { UsersService } from '@/services/users.services'

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
      const payload = { username, password }
      const data = await AuthService.login(payload)
      this.setToken(data.access_token)

      await this.fetchProfile()
      return data
    },
    async fetchProfile() {
      try {
        const data = await UsersService.me()
        this.setUser(data)
      } catch (err) {
        console.error('Erro ao buscar o perfil do usuário:', err)
      }
    },
    async refreshToken() {
      const data = await AuthService.refreshToken()
      this.setToken(data.access_token)
      return data
    },
    async logout() {
      await AuthService.logout()
      this.accessToken = null
      this.user = null
      localStorage.removeItem('user')
    },
    async initFromStorage() {
      if (this.initialized) {
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
