<template>
  <div>
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Meus Avisos</h1>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <input
          v-model="searchQuery"
          type="text"
          class="input-base max-w-[250px]"
          placeholder="Pesquisar..."
          @keyup.enter="fetchAll"
        />
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="fetchAll"
        >
          Buscar
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-700 dark:bg-slate-800 dark:text-green-400 dark:hover:bg-green-950/30"
          title="Atualizar"
          @click="fetchAll"
        >
          <Icon name="repeat" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <section>
      <div
        class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold">
          Avisos não lidos ({{ unreadsMeta.total }})
        </h3>
        <BasePagination
          :meta="unreadsMeta"
          @prev="changePage('unreads', unreadsMeta.page - 1)"
          @next="changePage('unreads', unreadsMeta.page + 1)"
        />
      </div>

      <div
        v-if="unreads.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="notice in unreads"
          :key="notice.id"
          class="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <h5 class="mb-2 text-base font-semibold">{{ notice.title }}</h5>
          <p class="mb-4 text-sm">{{ notice.content }}</p>
          <p class="mt-auto mb-4 text-xs text-slate-500 dark:text-slate-400">
            <strong>Autor:</strong> {{ notice.author?.name }} <br />
            <strong>Criado em:</strong> {{ formatDate(notice.created_at) }}
          </p>
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loadingIds.has(notice.id)"
            @click="markRead(notice.id)"
          >
            <span v-if="!loadingIds.has(notice.id)">Marcar como lido</span>
            <span v-else class="inline-flex items-center gap-2">
              <BaseSpinner class="h-4 w-4" />
              Marcando...
            </span>
          </button>
        </div>
      </div>

      <p
        v-else
        class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        Nenhum aviso não lido 🎉
      </p>
    </section>

    <hr class="my-6 border-slate-200 dark:border-slate-700" />

    <section>
      <div
        class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold">Avisos lidos</h3>
        <BasePagination
          :meta="readsMeta"
          @prev="changePage('reads', readsMeta.page - 1)"
          @next="changePage('reads', readsMeta.page + 1)"
        />
      </div>

      <div
        class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <table class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Título
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Autor
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Conteúdo
              </th>
              <th class="px-4 py-3 whitespace-nowrap text-left font-semibold">
                Criado em
              </th>
              <th
                class="px-4 py-3 whitespace-nowrap text-left font-semibold"
              ></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="notice in reads"
              :key="notice.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">{{ notice.title }}</td>
              <td class="px-4 py-3">{{ notice.author?.name }}</td>
              <td class="max-w-[250px] truncate px-4 py-3">
                {{ notice.content }}
              </td>
              <td class="px-4 py-3">{{ formatDate(notice.created_at) }}</td>
              <td class="px-4 py-3">
                <router-link
                  class="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-medium text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-700 dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-sky-950/30"
                  :to="{ name: 'NoticesDetail', params: { id: notice.id } }"
                >
                  ver
                </router-link>
              </td>
            </tr>
            <tr v-if="!reads.length">
              <td
                colspan="5"
                class="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Nenhum aviso lido ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { NoticesService } from '@/services/notices.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import { useNoticeStore } from '@/stores/notices.js'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const { formatDate } = useDate()

  const noticeStore = useNoticeStore()

  const unreads = ref([])
  const unreadsMeta = ref({ page: 1, has_next: false, has_prev: false })

  const reads = ref([])
  const readsMeta = ref({ page: 1, has_next: false, has_prev: false })

  const searchQuery = ref('')
  const loadingIds = ref(new Set())

  const fetchAll = async () => {
    await Promise.all([fetchUnreads(), fetchReads()])
  }

  const fetchUnreads = async (page = unreadsMeta.value.page) => {
    try {
      const res = await NoticesService.listUnreads(
        (page - 1) * 10,
        10,
        searchQuery.value,
      )
      unreads.value = res.data.notices
      unreadsMeta.value = res.data.meta
      noticeStore.setUnreadCount(unreadsMeta.value.total)
    } catch (err) {
      console.error('Erro ao buscar não lidos:', err)
    }
  }

  const fetchReads = async (page = readsMeta.value.page) => {
    try {
      const res = await NoticesService.listReads(
        (page - 1) * 10,
        10,
        searchQuery.value,
      )
      reads.value = res.data.notices
      readsMeta.value = res.data.meta
    } catch (err) {
      console.error('Erro ao buscar lidos:', err)
    }
  }

  const changePage = (type, newPage) => {
    if (type === 'unreads') fetchUnreads(newPage)
    else fetchReads(newPage)
  }

  const markRead = async (id) => {
    try {
      loadingIds.value.add(id)
      await NoticesService.markAsRead(id)
      successToast('Aviso marcado como lido com sucesso!')
      await fetchAll()
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
      errorToast('Erro ao marcar aviso como lido.')
    } finally {
      loadingIds.value.delete(id)
    }
  }

  onMounted(fetchAll)
</script>
