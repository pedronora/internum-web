<template>
  <div class="mt-4">
    <h1 class="mb-4 text-2xl font-bold">Meu Perfil</h1>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-if="loading && !loadedOnce"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <form
      v-if="loadedOnce"
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
            class="input-base"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                errors.name,
            }"
          />
          <div
            v-if="errors.name"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.name }}
          </div>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Username</label
          >
          <input v-model="form.username" required class="input-base" disabled />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >CPF</label
          >
          <input :value="formatarCPF(form.cpf)" class="input-base" disabled />
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
            class="input-base"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                errors.email,
            }"
          />
          <div
            v-if="errors.email"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.email }}
          </div>
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
            class="input-base"
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
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Setor</label
          >
          <select
            v-model="form.setor"
            class="input-base"
            :disabled="!canEditRestrictedFields"
          >
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
            class="input-base"
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

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Perfil</label
          >
          <select
            v-model="form.role"
            class="input-base"
            :disabled="!canEditRestrictedFields"
          >
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          <BaseSpinner v-if="loading" class="h-4 w-4" />
          Atualizar
        </button>
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
  import { useCPF } from '@/composables/useCPF'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  function formatDateForInput(dateString) {
    if (!dateString) return ''
    return dateString.split('T')[0]
  }

  const auth = useAuthStore()
  const loading = ref(false)
  const loadedOnce = ref(false)
  const error = ref(null)
  const errors = ref({})
  const { formatarCPF } = useCPF()

  const canEditRestrictedFields = computed(() =>
    ['admin', 'coord'].includes(auth.user?.role),
  )

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

  const form = ref({
    id: '',
    name: '',
    username: '',
    cpf: '',
    email: '',
    birthday: '',
    hiring_date: '',
    setor: setorOptions[0].value,
    subsetor: '',
    role: 'user',
    active: true,
  })

  const schema = yup.object({
    name: yup.string().required('O nome é obrigatório'),
    email: yup
      .string()
      .email('E-mail inválido')
      .required('O e-mail é obrigatório'),
  })

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await UsersService.me()
      form.value = {
        id: data.id,
        name: data.name ?? '',
        username: data.username ?? '',
        cpf: data.cpf ?? '',
        email: data.email ?? '',
        birthday: formatDateForInput(data.birthday),
        hiring_date: formatDateForInput(data.hiring_date),
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

  async function submit() {
    loading.value = true
    errors.value = {}

    try {
      await schema.validate(form.value, { abortEarly: false })

      let payload = {
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        birthday: form.value.birthday,
      }

      if (canEditRestrictedFields.value) {
        payload.setor = form.value.setor
        payload.subsetor = form.value.subsetor
        payload.role = form.value.role
        payload.active = form.value.active
      }

      const updated_user = await UsersService.update(form.value.id, payload)

      auth.setUser(updated_user)
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
