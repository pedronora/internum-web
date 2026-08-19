<template>
  <nav
    class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <router-link
        class="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
        :to="{ name: 'Home' }"
        alt="Home"
      >
        <img
          src="/favicon-96x96.png"
          alt="Logo"
          width="30"
          height="30"
          class="inline-block"
        />
        Internum
      </router-link>

      <button
        type="button"
        class="inline-flex items-center rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 lg:hidden dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        :aria-expanded="mobileOpen.toString()"
        aria-controls="navbarNavDropdown"
        aria-label="Alternar navegação"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-5 w-5"
          aria-hidden="true"
        >
          <path
            v-if="!mobileOpen"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
          <path
            v-else
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
          />
        </svg>
      </button>

      <div
        id="navbarNavDropdown"
        :class="[
          'w-full flex-col lg:flex lg:w-auto lg:flex-1 lg:items-center lg:justify-between',
          mobileOpen ? 'flex' : 'hidden',
        ]"
      >
        <ul
          class="flex flex-col gap-1 lg:ml-0 lg:flex-row lg:items-center lg:gap-1"
        >
          <template v-if="authStore.isAdminOrCoord">
            <li class="relative" data-dropdown>
              <button
                type="button"
                class="nav-item-btn"
                :aria-expanded="(openMenu === 'avisos').toString()"
                @click="toggleMenu('avisos')"
              >
                Avisos
                <ChevronDown />
              </button>
              <Transition name="dd">
                <ul v-if="openMenu === 'avisos'" class="dd-menu">
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'NoticesListByUser' }"
                      @click="closeMenus"
                    >
                      Meus Avisos
                    </router-link>
                  </li>
                  <li class="dd-divider"></li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'NoticesList' }"
                      @click="closeMenus"
                    >
                      Gerir Avisos
                    </router-link>
                  </li>
                </ul>
              </Transition>
            </li>

            <li>
              <router-link
                class="nav-item-btn"
                :to="{ name: 'LegalBriefsList' }"
              >
                Ementas
              </router-link>
            </li>

            <li class="relative" data-dropdown>
              <button
                type="button"
                class="nav-item-btn"
                :aria-expanded="(openMenu === 'biblioteca').toString()"
                @click="toggleMenu('biblioteca')"
              >
                Biblioteca
                <ChevronDown />
              </button>
              <Transition name="dd">
                <ul v-if="openMenu === 'biblioteca'" class="dd-menu">
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'BooksReqList' }"
                      @click="closeMenus"
                    >
                      Acervo
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'MyLoansList' }"
                      @click="closeMenus"
                    >
                      Meus empréstimos
                    </router-link>
                  </li>
                  <li class="dd-divider"></li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'BooksList' }"
                      @click="closeMenus"
                    >
                      Gerenciar Livros
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'AdminLoansList' }"
                      @click="closeMenus"
                    >
                      Gerenciar Empréstimos
                    </router-link>
                  </li>
                </ul>
              </Transition>
            </li>

            <li class="relative" data-dropdown>
              <button
                type="button"
                class="nav-item-btn"
                :aria-expanded="(openMenu === 'rh').toString()"
                @click="toggleMenu('rh')"
              >
                RH
                <ChevronDown />
              </button>
              <Transition name="dd">
                <ul v-if="openMenu === 'rh'" class="dd-menu">
                  <li class="group/sub relative">
                    <button
                      type="button"
                      class="dd-item flex w-full items-center justify-between"
                    >
                      Usuários
                      <ChevronRight />
                    </button>
                    <ul
                      class="invisible absolute left-full top-0 ml-1 w-56 rounded-lg border border-slate-200 bg-white p-1 opacity-0 shadow-lg transition group-hover/sub:visible group-hover/sub:opacity-100 dark:border-slate-600 dark:bg-slate-800"
                    >
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'UsersList' }"
                          @click="closeMenus"
                        >
                          Listar Usuários
                        </router-link>
                      </li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'UsersCreate' }"
                          @click="closeMenus"
                        >
                          Cadastrar Usuário
                        </router-link>
                      </li>
                    </ul>
                  </li>
                  <li class="group/sub relative">
                    <button
                      type="button"
                      class="dd-item flex w-full items-center justify-between"
                    >
                      Férias
                      <ChevronRight />
                    </button>
                    <ul
                      class="invisible absolute left-full top-0 ml-1 w-56 rounded-lg border border-slate-200 bg-white p-1 opacity-0 shadow-lg transition group-hover/sub:visible group-hover/sub:opacity-100 dark:border-slate-600 dark:bg-slate-800"
                    >
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationMyVacation' }"
                          @click="closeMenus"
                        >
                          Minhas Férias
                        </router-link>
                      </li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationRequestsCreate' }"
                          @click="closeMenus"
                        >
                          Nova Solicitação
                        </router-link>
                      </li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationRequestsList' }"
                          @click="closeMenus"
                        >
                          Minhas Solicitações
                        </router-link>
                      </li>
                      <li class="dd-divider"></li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationAdminRequestsList' }"
                          @click="closeMenus"
                        >
                          Gerir Solicitações
                        </router-link>
                      </li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationAdminGrantsList' }"
                          @click="closeMenus"
                        >
                          Gerir Concessões
                        </router-link>
                      </li>
                      <li>
                        <router-link
                          class="dd-item"
                          :to="{ name: 'VacationAdminAlerts' }"
                          @click="closeMenus"
                        >
                          Alertas de Férias
                        </router-link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </Transition>
            </li>
          </template>

          <template v-else-if="isAuthenticated">
            <li>
              <router-link
                class="nav-item-btn"
                :to="{ name: 'NoticesListByUser' }"
              >
                Avisos
              </router-link>
            </li>
            <li>
              <router-link
                class="nav-item-btn"
                :to="{ name: 'LegalBriefsList' }"
              >
                Ementas
              </router-link>
            </li>
            <li class="relative" data-dropdown>
              <button
                type="button"
                class="nav-item-btn"
                :aria-expanded="(openMenu === 'biblioteca-user').toString()"
                @click="toggleMenu('biblioteca-user')"
              >
                Biblioteca
                <ChevronDown />
              </button>
              <Transition name="dd">
                <ul v-if="openMenu === 'biblioteca-user'" class="dd-menu">
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'BooksReqList' }"
                      @click="closeMenus"
                    >
                      Acervo
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'MyLoansList' }"
                      @click="closeMenus"
                    >
                      Meus empréstimos
                    </router-link>
                  </li>
                </ul>
              </Transition>
            </li>
            <li class="relative" data-dropdown>
              <button
                type="button"
                class="nav-item-btn"
                :aria-expanded="(openMenu === 'ferias-user').toString()"
                @click="toggleMenu('ferias-user')"
              >
                Férias
                <ChevronDown />
              </button>
              <Transition name="dd">
                <ul v-if="openMenu === 'ferias-user'" class="dd-menu">
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'VacationMyVacation' }"
                      @click="closeMenus"
                    >
                      Minhas Férias
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'VacationRequestsCreate' }"
                      @click="closeMenus"
                    >
                      Nova Solicitação
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      class="dd-item"
                      :to="{ name: 'VacationRequestsList' }"
                      @click="closeMenus"
                    >
                      Minhas Solicitações
                    </router-link>
                  </li>
                </ul>
              </Transition>
            </li>
          </template>
        </ul>

        <ul
          class="flex flex-col gap-2 border-t border-slate-200 pt-3 text-center lg:hidden dark:border-slate-700"
        >
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link
              class="nav-item-btn justify-center"
              :to="{ name: 'Login' }"
            >
              Login
            </router-link>
          </li>

          <li v-else class="relative" data-dropdown>
            <button
              id="userMenuMobile"
              type="button"
              class="nav-item-btn w-full justify-center"
              :aria-expanded="(openMenu === 'user-mobile').toString()"
              @click="toggleMenu('user-mobile')"
            >
              Olá, {{ authStore?.formattedName }}
              <ChevronDown />
            </button>
            <Transition name="dd">
              <ul
                v-if="openMenu === 'user-mobile'"
                class="dd-menu inset-x-0 mx-auto w-56"
                aria-labelledby="userMenuMobile"
              >
                <li>
                  <router-link
                    class="dd-item"
                    :to="{ name: 'UserProfile' }"
                    @click="closeMenus"
                  >
                    Meu Perfil
                  </router-link>
                </li>
                <li>
                  <router-link
                    class="dd-item"
                    :to="{ name: 'UserChangePassword' }"
                    @click="closeMenus"
                  >
                    Alterar Senha
                  </router-link>
                </li>
                <li class="dd-divider"></li>
                <li>
                  <button
                    type="button"
                    class="dd-item w-full text-left text-red-600 dark:text-red-400"
                    @click="onLogout"
                  >
                    Sair
                  </button>
                </li>
              </ul>
            </Transition>
          </li>

          <li class="mt-1">
            <button
              type="button"
              class="theme-btn mx-auto"
              :aria-pressed="isDark.toString()"
              :title="buttonTitle"
              @click="toggle"
            >
              <Icon :name="icon" aria-hidden="true" />
              <span>{{ buttonTitle }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="hidden items-center gap-3 lg:flex">
        <router-link
          v-if="!isAuthenticated"
          :to="{ name: 'Login' }"
          class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          Login
        </router-link>

        <div v-else class="relative" data-dropdown>
          <button
            id="userMenuDesktop"
            type="button"
            class="nav-item-btn"
            :aria-expanded="(openMenu === 'user-desktop').toString()"
            @click="toggleMenu('user-desktop')"
          >
            Olá, {{ authStore?.formattedName }}
            <ChevronDown />
          </button>
          <Transition name="dd">
            <ul
              v-if="openMenu === 'user-desktop'"
              class="dd-menu right-0"
              aria-labelledby="userMenuDesktop"
            >
              <li>
                <router-link
                  class="dd-item"
                  :to="{ name: 'UserProfile' }"
                  @click="closeMenus"
                >
                  Meu Perfil
                </router-link>
              </li>
              <li>
                <router-link
                  class="dd-item"
                  :to="{ name: 'UserChangePassword' }"
                  @click="closeMenus"
                >
                  Alterar Senha
                </router-link>
              </li>
              <li class="dd-divider"></li>
              <li>
                <button
                  type="button"
                  class="dd-item w-full text-left text-red-600 dark:text-red-400"
                  @click="onLogout"
                >
                  Sair
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <router-link
          v-if="isAuthenticated"
          :to="{ name: 'NoticesListByUser' }"
          class="relative inline-flex text-slate-600 transition hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
          title="Meus avisos"
        >
          <Icon name="envelope" class="h-7 w-7" aria-hidden="true" />
          <span
            v-if="noticeStore.unreadCount > 0"
            class="absolute -right-2 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
          >
            {{ noticeStore.unreadCount }}
          </span>
        </router-link>

        <button
          type="button"
          class="theme-btn"
          :aria-pressed="isDark.toString()"
          :title="buttonTitle"
          @click="toggle"
        >
          <Icon :name="icon" aria-hidden="true" />
          <span class="sr-only">{{ buttonTitle }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, h } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useNoticeStore } from '@/stores/notices'
  import { useTheme } from '@/composables/useTheme'
  import Icon from '@/components/Icon.vue'

  const router = useRouter()
  const authStore = useAuthStore()
  const noticeStore = useNoticeStore()
  const { isDark, icon, buttonTitle, toggle } = useTheme()

  const isAuthenticated = computed(() => Boolean(authStore?.accessToken))

  const mobileOpen = ref(false)
  const openMenu = ref(null)

  function toggleMenu(name) {
    openMenu.value = openMenu.value === name ? null : name
  }

  function closeMenus() {
    openMenu.value = null
    mobileOpen.value = false
  }

  function onDocClick(e) {
    if (openMenu.value && !e.target.closest('[data-dropdown]')) {
      openMenu.value = null
    }
  }

  onMounted(() => document.addEventListener('click', onDocClick))
  onUnmounted(() => document.removeEventListener('click', onDocClick))

  function ChevronDown() {
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        fill: 'currentColor',
        class: 'h-3 w-3 shrink-0',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          d: 'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708',
        }),
      ],
    )
  }

  function ChevronRight() {
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        fill: 'currentColor',
        class: 'h-3 w-3 shrink-0',
        'aria-hidden': 'true',
      },
      [
        h('path', {
          d: 'M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671',
        }),
      ],
    )
  }

  async function onLogout() {
    try {
      await authStore.logout()
      await router.push({ name: 'Login' })
    } catch (err) {
      console.error('Erro no logout', err)
    }
  }
</script>

<style scoped>
  @reference '../assets/main.css';

  .nav-item-btn {
    @apply inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-primary-400;
  }

  .dd-menu {
    @apply absolute left-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-600 dark:bg-slate-800;
  }

  .dd-item {
    @apply block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white;
  }

  .dd-divider {
    @apply my-1 border-t border-slate-200 dark:border-slate-600;
  }

  .theme-btn {
    @apply inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800;
  }

  .dd-enter-active,
  .dd-leave-active {
    transition:
      opacity 0.1s ease,
      transform 0.1s ease;
  }

  .dd-enter-from,
  .dd-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
