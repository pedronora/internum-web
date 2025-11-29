<template>
  <section
    class="d-flex align-items-center justify-content-center my-login-section"
  >
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-md-9 col-lg-6 col-xl-5 d-none d-md-block">
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          class="img-fluid"
          alt="Ilustração"
        />
      </div>

      <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
        <form novalidate @submit.prevent="onSubmit">
          <h1 class="text-center">Internum</h1>
          <h2 class="text-center small text-muted">1º RI de Cascavel/PR</h2>

          <div class="divider d-flex align-items-center my-4">
            <p class="text-center fw-bold mx-3 mb-0">Entrar</p>
          </div>

          <div class="form-outline mb-4">
            <input
              id="userInput"
              v-model.trim="username"
              type="text"
              class="form-control form-control-lg"
              placeholder="Insira o seu usuário"
              :disabled="loading"
              required
              autocomplete="username"
            />
            <label class="form-label" for="userInput">Usuário</label>
          </div>

          <div class="form-outline mb-3">
            <div class="input-group">
              <input
                id="pwdInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control form-control-lg"
                placeholder="Insira sua senha"
                :disabled="loading"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                :aria-pressed="showPassword.toString()"
                :disabled="loading"
                :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <i
                  :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            <label class="form-label mt-2" for="pwdInput">Senha</label>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <button
              type="submit"
              class="btn btn-primary btn-lg px-5"
              :disabled="loading"
            >
              <span v-if="!loading">Entrar</span>
              <span v-else>
                <span
                  class="spinner-border spinner-border-sm"
                  role="status"
                ></span>
                &nbsp;Entrando...
              </span>
            </button>

            <router-link
              :to="{ name: 'forgot-password' }"
              class="text-decoration-none small text-muted ms-3"
            >
              <i class="bi bi-key me-1"></i>
              Esqueci minha senha
            </router-link>
          </div>

          <div v-if="error" class="mt-3">
            <p class="alert alert-danger text-center" role="alert">
              {{ error }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

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
  .divider:after,
  .divider:before {
    content: '';
    flex: 1;
    height: 1px;
    background: #eee;
  }

  .btn-outline-secondary {
    border: 1px solid var(--bs-border-color);
    border-left: 0;
  }

  .my-login-section {
    min-height: 70vh;
  }
</style>
