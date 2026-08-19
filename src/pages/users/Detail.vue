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
          :to="{ name: 'UsersEdit', params: { id } }"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
          >Editar</router-link
        >
        <button
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
          Setor
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          <BaseBadge color="slate">{{ user.setor }}</BaseBadge>
        </dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Subsetor
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">{{ user.subsetor }}</dd>

        <dt
          class="text-sm font-medium text-slate-500 dark:text-slate-400 sm:col-span-3"
        >
          Perfil
        </dt>
        <dd class="text-sm sm:col-span-9 sm:text-base">
          <BaseBadge :color="roleClass(user.role)">
            {{ roleLabel(user.role) }}
          </BaseBadge>
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
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { UsersService } from '@/services/users.services'
  import {
    confirm as confirmToast,
    error as errorToast,
    success as successToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import { useCPF } from '@/composables/useCPF'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

  const route = useRoute()
  const router = useRouter()
  const { formatDate } = useDate()
  const { formatarCPF } = useCPF()
  const id = route.params.id

  const loading = ref(false)
  const user = ref(null)
  const error = ref(null)

  function roleLabel(role) {
    return role === 'admin'
      ? 'Admin'
      : role === 'coord'
        ? 'Coordenador'
        : 'Geral'
  }
  function roleClass(role) {
    return role === 'admin' ? 'primary' : role === 'coord' ? 'info' : 'success'
  }

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

  onMounted(load)
</script>
