<template>
  <div class="mt-4">
    <h1 class="mb-4 text-2xl font-bold">Alterar senha</h1>

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
      @submit.prevent="submitForm"
    >
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Senha atual -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Senha atual</label
          >
          <div class="relative">
            <input
              v-model="form.oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              required
              class="input-base pr-11"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.oldPassword,
              }"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showOldPassword.toString()"
              :disabled="loading"
              :title="showOldPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showOldPassword = !showOldPassword"
            >
              <Icon
                :name="showOldPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            v-if="errors.oldPassword"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.oldPassword }}
          </div>
        </div>

        <!-- Nova senha -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Nova senha</label
          >
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              class="input-base pr-11"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.newPassword,
              }"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showNewPassword.toString()"
              :disabled="loading"
              :title="showNewPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showNewPassword = !showNewPassword"
            >
              <Icon
                :name="showNewPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            v-if="errors.newPassword"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.newPassword }}
          </div>
        </div>

        <!-- Confirmar senha -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Confirmar nova senha</label
          >
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="input-base pr-11"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.confirmPassword,
              }"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              :aria-pressed="showConfirmPassword.toString()"
              :disabled="loading"
              :title="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'eye-slash' : 'eye'"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            v-if="errors.confirmPassword"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ errors.confirmPassword }}
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          type="button"
          @click="goBack"
        >
          Cancelar
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          <BaseSpinner v-if="loading" class="h-4 w-4" />
          Alterar senha
        </button>
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
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import * as yup from 'yup'

  const auth = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const loadedOnce = ref(false)
  const error = ref(null)
  const errors = ref({})

  const form = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const showOldPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

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
