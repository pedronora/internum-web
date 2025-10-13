<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <div class="navbar-brand">
          Internum
        </div>

        <div class="d-flex me-2">
          <router-link v-if="!isAuthenticated" to="/login" class="btn btn-outline-primary me-2">
            Login
          </router-link>
          <div v-else>
            <span class="text-start me-2">Olá, {{ user?.name || user?.username || 'Usuário' }}</span>
            <button class="btn btn-outline-primary me-2" @click="onLogout">Sair</button>
          </div>

          <button type="button" class="btn btn-outline-secondary d-flex align-items-center gap-2"
            :aria-pressed="isDark.toString()" :title="buttonTitle" @click="toggle">
            <i :class="iconClass" aria-hidden="true"></i>
            <span class="visually-hidden">{{ buttonTitle }}</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view />
      <Toasts />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { useAuthInit } from '@/composables/useAuthInit'
import Toasts from '@/components/Toasts.vue';

const ROUTE_LOGIN_NAME = 'Login'

const router = useRouter()
const auth = useAuthStore()

useAuthInit(auth)

const { isDark, iconClass, buttonTitle, toggle } = useTheme()

const isAuthenticated = computed(() => Boolean(auth?.accessToken))
const user = computed(() => auth?.user ?? null)

async function onLogout() {
  try {
    await auth.logout()
    await router.push({ name: ROUTE_LOGIN_NAME })
  } catch (err) {
    console.error('Erro no logout', err)
  }
}
</script>
