<template>
  <div class="mx-auto mt-4 w-full max-w-lg">
    <h1 class="mb-4 text-2xl font-bold">Redefinir senha</h1>

    <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      Informe sua nova senha abaixo.
    </p>

    <form
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">Nova senha</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input-base w-full pr-11"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.password,
              }"
              required
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showPassword.toString()"
              :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            v-if="errors.password"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.password }}
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Confirmar senha</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input-base w-full pr-11"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.confirmPassword,
              }"
              required
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showConfirmPassword.toString()"
              :title="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            v-if="errors.confirmPassword"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.confirmPassword }}
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
      >
        <BaseSpinner v-if="loading" class="h-4 w-4" />
        Redefinir senha
      </button>
    </form>

    <div class="mt-3">
      <router-link
        :to="{ name: 'Login' }"
        class="text-sm text-primary-600 hover:underline dark:text-primary-400"
      >
        Voltar ao login
      </router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { AuthService } from '@/services/auth.services'
  import { success, error as errorToast } from '@/composables/useToast'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const route = useRoute()
  const router = useRouter()

  const token = route.query.token

  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const loading = ref(false)
  const errors = ref({})

  if (!token) {
    errorToast('Token inválido ou ausente.')
  }

  const schema = yup.object({
    password: yup
      .string()
      .required('A senha é obrigatória')
      .min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'As senhas não coincidem')
      .required('Confirme sua senha'),
  })

  async function handleSubmit() {
    loading.value = true
    errors.value = {}

    try {
      await schema.validate(
        { password: password.value, confirmPassword: confirmPassword.value },
        { abortEarly: false },
      )

      await AuthService.resetPassword({
        token,
        new_password: password.value,
      })

      success('Senha redefinida com sucesso!')
      router.push({ name: 'Login' })
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => {
          errors.value[e.path] = e.message
        })
      } else {
        errorToast(
          err?.response?.data?.detail ||
            'Não foi possível redefinir sua senha.',
        )
      }
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  @reference '../../assets/main.css';

  .input-base {
    @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500;
  }
</style>
