<template>
  <section class="flex min-h-[70vh] items-center justify-center">
    <div class="w-full max-w-md">
      <form
        novalidate
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 dark:border-slate-700 dark:bg-slate-800"
        @submit.prevent="onSubmit"
      >
        <div class="mb-6 flex flex-col items-center gap-2 text-center">
          <img
            src="/favicon-96x96.png"
            alt="Logo Internum"
            width="56"
            height="56"
            class="rounded-2xl"
          />
          <h1 class="mt-1 text-2xl font-bold">Internum</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            1º RI de Cascavel/PR
          </p>
        </div>

        <div class="divider mb-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
          <p
            class="mb-0 text-sm font-semibold text-slate-500 dark:text-slate-400"
          >
            Entrar
          </p>
          <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
        </div>

        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium" for="userInput">
            Usuário
          </label>
          <input
            id="userInput"
            v-model.trim="username"
            type="text"
            class="input-base"
            placeholder="Insira o seu usuário"
            :disabled="loading"
            required
            autocomplete="username"
          />
        </div>

        <div class="mb-6">
          <label class="mb-1 block text-sm font-medium" for="pwdInput">
            Senha
          </label>
          <div class="relative">
            <input
              id="pwdInput"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input-base w-full pr-11"
              placeholder="Insira sua senha"
              :disabled="loading"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showPassword.toString()"
              :disabled="loading"
              :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <button
            type="submit"
            class="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
          >
            <span v-if="!loading">Entrar</span>
            <span v-else class="inline-flex items-center gap-2">
              <BaseSpinner class="h-4 w-4" />
              Entrando...
            </span>
          </button>

          <router-link
            :to="{ name: 'forgot-password' }"
            class="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
          >
            <Icon name="key" class="h-3.5 w-3.5" aria-hidden="true" />
            Esqueci minha senha
          </router-link>
        </div>

        <div v-if="error" class="mt-4">
          <p
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
          >
            {{ error }}
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'

  const username = ref('')
  const password = ref('')
  const error = ref(null)
  const loading = ref(false)
  const showPassword = ref(false)

  const router = useRouter()
  const auth = useAuthStore()

  const onSubmit = async () => {
    error.value = null

    if (!username.value || !password.value) {
      error.value = 'Preencha usuário e senha.'
      return
    }

    loading.value = true
    try {
      await auth.login({ username: username.value, password: password.value })

      const next = router.currentRoute.value.query.next || '/'
      await router.push(next)
    } catch (err) {
      const apiDetail = err.response?.data?.detail
      const apiMessage = err.response?.data?.message

      let errorMessage = 'Erro ao autenticar. Tente novamente.'

      if (apiDetail) {
        errorMessage = apiDetail
      } else if (apiMessage) {
        errorMessage = apiMessage
      } else if (err.response?.status === 401) {
        errorMessage = 'Nome de usuário ou senha inválidos.'
      }

      error.value = errorMessage
    } finally {
      loading.value = false
      password.value = ''
    }
  }
</script>

<style scoped>
  @reference '../../assets/main.css';

  .input-base {
    @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-primary-500;
  }
</style>
