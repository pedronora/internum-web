<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Acervo</h1>
    </div>

    <!-- Filtros -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div>
        <label
          class="flex items-center gap-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200"
        >
          Mostrar
          <select
            v-model.number="limit"
            class="select-base w-auto rounded-md py-1 text-xs"
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
          class="input-base"
          placeholder="Pesquisar por título, autor ou ISBN..."
          @keyup.enter="reload"
        />
        <button class="btn-outline-primary whitespace-nowrap" @click="reload">
          <Icon name="search" class="h-4 w-4" aria-hidden="true" /> Buscar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="info-alert mb-4 flex items-center gap-2">
      <BaseSpinner class="h-4 w-4" />
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div v-if="!error" class="table-wrap mb-4">
        <table v-if="books.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="th">Título</th>
              <th scope="col" class="th">Editora</th>
              <th scope="col" class="th">Ano</th>
              <th scope="col" class="th">ISBN</th>
              <th scope="col" class="th">Disponíveis</th>
              <th scope="col" class="th text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in books"
              :key="b.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="td">
                <strong>{{ b.title }}</strong>
                <br />
                <span class="text-xs text-slate-500 dark:text-slate-400">{{
                  b.author
                }}</span>
              </td>
              <td class="td">{{ b.publisher || '-' }}</td>
              <td class="td">{{ b.year }}</td>
              <td class="td">{{ b.isbn }}</td>
              <td class="td">
                <BaseBadge
                  :color="b.available_quantity > 0 ? 'success' : 'danger'"
                >
                  {{ b.available_quantity }}
                </BaseBadge>
              </td>
              <td class="td text-center">
                <button
                  class="btn-outline-primary btn-sm"
                  :class="{ 'opacity-50': b.available_quantity === 0 }"
                  :disabled="b.available_quantity === 0 || loadingLoan"
                  @click="requestLoan(b.id)"
                >
                  <Icon
                    name="journal-arrow-down"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                  Emprestar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="warning-alert m-2">Nenhum livro encontrado.</div>
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
    <div v-if="error" class="error-alert mt-4" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { BooksService } from '@/services/books.services'
  import { LoansService } from '@/services/loans.services'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const books = ref([])
  const loading = ref(false)
  const loadingLoan = ref(false)
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
      const data = await BooksService.list(offset, limit.value, q.value)
      books.value = data.books || []
      meta.value = {
        total: data.meta?.total ?? books.value.length,
        page: data.meta?.page ?? page.value,
        size: data.meta?.size ?? limit.value,
        total_pages: data.meta?.total_pages ?? 1,
        has_next: data.meta?.has_next ?? false,
        has_prev: data.meta?.has_prev ?? false,
        offset: data.meta?.offset ?? offset,
      }
    } catch (err) {
      console.error('Erro ao carregar livros', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function requestLoan(bookId) {
    const ok = await confirmToast('Deseja solicitar este livro?', {
      title: 'Solicitar empréstimo',
    })
    if (!ok) return

    loadingLoan.value = true
    try {
      await LoansService.request(bookId)
      successToast('Empréstimo solicitado com sucesso!')
      await load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Erro ao solicitar empréstimo',
      )
    } finally {
      loadingLoan.value = false
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
