<template>
  <div class="mx-auto mt-4 w-full max-w-md">
    <h1 class="mb-4 text-2xl font-bold">Recuperar senha</h1>

    <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      Informe seu e-mail e enviaremos um link para redefinir sua senha.
    </p>

    <form
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="handleSubmit"
    >
      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium">E-mail</label>
        <input
          v-model="email"
          type="email"
          class="input-base"
          :class="{
            'border-red-500 focus:border-red-500 focus:ring-red-500/40':
              errors.email,
          }"
          required
        />
        <div
          v-if="errors.email"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ errors.email }}
        </div>
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
      >
        <BaseSpinner v-if="loading" class="h-4 w-4" />
        Enviar link de recuperação
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
  import { AuthService } from '@/services/auth.services'
  import { success, error as errorToast } from '@/composables/useToast'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const email = ref('')
  const loading = ref(false)
  const errors = ref({})

  const schema = yup.object({
    email: yup.string().email('E-mail inválido').required('Informe o e-mail'),
  })

  async function handleSubmit() {
    loading.value = true
    errors.value = {}

    try {
      await schema.validate({ email: email.value }, { abortEarly: false })

      await AuthService.forgotPassword({ email: email.value })

      success('Se o e-mail existir, enviaremos um link de recuperação.')
      email.value = ''
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => {
          errors.value[e.path] = e.message
        })
      } else {
        errorToast(
          err?.response?.data?.detail ||
            'Não foi possível enviar o e-mail de recuperação.',
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
