<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Acervo</h1>
    </div>

    <!-- Filtros -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 border rounded bg-body border-secondary border-opacity-25"
    >
      <div class="mb-3 mb-md-0">
        <label class="d-flex align-items-center gap-2 text-nowrap text-body">
          Mostrar
          <select
            v-model.number="limit"
            class="form-select form-select-sm w-auto"
            @change="reload"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
          por página
        </label>
      </div>

      <div class="d-flex gap-2 w-md-auto">
        <input
          v-model="q"
          class="form-control"
          placeholder="Pesquisar por título, autor ou ISBN..."
          @keyup.enter="reload"
        />
        <button class="btn btn-outline-primary text-nowrap" @click="reload">
          <i class="bi bi-search me-1"></i> Buscar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div v-if="!error" class="table-responsive shadow-sm rounded mb-4">
        <table
          v-if="books.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Editora</th>
              <th scope="col">Ano</th>
              <th scope="col">ISBN</th>
              <th scope="col">Disponíveis</th>
              <th scope="col" class="text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in books" :key="b.id">
              <td>
                <strong>{{ b.title }}</strong>
                <br />
                <span class="small text-muted">{{ b.author }}</span>
              </td>
              <td>{{ b.publisher || '-' }}</td>
              <td>{{ b.year }}</td>
              <td>{{ b.isbn }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    b.available_quantity > 0 ? 'bg-success' : 'bg-danger',
                  ]"
                >
                  {{ b.available_quantity }}
                </span>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-sm"
                  :class="
                    b.available_quantity > 0
                      ? 'btn-outline-primary'
                      : 'btn-outline-secondary disabled'
                  "
                  :disabled="b.available_quantity === 0 || loadingLoan"
                  @click="requestLoan(b.id)"
                >
                  <i class="bi bi-journal-arrow-down me-1"></i> Emprestar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="alert alert-warning text-center m-2" role="alert">
          Nenhum livro encontrado.
        </div>
      </div>

      <!-- Paginação -->
      <div
        v-if="meta.total && totalPages > 1"
        class="d-flex justify-content-between align-items-center"
      >
        <span class="text-muted"
          >Página {{ meta.page }} de {{ totalPages }}</span
        >

        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!meta.has_prev"
            @click="prev"
          >
            &laquo; Anterior
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!meta.has_next"
            @click="next"
          >
            Próxima &raquo;
          </button>
        </div>
      </div>
    </div>

    <!-- Erro -->
    <div v-if="error" class="alert alert-danger mt-4" role="alert">
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
