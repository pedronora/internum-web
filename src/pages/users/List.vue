<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Usuários</h1>
      <router-link
        :to="{ name: 'UsersCreate' }"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="plus-lg" class="h-4 w-4" /> Criar Novo
      </router-link>
    </div>
    <div
      class="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div
        class="flex items-center gap-2 whitespace-nowrap text-slate-700 dark:text-slate-200"
      >
        <label class="flex items-center gap-2 text-sm font-medium">
          Mostrar
          <select
            v-model.number="limit"
            class="w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            @change="reload"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
          por página
        </label>
      </div>

      <div class="flex gap-2 md:w-auto">
        <input
          v-model="q"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          placeholder="Pesquisar..."
          @keyup.enter="reload"
        />
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="reload"
        >
          <Icon name="search" class="h-4 w-4" /> Buscar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div
        v-if="!error"
        class="mb-4 overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-700"
      >
        <table v-if="users.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                ID
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Nome
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Username
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Email
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Setor
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Perfil
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Criado em
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in users"
              :key="u.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">{{ u.id }}</td>
              <td class="px-4 py-3">{{ u.name }}</td>
              <td class="px-4 py-3">{{ u.username }}</td>
              <td class="px-4 py-3">{{ u.email }}</td>
              <td class="px-4 py-3">
                <BaseBadge color="dark">{{ u.setor }}</BaseBadge>
              </td>
              <td class="px-4 py-3">
                <BaseBadge :color="roleColor(u.role)">
                  {{
                    u.role === 'admin'
                      ? 'Admin'
                      : u.role === 'coord'
                        ? 'Coordenador'
                        : 'Geral'
                  }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">{{ formatDate(u.created_at) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <router-link
                  :to="{ name: 'UsersDetail', params: { id: u.id } }"
                  class="mr-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-300 px-2.5 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  >Ver</router-link
                >
                <router-link
                  :to="{ name: 'UsersEdit', params: { id: u.id } }"
                  class="mr-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >Editar</router-link
                >
                <button
                  class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                  @click="deleteUser(u.id)"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          Nenhum usuário encontrado.
        </div>
      </div>

      <!-- Paginação -->
      <BasePagination
        v-if="meta.total && totalPages > 1"
        :meta="meta"
        @prev="prev"
        @next="next"
      />
    </div>

    <!-- Erro -->
    <div
      v-if="error"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { UsersService } from '@/services/users.services'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const { formatDate } = useDate()

  const roleColor = (role) =>
    ({ admin: 'primary', coord: 'info', user: 'success' })[role] || 'slate'

  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(1)
  const limit = ref(10)
  const q = ref('')

  const meta = ref({
    total: null,
    offset: 0,
    limit: 10,
  })

  const totalPages = computed(() => meta.value.total_pages || 1)

  async function load() {
    loading.value = true
    error.value = null

    const offset = (page.value - 1) * limit.value

    try {
      const res = await UsersService.list(offset, limit.value, q.value)
      const data = res.data

      users.value = data.users || []

      meta.value = {
        total: data.meta?.total ?? users.value.length,
        page: data.meta?.page ?? page.value,
        size: data.meta?.size ?? limit.value,
        total_pages: data.meta?.total_pages ?? 1,
        has_next: data.meta?.has_next ?? false,
        has_prev: data.meta?.has_prev ?? false,
        offset: data.meta?.offset ?? offset,
      }
    } catch (err) {
      console.error('Erro carregando usuários', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    const ok = await confirmToast('Deseja excluir/desativar este usuário?', {
      title: 'Excluir usuário',
    })
    if (!ok) return

    try {
      await UsersService.deactivate(id)
      successToast('Usuário excluído/desativado com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.message ||
          'Erro ao excluir usuário',
      )
    }
  }

  function reload() {
    page.value = 1
    load()
  }

  function next() {
    if (meta.value.has_next) {
      page.value++
      load()
    }
  }
  function prev() {
    if (meta.value.has_prev) {
      page.value--
      load()
    }
  }

  onMounted(() => {
    load()
  })
</script>
