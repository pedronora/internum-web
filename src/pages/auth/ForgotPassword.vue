<template>
  <div class="container mt-4" style="max-width: 500px">
    <h1 class="mb-4">Recuperar senha</h1>

    <p class="text-muted mb-4">
      Informe seu e-mail e enviaremos um link para redefinir sua senha.
    </p>

    <form class="card shadow-sm p-3" @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label">E-mail</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          required
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <button class="btn btn-primary w-100" :disabled="loading">
        <span
          v-if="loading"
          class="spinner-border spinner-border-sm me-1"
        ></span>
        Enviar link de recuperação
      </button>
    </form>

    <div class="mt-3">
      <router-link to="/login">Voltar ao login</router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { AuthService } from '@/services/auth.services'
  import { success, error as errorToast } from '@/composables/useToast'
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
