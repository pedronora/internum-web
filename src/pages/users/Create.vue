<template>
  <div class="mt-4">
    <h1 class="mb-4 text-2xl font-bold">Criar Usuário</h1>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
    >
      {{ error }}
    </div>

    <form
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Nome</label
          >
          <input v-model="form.name" required class="input-base" />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Username</label
          >
          <input v-model="form.username" required class="input-base" />
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
            class="input-base"
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
            class="input-base"
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
            required
            class="input-base"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Senha</label
          >
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword1 ? 'text' : 'password'"
              required
              class="input-base pr-11"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showPassword1.toString()"
              :title="showPassword1 ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword1 = !showPassword1"
            >
              <Icon
                :name="showPassword1 ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A senha requer 8–64 caracteres, com maiúscula, minúscula, número e
            caractere especial.
          </p>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Confirmação de senha</label
          >
          <div class="relative">
            <input
              v-model="form.password_confirm"
              :type="showPassword2 ? 'text' : 'password'"
              required
              class="input-base pr-11"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showPassword2.toString()"
              :title="showPassword2 ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword2 = !showPassword2"
            >
              <Icon
                :name="showPassword2 ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Setor</label
          >
          <select v-model="form.setor" class="input-base" required>
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
          <select v-model="form.subsetor" class="input-base" required>
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
          <select v-model="form.role" class="input-base" required>
            <option disabled value="">Selecione...</option>
            <option v-for="r in roleOptions" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <router-link
          to="/users"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancelar
        </router-link>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          <BaseSpinner v-if="loading" class="h-4 w-4" />
          Criar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { UsersService } from '@/services/users.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useCPF } from '@/composables/useCPF'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const router = useRouter()

  const loading = ref(false)
  const error = ref(null)
  const showPassword1 = ref(false)
  const showPassword2 = ref(false)
  const { cpf, cpfError, cpfDisplay, validarCampoCPF, setCPF } = useCPF()

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
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().split('T')[0]
  }

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

    password: yup
      .string()
      .required('A senha é obrigatória')
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .max(64, 'A senha deve ter no máximo 64 caracteres')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        'A senha requer 8–64 caracteres, com maiúscula, minúscula, número e caractere especial',
      ),

    password_confirm: yup
      .string()
      .required('A confirmação de senha é obrigatória')
      .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),

    setor: yup.string().required('O setor é obrigatório'),

    subsetor: yup.string().required('O subsetor é obrigatório'),

    role: yup.string().required('O perfil é obrigatório'),
  })

  const form = ref({
    name: '',
    username: '',
    email: '',
    birthday: '',
    hiring_date: getTodayForInput(),
    password: '',
    password_confirm: '',
    setor: '',
    subsetor: '',
    role: 'user',
    active: true,
  })

  async function submit() {
    error.value = null

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

    loading.value = true
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
        password: form.value.password,
      }
      await UsersService.create(payload)
      successToast('Usuário criado com sucesso.')
      setCPF('')
      router.push({ name: 'UsersList' })
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message ||
          'Erro ao criar usuário',
      )
    } finally {
      loading.value = false
    }
  }
</script>
