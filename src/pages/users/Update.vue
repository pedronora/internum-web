<template>
  <div class="mt-4">
    <h1 class="mb-4 text-2xl font-bold">Editar Usuário</h1>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-if="loadingData"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <form
      v-else
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Nome</label
          >
          <input
            v-model="form.name"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Username</label
          >
          <input
            v-model="form.username"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            for="cpf"
            >CPF</label
          >
          <input
            id="cpf"
            v-model="cpfDisplay"
            type="text"
            required
            maxlength="14"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            placeholder="000.000.000-00"
            @blur="validarCampoCPF"
          />
          <div
            v-if="cpfError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ cpfError }}
          </div>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Data de Nascimento</label
          >
          <input
            v-model="form.birthday"
            type="date"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Data de Admissão</label
          >
          <input
            v-model="form.hiring_date"
            type="date"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Setor</label
          >
          <select
            v-model="form.setor"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            required
          >
            <option disabled value="">Selecione...</option>
            <option v-for="s in setorOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Subsetor</label
          >
          <select
            v-model="form.subsetor"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            required
          >
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

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Perfil</label
          >
          <select
            v-model="form.role"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            required
          >
            <option disabled value="">Selecione...</option>
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>

        <div class="flex items-end">
          <div class="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              :aria-checked="form.active"
              class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition"
              :class="
                form.active
                  ? 'bg-primary-600'
                  : 'bg-slate-300 dark:bg-slate-600'
              "
              @click="form.active = !form.active"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
                :class="form.active ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
            <label
              class="cursor-pointer select-none text-sm font-medium text-slate-700 dark:text-slate-200"
              @click="form.active = !form.active"
            >
              Ativo
            </label>
          </div>
        </div>

        <div v-if="!form.active">
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Data de Rescisão</label
          >
          <input
            v-model="form.termination_date"
            type="date"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <router-link
          :to="{ name: 'UsersList' }"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancelar
        </router-link>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loadingSubmit"
        >
          <BaseSpinner v-if="loadingSubmit" class="h-4 w-4" />
          Salvar Alterações
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
  // Importações de Vue e Vue Router
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  // Importações de Serviços e utilitários
  import { UsersService } from '@/services/users.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useCPF } from '@/composables/useCPF'
  import { useDate } from '@/composables/useDate'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const router = useRouter()
  const route = useRoute()
  const userId = route.params.id // Captura o ID da rota

  // Estados de carregamento
  const loadingData = ref(true) // Carregamento inicial dos dados
  const loadingSubmit = ref(false) // Carregamento do envio do formulário
  const error = ref(null)
  const { cpf, cpfError, cpfDisplay, validarCampoCPF, setCPF } = useCPF()
  const { toInputDate } = useDate()

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

  function getTodayForInput() {
    return toInputDate(new Date())
  }

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

    hiring_date: yup.date().required('A data de admissão é obrigatória'),
    termination_date: yup
      .date()
      .transform((value, originalValue) =>
        originalValue === '' ? null : value,
      )
      .nullable()
      .when('active', {
        is: false,
        then: (schema) =>
          schema.required(
            'A data de rescisão é obrigatória para contratos inativos',
          ),
        otherwise: (schema) => schema.notRequired(),
      }),

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
    hiring_date: '',
    termination_date: '',
    setor: '',
    subsetor: '',
    role: '',
    active: true,
  })

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
      form.value.birthday = toInputDate(userData.birthday)
      form.value.hiring_date = toInputDate(userData.hiring_date)
      form.value.termination_date = toInputDate(userData.termination_date)
      form.value.setor = userData.setor
      form.value.subsetor = userData.subsetor
      form.value.role = userData.role
      form.value.active = userData.active
      setCPF(userData.cpf)
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

    if (!validarCampoCPF()) {
      errorToast(cpfError.value)
      return
    }

    loadingSubmit.value = true
    try {
      const payload = {
        name: form.value.name,
        username: form.value.username,
        cpf: cpf.value,
        email: form.value.email,
        birthday: form.value.birthday,
        hiring_date: form.value.hiring_date,
        setor: form.value.setor,
        subsetor: form.value.subsetor,
        role: form.value.role,
        active: form.value.active,
      }

      if (form.value.active) {
        payload.termination_date = null
      } else if (form.value.termination_date) {
        payload.termination_date = form.value.termination_date
      }

      await UsersService.update(userId, payload)
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

  watch(
    () => form.value.active,
    (isActive) => {
      if (!isActive && !form.value.termination_date) {
        form.value.termination_date = getTodayForInput()
      }
      if (isActive) {
        form.value.termination_date = ''
      }
    },
  )
</script>
