<template>
  <div class="container mt-4">
    <h1 class="mb-4">Meu Perfil</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading && !loadedOnce" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <form v-if="loadedOnce" class="card shadow-sm p-3" @submit.prevent="submit">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Nome</label>
          <input
            v-model="form.name"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
          />
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>

        <div class="col-md-4">
          <label class="form-label">Username</label>
          <input
            v-model="form.username"
            required
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
          />
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <div class="col-md-4">
          <label class="form-label">Setor</label>
          <select
            v-model="form.setor"
            class="form-select"
            :disabled="!canEditRestrictedFields"
          >
            <option v-for="s in setorOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Subsetor</label>
          <select
            v-model="form.subsetor"
            class="form-select"
            :disabled="!canEditRestrictedFields"
          >
            <option
              v-for="option in subsetorOptions[form.setor]"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Perfil</label>
          <select
            v-model="form.role"
            class="form-select"
            :disabled="!canEditRestrictedFields"
          >
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>

        <div class="col-12 d-flex align-items-center gap-3">
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-primary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { UsersService } from '@/services/users.services.js'
  import { useAuthStore } from '@/stores/auth.js'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import * as yup from 'yup'

  // ======= Estados =======
  const auth = useAuthStore()
  const loading = ref(false)
  const loadedOnce = ref(false)
  const error = ref(null)
  const errors = ref({})

  // ======= Permissão =======
  const canEditRestrictedFields = computed(() =>
    ['admin', 'coord'].includes(auth.user?.role),
  )

  // ======= Opções estáticas =======
  const setorOptions = [
    { value: 'registro', label: 'Registro' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'oficial', label: 'Oficial' },
  ]

  const subsetorOptions = {
    registro: [
      { value: 'Análise', label: 'Análise' },
      { value: 'Conferência', label: 'Conferência' },
      { value: 'Finalização/Impressão', label: 'Finalização/Impressão' },
      { value: 'Busca e Certidão', label: 'Busca e Certidão' },
      { value: 'Arquivo', label: 'Arquivo' },
    ],
    administrativo: [
      { value: 'Atendimento', label: 'Atendimento' },
      { value: 'Digitalização', label: 'Digitalização' },
      { value: 'Apoio', label: 'Apoio' },
    ],
    oficial: [
      { value: 'Titular', label: 'Titular' },
      { value: 'Substituto', label: 'Substituto' },
    ],
  }

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'coord', label: 'Coordenador' },
    { value: 'user', label: 'Geral' },
  ]

  // ======= Formulário =======
  const form = ref({
    id: '',
    name: '',
    username: '',
    email: '',
    setor: setorOptions[0].value,
    subsetor: '',
    role: 'user',
    active: true,
  })

  // ======= Validação Yup =======
  const schema = yup.object({
    name: yup.string().required('O nome é obrigatório'),
    email: yup
      .string()
      .email('E-mail inválido')
      .required('O e-mail é obrigatório'),
  })

  // ======= Carregar dados =======
  async function load() {
    loading.value = true
    error.value = null
    try {
      const { data } = await UsersService.me()
      form.value = {
        id: data.id,
        name: data.name ?? '',
        username: data.username ?? '',
        email: data.email ?? '',
        setor: data.setor ?? setorOptions[0].value,
        subsetor: data.subsetor ?? '',
        role: data.role ?? 'user',
        active: data.active ?? true,
      }
      loadedOnce.value = true
    } catch (err) {
      console.error(err)
      error.value =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro ao carregar dados do usuário'
    } finally {
      loading.value = false
    }
  }

  // ======= Atualizar =======
  async function submit() {
    loading.value = true
    errors.value = {}

    try {
      await schema.validate(form.value, { abortEarly: false })

      let payload = { ...form.value }

      if (!canEditRestrictedFields.value) {
        const restricted = ['role', 'setor', 'subsetor', 'active']
        restricted.forEach((field) => delete payload[field])
      }

      await UsersService.update(form.value.id, payload)
      successToast('Perfil atualizado com sucesso!')
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
            'Erro ao atualizar perfil',
        )
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
</script>
