<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top shadow">
    <div class="container-fluid">
      <a class="navbar-brand" href="/" alt="Home"> Internum </a>

      <div id="navbarNavDropdown" class="collapse navbar-collapse">
        <ul v-if="isUserAdminOrCoord" class="navbar-nav">
          <li class="nav-link dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Avisos</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'NoticesListByUser' }"
                  >Meus Avisos</router-link
                >
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'NoticesList' }"
                  >Gerir Avisos</router-link
                >
              </li>
            </ul>
          </li>
          <li class="nav-link dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Usuários</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'UsersList' }"
                  >Listar</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'UsersCreate' }"
                  >Criar</router-link
                >
              </li>
            </ul>
          </li>
        </ul>
        <ul v-if="!isUserAdminOrCoord & isAuthenticated" class="navbar-nav">
          <li class="nav-item">
            <router-link
              class="nav-link"
              aria-current="page"
              :to="{ name: 'NoticesListByUser' }"
              >Avisos</router-link
            >
          </li>
        </ul>
      </div>

      <div class="d-flex me-2">
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="btn btn-outline-primary me-2"
        >
          Login
        </router-link>
        <div v-else>
          <span class="text-start me-2"
            >Olá, {{ user?.name || user?.username || 'Usuário' }}</span
          >
          <button class="btn btn-outline-primary me-2" @click="onLogout">
            Sair
          </button>
        </div>

        <button
          type="button"
          class="btn btn-outline-secondary d-flex align-items-center gap-2"
          :aria-pressed="isDark.toString()"
          :title="buttonTitle"
          @click="toggle"
        >
          <i :class="iconClass" aria-hidden="true"></i>
          <span class="visually-hidden">{{ buttonTitle }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useTheme } from '@/composables/useTheme'
  import { useAuthInit } from '@/composables/useAuthInit'

  const ROUTE_LOGIN_NAME = 'Login'

  const router = useRouter()
  const auth = useAuthStore()

  useAuthInit(auth)

  const { isDark, iconClass, buttonTitle, toggle } = useTheme()

  const isAuthenticated = computed(() => Boolean(auth?.accessToken))
  const user = computed(() => auth?.user ?? null)

  const isUserAdminOrCoord = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'coord'
  })

  async function onLogout() {
    try {
      await auth.logout()
      await router.push({ name: ROUTE_LOGIN_NAME })
    } catch (err) {
      console.error('Erro no logout', err)
    }
  }
</script>
