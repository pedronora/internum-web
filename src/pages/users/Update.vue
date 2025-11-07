<template>
  <div class="container mt-4">
    <h1 class="mb-4">Editar Usuário</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loadingData" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <form v-else class="card shadow-sm p-3" @submit.prevent="submit">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Nome</label>
          <input v-model="form.name" required class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Username</label>
          <input v-model="form.username" required class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="form-control"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">Data de Nascimento</label>
          <input
            v-model="form.birthday"
            type="date"
            required
            class="form-control"
          />
        </div>

        <div class="col-md-4">
          <label class="form-label">Setor</label>
          <select v-model="form.setor" class="form-select" required>
            <option disabled value="">Selecione...</option>
            <option v-for="s in setorOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Subsetor</label>
          <select v-model="form.subsetor" class="form-select" required>
            <option disabled value="">Selecione...</option>
            <option
              v-for="option in subsetorOptions[form.setor] || []"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4">
          <label class="form-label">Perfil</label>
          <select v-model="form.role" class="form-select" required>
            <option disabled value="">Selecione...</option>
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>

        <div class="col-md-4 d-flex align-items-end">
          <div class="form-check form-switch mb-2">
            <input
              id="activeSwitch"
              v-model="form.active"
              class="form-check-input"
              type="checkbox"
              role="switch"
            />
            <label class="form-check-label" for="activeSwitch">Ativo</label>
          </div>
        </div>

        <div class="col-12 d-flex gap-2 justify-content-end">
          <router-link
            :to="{ name: 'UsersList' }"
            class="btn btn-outline-secondary"
          >
            Cancelar
          </router-link>
          <button class="btn btn-primary" :disabled="loadingSubmit">
            <span
              v-if="loadingSubmit"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            Salvar Alterações
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  // Importações de Vue e Vue Router
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  // Importações de Serviços e utilitários
  import { UsersService } from '@/services/users.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import * as yup from 'yup'

  const router = useRouter()
  const route = useRoute()
  const userId = route.params.id // Captura o ID da rota

  // Estados de carregamento
  const loadingData = ref(true) // Carregamento inicial dos dados
  const loadingSubmit = ref(false) // Carregamento do envio do formulário
  const error = ref(null)

  // Opções dos selects (idem ao Create.vue)
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
    { value: 'admin', label: 'Administrador' },
    { value: 'coord', label: 'Coordenador' },
    { value: 'user', label: 'Geral' },
  ]

  // Schema de validação SEM os campos de senha
  const validationSchema = yup.object({
    name: yup
      .string()
      .required('O nome é obrigatório')
      .min(4, 'O nome deve ter pelo menos 4 caracteres'),

    username: yup
      .string()
      .required('O username é obrigatório')
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'O username só pode conter letras, números e underscore',
      )
      .min(4, 'O username deve ter pelo menos 4 caracteres'),

    email: yup
      .string()
      .email('O email deve ser válido')
      .required('O email é obrigatório'),

    birthday: yup
      .date()
      .required('A data de nascimento é obrigatória')
      .max(new Date(), 'A data de nascimento não pode ser futura'),

    setor: yup.string().required('O setor é obrigatório'),
    subsetor: yup.string().required('O subsetor é obrigatório'),
    role: yup.string().required('O perfil é obrigatório'),
    active: yup.boolean(),
  })

  // Definição do formulário SEM os campos de senha
  const form = ref({
    name: '',
    username: '',
    email: '',
    birthday: '',
    setor: '',
    subsetor: '',
    role: '',
    active: true,
  })

  // Função para formatar data (API 2023-10-01T00:00:00 -> HTML 2023-10-01)
  function formatDateForInput(dateString) {
    if (!dateString) return ''
    return dateString.split('T')[0]
  }

  // Carrega os dados do usuário ao montar o componente
  onMounted(async () => {
    loadingData.value = true
    error.value = null
    try {
      // Assume que UsersService.getById(id) existe
      const userData = await UsersService.getById(userId)

      // Preenche o formulário com os dados do usuário
      form.value.name = userData.name
      form.value.username = userData.username
      form.value.email = userData.email
      form.value.birthday = formatDateForInput(userData.birthday)
      form.value.setor = userData.setor
      form.value.subsetor = userData.subsetor
      form.value.role = userData.role
      form.value.active = userData.active
    } catch (err) {
      console.error(err)
      error.value = 'Erro ao carregar os dados do usuário. Tente novamente.'
      errorToast(
        err?.response?.data?.detail ||
          err.message ||
          'Erro ao carregar usuário',
      )
      // Redireciona se não encontrar o usuário
      router.push({ name: 'UsersList' })
    } finally {
      loadingData.value = false
    }
  })

  // Função de envio do formulário
  async function submit() {
    error.value = null

    // Validação
    try {
      await validationSchema.validate(form.value, { abortEarly: false })
    } catch (validationError) {
      if (validationError.inner?.length) {
        validationError.inner.forEach((e) => errorToast(e.message))
        return
      }
      error.value = validationError.message
      return
    }

    loadingSubmit.value = true
    try {
      // Chama o serviço de UPDATE passando o ID e o formulário
      await UsersService.update(userId, { ...form.value })
      successToast('Usuário atualizado com sucesso.')
      router.push({ name: 'UsersList' }) // Redireciona para a lista
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message ||
          'Erro ao atualizar usuário',
      )
    } finally {
      loadingSubmit.value = false
    }
  }
</script>

<style scoped></style>
