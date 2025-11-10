<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top shadow">
    <div class="container-fluid">
      <router-link class="navbar-brand" :to="{ name: 'Home' }" alt="Home">
        Internum
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navbarNavDropdown" class="collapse navbar-collapse">
        <ul v-if="isUserAdminOrCoord" class="navbar-nav me-auto">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Avisos
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'NoticesListByUser' }"
                >
                  Meus Avisos
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'NoticesList' }"
                >
                  Gerir Avisos
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'LegalBriefsList' }">
              Ementas
            </router-link>
          </li>

          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Biblioteca
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'BooksReqList' }"
                >
                  Acervo
                </router-link>
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'MyLoansList' }"
                >
                  Meus empréstimos
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <router-link class="dropdown-item" :to="{ name: 'BooksList' }">
                  Gerenciar Livros
                </router-link>
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'AdminLoansList' }"
                >
                  Gerenciar Empréstimos
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Usuários
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link class="dropdown-item" :to="{ name: 'UsersList' }"
                  >Listar</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" :to="{ name: 'UsersCreate' }"
                  >Criar</router-link
                >
              </li>
            </ul>
          </li>
        </ul>

        <ul v-else-if="isAuthenticated" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'NoticesListByUser' }"
              >Avisos</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'LegalBriefsList' }"
              >Ementas</router-link
            >
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Biblioteca
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'BooksReqList' }"
                  >Acervo</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" :to="{ name: 'MyLoansList' }"
                  >Meus empréstimos</router-link
                >
              </li>
            </ul>
          </li>
        </ul>

        <ul class="navbar-nav d-lg-none mt-3 border-top pt-2 text-center">
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link class="nav-link" :to="{ name: 'Login' }"
              >Login</router-link
            >
          </li>

          <li v-else class="nav-item dropdown">
            <a
              id="userMenuMobile"
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Olá, {{ formattedName }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="userMenuMobile">
              <li>
                <router-link class="dropdown-item" :to="{ name: 'UserProfile' }"
                  >Meu Perfil</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'UserChangePassword' }"
                  >Alterar Senha</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" @click="onLogout">
                  Sair
                </button>
              </li>
            </ul>
          </li>

          <li class="nav-item mt-3">
            <button
              type="button"
              class="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 mx-auto"
              :aria-pressed="isDark.toString()"
              :title="buttonTitle"
              @click="toggle"
            >
              <i :class="iconClass" aria-hidden="true"></i>
              <span>{{ buttonTitle }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="d-none d-lg-flex align-items-center gap-3">
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="btn btn-outline-primary"
        >
          Login
        </router-link>

        <div v-else class="dropdown">
          <a
            id="userMenuDesktop"
            class="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Olá, {{ formattedName }}
          </a>
          <ul
            class="dropdown-menu dropdown-menu-end"
            aria-labelledby="userMenuDesktop"
          >
            <li>
              <router-link class="dropdown-item" :to="{ name: 'UserProfile' }"
                >Meu Perfil</router-link
              >
            </li>
            <li>
              <router-link
                class="dropdown-item"
                :to="{ name: 'UserChangePassword' }"
                >Alterar Senha</router-link
              >
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button class="dropdown-item text-danger" @click="onLogout">
                Sair
              </button>
            </li>
          </ul>
        </div>

        <router-link
          v-if="isAuthenticated"
          :to="{ name: 'NoticesListByUser' }"
          class="position-relative d-inline-block"
          title="Meus avisos"
          style="font-size: 1.8rem"
        >
          <i class="bi bi-envelope"></i>
          <span
            v-if="unreadNotices > 0"
            class="position-absolute badge rounded-pill bg-danger"
            style="font-size: 0.65rem; top: 0.1rem; right: -0.6rem"
          >
            {{ unreadNotices }}
          </span>
        </router-link>

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
  import { useNoticeStore } from '@/stores/notices'
  import { useTheme } from '@/composables/useTheme'

  const router = useRouter()
  const auth = useAuthStore()
  const noticeStore = useNoticeStore()
  const { isDark, iconClass, buttonTitle, toggle } = useTheme()

  const isAuthenticated = computed(() => Boolean(auth?.accessToken))
  const formattedName = computed(() => auth?.formattedName)
  const isUserAdminOrCoord = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'coord'
  })
  const unreadNotices = computed(() => noticeStore.unreadCount)

  async function onLogout() {
    try {
      await auth.logout()
      await router.push({ name: 'Login' })
    } catch (err) {
      console.error('Erro no logout', err)
    }
  }
</script>
