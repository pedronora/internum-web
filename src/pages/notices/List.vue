<template>
  <div>
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Avisos</h1>
      <router-link
        :to="{ name: 'NoticesCreate' }"
        class="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="plus-lg" class="h-4 w-4" aria-hidden="true" /> Criar Novo
      </router-link>
    </div>

    <div
      class="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div
        class="flex items-center gap-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200"
      >
        Mostrar
        <select
          v-model.number="limit"
          class="select-base w-auto"
          @change="reload"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
        </select>
        por página
      </div>

      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <input
          v-model="q"
          class="input-base md:w-64"
          placeholder="Pesquisar..."
          @keyup.enter="reload"
        />
        <button
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="reload"
        >
          <Icon name="search" class="h-4 w-4" aria-hidden="true" /> Buscar
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

    <div v-else>
      <div
        v-if="!error"
        class="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <table v-if="notices.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                ID
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Título
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Conteúdo
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Lidos
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Criado em
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in notices"
              :key="n.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">{{ n.id }}</td>
              <td class="px-4 py-3">{{ n.title }}</td>
              <td class="max-w-[250px] px-4 py-3">
                <RichText :html="n.content" class="line-clamp-2" />
              </td>
              <td class="px-4 py-3">
                <BaseBadge color="info" variant="soft">
                  {{ n.reads_count }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">{{ formatDate(n.created_at) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <router-link
                  :to="{ name: 'NoticesDetail', params: { id: n.id } }"
                  class="mr-1 inline-flex items-center justify-center gap-2 rounded-lg border border-primary-300 bg-white px-2.5 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary-700 dark:bg-slate-800 dark:text-primary-400 dark:hover:bg-primary-950/30"
                >
                  Ver
                </router-link>
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  @click="deleteNotice(n.id)"
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
          Nenhum aviso encontrado.
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
  import { NoticesService } from '@/services/notices.services'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'
  import RichText from '@/components/RichText.vue'

  const { formatDate } = useDate()

  const notices = ref([])
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
      const res = await NoticesService.list(offset, limit.value, q.value)
      const data = res.data

      notices.value = data.notices || []

      meta.value = {
        total: data.meta?.total ?? notices.value.length,
        page: data.meta?.page ?? page.value,
        size: data.meta?.size ?? limit.value,
        total_pages: data.meta?.total_pages ?? 1,
        has_next: data.meta?.has_next ?? false,
        has_prev: data.meta?.has_prev ?? false,
        offset: data.meta?.offset ?? offset,
      }
    } catch (err) {
      console.error('Erro carregando avisos', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function deleteNotice(id) {
    const ok = await confirmToast('Deseja excluir este aviso?', {
      title: 'Excluir aviso',
    })
    if (!ok) return

    try {
      await NoticesService.deactivate(id)
      successToast('Aviso excluído com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao excluir aviso',
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
