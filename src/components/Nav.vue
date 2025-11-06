<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top shadow">
    <div class="container-fluid">
      <!-- LOGO / HOME -->
      <router-link class="navbar-brand" :to="{ name: 'Home' }" alt="Home">
        Internum
      </router-link>

      <!-- BOTÃO HAMBURGUER -->
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

      <!-- CONTEÚDO COLAPSÁVEL -->
      <div id="navbarNavDropdown" class="collapse navbar-collapse">
        <!-- MENU PRINCIPAL ADMIN/COORD -->
        <ul v-if="isUserAdminOrCoord" class="navbar-nav me-auto">
          <li class="nav-item dropdown">
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
              <li><hr class="dropdown-divider" /></li>
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

          <li class="nav-item">
            <router-link
              class="nav-link"
              aria-current="page"
              :to="{ name: 'LegalBriefsList' }"
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
              >Biblioteca</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'BooksReqList' }"
                  >Acervo</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'MyLoansList' }"
                  >Meus empréstimos</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'BooksList' }"
                  >Gerenciar Livros</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'AdminLoansList' }"
                  >Gerenciar Empréstimos</router-link
                >
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

        <!-- MENU PRINCIPAL USUÁRIO PADRÃO -->
        <ul v-else-if="isAuthenticated" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link
              class="nav-link"
              aria-current="page"
              :to="{ name: 'NoticesListByUser' }"
              >Avisos</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              aria-current="page"
              :to="{ name: 'LegalBriefsList' }"
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
              >Biblioteca</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'BooksReqList' }"
                  >Acervo</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  aria-current="page"
                  :to="{ name: 'MyLoansList' }"
                  >Meus empréstimos</router-link
                >
              </li>
            </ul>
          </li>
        </ul>

        <!-- BLOCO DE LOGIN/LOGOUT MOBILE -->
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
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'UserProfile' }"
                >
                  Meu Perfil
                </router-link>
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  :to="{ name: 'UserChangePassword' }"
                >
                  Alterar Senha
                </router-link>
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
              style="width: auto"
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

      <!-- BLOCO DE LOGIN/LOGOUT DESKTOP -->
      <div class="d-none d-lg-flex align-items-center gap-2">
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="btn btn-outline-primary me-2"
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
              <router-link class="dropdown-item" :to="{ name: 'UserProfile' }">
                Meu Perfil
              </router-link>
            </li>
            <li>
              <router-link
                class="dropdown-item"
                :to="{ name: 'UserChangePassword' }"
              >
                Alterar Senha
              </router-link>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button class="dropdown-item text-danger" @click="onLogout">
                Sair
              </button>
            </li>
          </ul>
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

  const router = useRouter()
  const auth = useAuthStore()
  const { isDark, iconClass, buttonTitle, toggle } = useTheme()

  const isAuthenticated = computed(() => Boolean(auth?.accessToken))
  const formattedName = computed(() => auth?.formattedName)

  const isUserAdminOrCoord = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'coord'
  })

  async function onLogout() {
    try {
      await auth.logout()
      await router.push({ name: 'Login' })
    } catch (err) {
      console.error('Erro no logout', err)
    }
  }
</script>
