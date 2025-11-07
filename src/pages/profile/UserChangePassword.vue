<template>
  <div class="container mt-4">
    <h1 class="mb-4">Alterar senha</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading && !loadedOnce" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <form
      v-if="loadedOnce"
      class="card shadow-sm p-3"
      @submit.prevent="submitForm"
    >
      <div class="row g-3">
        <!-- Senha atual -->
        <div class="col-md-4 position-relative">
          <label class="form-label">Senha atual</label>
          <div class="input-group">
            <input
              v-model="form.oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              required
              class="form-control"
              :class="{ 'is-invalid': errors.oldPassword }"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-pressed="showOldPassword.toString()"
              :disabled="loading"
              :title="showOldPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showOldPassword = !showOldPassword"
            >
              <i
                :class="showOldPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <div v-if="errors.oldPassword" class="invalid-feedback">
            {{ errors.oldPassword }}
          </div>
        </div>

        <!-- Nova senha -->
        <div class="col-md-4 position-relative">
          <label class="form-label">Nova senha</label>
          <div class="input-group">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              class="form-control"
              :class="{ 'is-invalid': errors.newPassword }"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-pressed="showNewPassword.toString()"
              :disabled="loading"
              :title="showNewPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showNewPassword = !showNewPassword"
            >
              <i
                :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <div v-if="errors.newPassword" class="invalid-feedback">
            {{ errors.newPassword }}
          </div>
        </div>

        <!-- Confirmar senha -->
        <div class="col-md-4 position-relative">
          <label class="form-label">Confirmar nova senha</label>
          <div class="input-group">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-pressed="showConfirmPassword.toString()"
              :disabled="loading"
              :title="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="invalid-feedback">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <!-- Botões -->
        <div class="col-12 d-flex align-items-center gap-3">
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-primary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              Alterar senha
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="goBack"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { UsersService } from '@/services/users.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import * as yup from 'yup'

  // ======= Estados =======
  const auth = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const loadedOnce = ref(false)
  const error = ref(null)
  const errors = ref({})

  // ======= Formulário =======
  const form = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // ======= Mostrar/ocultar senha =======
  const showOldPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  // ======= Validação com Yup =======
  const schema = yup.object({
    oldPassword: yup.string().required('A senha atual é obrigatória'),
    newPassword: yup
      .string()
      .required('A nova senha é obrigatória')
      .min(8, 'A senha deve ter entre 8 e 64 caracteres')
      .max(64, 'A senha deve ter entre 8 e 64 caracteres')
      .matches(/\d/, 'A senha deve conter pelo menos um dígito')
      .matches(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .matches(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .matches(
        /[^a-zA-Z0-9]/,
        'A senha deve conter pelo menos um caractere especial',
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'As senhas não coincidem')
      .required('Confirmação da senha é obrigatória'),
  })

  // ======= Funções =======
  function goBack() {
    router.back()
  }

  async function submitForm() {
    loading.value = true
    errors.value = {}
    error.value = null

    try {
      await schema.validate(form.value, { abortEarly: false })

      await UsersService.changePassword(
        auth.user.id,
        form.value.oldPassword,
        form.value.newPassword,
      )

      successToast('Senha alterada com sucesso!')
      form.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => {
          errors.value[e.path] = e.message
        })
      } else {
        console.error(err)
        errorToast(
          err?.response?.data?.detail ||
            err?.message ||
            'Erro ao alterar senha',
        )
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadedOnce.value = true
  })
</script>

<style scoped>
  .btn-outline-secondary {
    border: 1px solid var(--bs-border-color);
    border-left: 0;
  }
</style>
