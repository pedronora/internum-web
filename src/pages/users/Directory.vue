<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Colaboradores</h1>
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
            class="select-base w-auto"
            @change="reload"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          por página
        </label>
      </div>

      <div class="flex gap-2 md:w-auto">
        <input
          v-model="q"
          class="input-base"
          placeholder="Pesquisar por nome, username ou e-mail..."
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

    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

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
                Nome
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Unidade
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Subunidade
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                E-mail
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Telefone
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Perfis
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in users"
              :key="u.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">
                <div class="font-medium">{{ u.name }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  {{ u.username }}
                </div>
              </td>
              <td class="px-4 py-3">
                <BaseBadge color="dark">{{
                  unidadeLabel(u.unidade)
                }}</BaseBadge>
              </td>
              <td class="px-4 py-3">{{ u.subunidade || '—' }}</td>
              <td class="px-4 py-3">{{ u.email }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                {{ u.phone ? formatarTelefone(u.phone) : '—' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <BaseBadge
                    v-if="!u.roles.length"
                    color="slate"
                    variant="soft"
                  >
                    Sem perfil
                  </BaseBadge>
                  <BaseBadge
                    v-for="role in u.roles"
                    :key="role"
                    :color="roleColor(role)"
                  >
                    {{ roleLabel(role) }}
                  </BaseBadge>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          Nenhum colaborador encontrado.
        </div>
      </div>

      <BasePagination
        v-if="meta.total && totalPages > 1"
        :meta="meta"
        @prev="prev"
        @next="next"
      />
    </div>

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
  import { formatarTelefone } from '@/composables/usePhone'
  import {
    roleColor,
    roleLabel,
    unidadeLabel,
  } from '@/composables/useAuthorization'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

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
      const res = await UsersService.directory(offset, limit.value, q.value)
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
      console.error('Erro carregando colaboradores', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
    } finally {
      loading.value = false
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

  onMounted(load)
</script>
