<template>
  <div class="container mt-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Usuário</h1>
      <div class="flex flex-wrap gap-2">
        <router-link
          :to="{ name: 'UsersList' }"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >Cancelar</router-link
        >
        <router-link
          v-if="auth.can(PERMISSIONS.USERS_EDIT_PROFILE) && !protectedOficial"
          :to="{ name: 'UsersEdit', params: { id } }"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
          >Editar</router-link
        >
        <button
          v-if="
            auth.can(PERMISSIONS.USERS_CHANGE_PASSWORD) && canChangePassword
          "
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
          @click="passwordModalOpen = true"
        >
          Alterar senha
        </button>
        <button
          v-if="
            auth.can(PERMISSIONS.USERS_EDIT_EMPLOYMENT) && !protectedOficial
          "
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
          @click="confirmDelete"
        >
          Excluir
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-if="user"
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <dl class="grid gap-y-4 p-5 sm:grid-cols-12 sm:gap-x-4">
        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          ID
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">{{ user.id }}</dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Nome
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">{{ user.name }}</dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Username
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">{{ user.username }}</dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          CPF
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ formatarCPF(user.cpf || '') }}
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Email
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">{{ user.email }}</dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Data de Aniversário
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ formatDate(user.birthday, true) }}
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Data de Admissão
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ formatDate(user.hiring_date, true) }}
        </dd>

        <template v-if="user.phone">
          <dt
            class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
          >
            Telefone
          </dt>
          <dd class="text-sm sm:col-span-9 sm:text-base">
            {{ formatarTelefone(user.phone) }}
          </dd>
        </template>

        <template v-if="user.gross_salary != null && user.gross_salary !== ''">
          <dt
            class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
          >
            Salário Bruto
          </dt>
          <dd class="text-sm sm:col-span-9 sm:text-base">
            {{ formatarMoedaBR(user.gross_salary) }}
          </dd>
        </template>

        <template v-if="!user.active && user.termination_date">
          <dt
            class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
          >
            Data de Rescisão
          </dt>
          <dd class="text-sm sm:col-span-9 sm:text-base">
            {{ formatDate(user.termination_date, true) }}
          </dd>
        </template>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Unidade
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          <BaseBadge color="dark">{{ unidadeLabel(user.unidade) }}</BaseBadge>
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Subunidade
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ user.subunidade || '—' }}
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Perfis
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          <div class="flex flex-wrap gap-1">
            <BaseBadge v-if="!user.roles.length" color="slate" variant="soft">
              Sem perfil
            </BaseBadge>
            <BaseBadge
              v-for="role in user.roles"
              :key="role"
              :color="roleColor(role)"
            >
              {{ roleLabel(role) }}
            </BaseBadge>
          </div>
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Ativo
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ user.active ? 'Sim' : 'Não' }}
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Criado em
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ formatDate(user.created_at) }}
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Atualizado em
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          {{ formatDate(user.updated_at) }}
        </dd>
      </dl>
    </div>

    <BaseModal
      :open="passwordModalOpen"
      title="Alterar senha"
      tone="danger"
      @close="closePasswordModal"
    >
      <form
        id="official-password-form"
        class="space-y-4"
        @submit.prevent="submitPassword"
      >
        <p class="text-sm text-slate-600 dark:text-slate-300">
          A nova senha será aplicada a
          <strong>{{ user?.name }}</strong
          >. Todas as sessões desse usuário serão encerradas.
        </p>

        <div>
          <label
            for="official-new-password"
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Nova senha</label
          >
          <input
            id="official-new-password"
            v-model="passwordForm.password"
            type="password"
            autocomplete="new-password"
            class="input-base"
            :class="{ 'border-red-500': passwordErrors.password }"
          />
          <p
            v-if="passwordErrors.password"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ passwordErrors.password }}
          </p>
        </div>

        <div>
          <label
            for="official-confirm-password"
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >Confirmar nova senha</label
          >
          <input
            id="official-confirm-password"
            v-model="passwordForm.confirm"
            type="password"
            autocomplete="new-password"
            class="input-base"
            :class="{ 'border-red-500': passwordErrors.confirm }"
          />
          <p
            v-if="passwordErrors.confirm"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ passwordErrors.confirm }}
          </p>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="closePasswordModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="official-password-form"
          :disabled="passwordSaving"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BaseSpinner v-if="passwordSaving" class="h-4 w-4" />
          Alterar senha
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UsersService } from '@/services/users.services'
  import { useAuthStore } from '@/stores/auth'
  import {
    confirm as confirmToast,
    error as errorToast,
    success as successToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import { useCPF } from '@/composables/useCPF'
  import {
    PERMISSIONS,
    isProtectedOficial,
    roleColor,
    roleLabel,
    unidadeLabel,
  } from '@/composables/useAuthorization'
  import { passwordSchema } from '@/composables/usePasswordPolicy'
  import { formatarTelefone } from '@/composables/usePhone'
  import { formatarMoedaBR } from '@/composables/useCurrency'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BaseModal from '@/components/BaseModal.vue'
  import * as yup from 'yup'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const { formatDate } = useDate()
  const { formatarCPF } = useCPF()
  const id = route.params.id

  const loading = ref(false)
  const user = ref(null)
  const error = ref(null)

  const protectedOficial = computed(
    () => !user.value || isProtectedOficial(user.value, auth.user?.id),
  )
  const canChangePassword = computed(
    () =>
      auth.can(PERMISSIONS.USERS_CHANGE_PASSWORD) &&
      String(user.value?.id) !== String(auth.user?.id),
  )

  const passwordModalOpen = ref(false)
  const passwordSaving = ref(false)
  const passwordForm = ref({ password: '', confirm: '' })
  const passwordErrors = ref({})

  const passwordValidation = yup.object({
    password: passwordSchema,
    confirm: yup
      .string()
      .required('Confirme a nova senha')
      .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),
  })

  async function load() {
    loading.value = true
    try {
      user.value = await UsersService.getById(id)
    } catch (err) {
      console.error(err)
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro ao carregar usuário'
      errorToast(msg)
    } finally {
      loading.value = false
    }
  }

  async function confirmDelete() {
    const ok = await confirmToast('Deseja excluir/desativar este usuário?', {
      title: 'Excluir usuário',
    })
    if (!ok) return

    try {
      await UsersService.deactivate(id)
      successToast('Usuário excluído/desativado com sucesso.')
      router.push({ name: 'UsersList' })
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.message ||
          'Erro ao excluir usuário',
      )
    }
  }

  function closePasswordModal() {
    passwordModalOpen.value = false
    passwordForm.value = { password: '', confirm: '' }
    passwordErrors.value = {}
  }

  async function submitPassword() {
    passwordErrors.value = {}

    try {
      await passwordValidation.validate(passwordForm.value, {
        abortEarly: false,
      })
    } catch (validationError) {
      validationError.inner?.forEach((item) => {
        passwordErrors.value[item.path] = item.message
      })
      return
    }

    passwordSaving.value = true
    try {
      await UsersService.resetPassword(id, passwordForm.value.password)
      successToast('Senha alterada. As sessões do usuário foram encerradas.')
      closePasswordModal()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.message ||
          'Erro ao alterar a senha',
      )
    } finally {
      passwordSaving.value = false
    }
  }

  onMounted(load)
</script>
