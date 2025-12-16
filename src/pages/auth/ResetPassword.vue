<template>
  <div class="container mt-4" style="max-width: 600px">
    <h1 class="mb-4">Redefinir senha</h1>

    <p class="text-muted">Informe sua nova senha abaixo.</p>

    <form class="card shadow-sm p-3" @submit.prevent="handleSubmit">
      <div class="row g-3">
        <!-- Nova Senha -->
        <div class="col-md-6">
          <label class="form-label">Nova senha</label>

          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              required
            />

            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>

            <div v-if="errors.password" class="invalid-feedback d-block">
              {{ errors.password }}
            </div>
          </div>
        </div>

        <!-- Confirmar Senha -->
        <div class="col-md-6">
          <label class="form-label">Confirmar senha</label>

          <div class="input-group">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              required
            />

            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
              ></i>
            </button>

            <div v-if="errors.confirmPassword" class="invalid-feedback d-block">
              {{ errors.confirmPassword }}
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary mt-3 w-100" :disabled="loading">
        <span
          v-if="loading"
          class="spinner-border spinner-border-sm me-1"
        ></span>
        Redefinir senha
      </button>
    </form>

    <div class="mt-3">
      <router-link :to="{ name: 'Login' }">Voltar ao login</router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { AuthService } from '@/services/auth.services'
  import { success, error as errorToast } from '@/composables/useToast'
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
  .btn-outline-secondary {
    border: 1px solid var(--bs-border-color);
    border-left: 0;
  }
</style>
