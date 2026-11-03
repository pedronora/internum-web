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
            for="phone"
            >Telefone</label
          >
          <input
            id="phone"
            v-model="phoneDisplay"
            type="text"
            inputmode="numeric"
            maxlength="19"
            class="input-base"
            placeholder="(45) 99999-9999"
          />
          <div
            v-if="phoneError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ phoneError }}
          </div>
        </div>

        <div v-if="canEditSalary">
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            for="gross_salary"
            >Salário Bruto</label
          >
          <input
            id="gross_salary"
            v-model="salaryDisplay"
            type="text"
            inputmode="decimal"
            class="input-base"
            placeholder="R$ 0,00"
          />
          <div
            v-if="salaryError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ salaryError }}
          </div>
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
            >Unidade</label
          >
          <select v-model="form.unidade" class="input-base" required>
            <option disabled value="">Selecione...</option>
            <option
              v-for="u in UNIDADE_OPTIONS"
              :key="u.value"
              :value="u.value"
            >
              {{ u.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Subunidade</label
          >
          <input
            v-model="form.subunidade"
            list="subunidades-sugeridas"
            class="input-base"
            placeholder="Opcional (ex.: Atendimento, Pessoas)"
          />
          <datalist id="subunidades-sugeridas">
            <option
              v-for="s in SUBUNIDADES_SUGERIDAS"
              :key="s"
              :value="s"
            ></option>
          </datalist>
        </div>

        <div class="sm:col-span-2 md:col-span-3">
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Perfis</label
          >
          <div
            v-if="!assignable.length"
            class="text-sm text-slate-500 dark:text-slate-400"
          >
            Você não pode atribuir perfis.
          </div>
          <div v-else class="flex flex-wrap gap-x-4 gap-y-2">
            <label
              v-for="r in assignable"
              :key="r.value"
              class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
            >
              <input
                v-model="form.roles"
                type="checkbox"
                :value="r.value"
                class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              {{ r.label }}
            </label>
          </div>
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
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { UsersService } from '@/services/users.services'
  import { useAuthStore } from '@/stores/auth'
  import {
    PERMISSIONS,
    SUBUNIDADES_SUGERIDAS,
    UNIDADE_OPTIONS,
    assignableRoles,
  } from '@/composables/useAuthorization'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useCPF } from '@/composables/useCPF'
  import { usePhone } from '@/composables/usePhone'
  import { useCurrency } from '@/composables/useCurrency'
  import { passwordSchema } from '@/composables/usePasswordPolicy'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const router = useRouter()
  const auth = useAuthStore()

  const loading = ref(false)
  const error = ref(null)
  const showPassword1 = ref(false)
  const showPassword2 = ref(false)
  const { cpf, cpfError, cpfDisplay, validarCampoCPF, setCPF } = useCPF()
  const { phone, phoneError, phoneDisplay, validarCampoPhone, setPhone } =
    usePhone()
  const {
    grossSalary,
    salaryError,
    salaryDisplay,
    validarCampoSalary,
    resetSalary,
  } = useCurrency()

  const canEditSalary = computed(() => auth.can(PERMISSIONS.USERS_EDIT_SALARY))
  const assignable = computed(() => assignableRoles(auth.user?.roles || []))

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

    password: passwordSchema,

    password_confirm: yup
      .string()
      .required('A confirmação de senha é obrigatória')
      .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),

    unidade: yup.string().required('A unidade é obrigatória'),

    subunidade: yup.string().nullable(),

    roles: yup
      .array()
      .of(yup.string())
      .min(1, 'Selecione ao menos um perfil')
      .required('O perfil é obrigatório'),
  })

  const form = ref({
    name: '',
    username: '',
    email: '',
    birthday: '',
    hiring_date: getTodayForInput(),
    password: '',
    password_confirm: '',
    unidade: '',
    subunidade: '',
    roles: [],
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

    if (!validarCampoPhone()) {
      errorToast(phoneError.value)
      return
    }

    if (canEditSalary.value && !validarCampoSalary()) {
      errorToast(salaryError.value)
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
        unidade: form.value.unidade,
        subunidade: form.value.subunidade || null,
        roles: form.value.roles,
        active: form.value.active,
        password: form.value.password,
        phone: phone.value,
      }
      if (canEditSalary.value) {
        payload.gross_salary = grossSalary.value
      }
      await UsersService.create(payload)
      successToast('Usuário criado com sucesso.')
      setCPF('')
      resetSalary()
      setPhone('')
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
