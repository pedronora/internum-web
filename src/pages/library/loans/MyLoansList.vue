<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Meus Empréstimos</h1>
    </div>

    <!-- Filtro de Estado -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 border rounded bg-body border-secondary border-opacity-25"
    >
      <div class="mb-3 mb-md-0 d-flex align-items-center gap-2">
        <label for="statusFilter" class="form-label fw-semibold mb-0"
          >Filtrar por status:</label
        >
        <select
          id="statusFilter"
          v-model="statusFilter"
          class="form-select form-select-sm w-auto"
          @change="reload"
        >
          <option value="">Todos</option>
          <option value="requested">Solicitado</option>
          <option value="canceled">Cancelado</option>
          <option value="borrowed">Emprestado</option>
          <option value="returned">Devolvido</option>
          <option value="late">Atrasado</option>
        </select>
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
          v-if="loans.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">Livro/Autor</th>
              <th scope="col">Solicitado em</th>
              <th scope="col">Devolução</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in loans" :key="l.id">
              <td>
                <strong>{{ l.book?.title }}</strong>
                <br />
                <span class="small text-muted">{{ l.book?.author }}</span>
              </td>
              <td>{{ formatDate(l.created_at) }}</td>

              <!-- Data dinâmica -->
              <td>
                <template v-if="l.status === 'returned'">
                  {{ formatDate(l.returned_at) }}
                </template>
                <template v-else-if="l.status === 'borrowed'">
                  {{ formatDate(l.due_date) }}
                </template>
                <template v-else> - </template>
              </td>
              <td>
                <span :class="['badge', statusBadge(l.status)]">
                  {{ statusLabel(l.status) }}
                </span>
              </td>
              <td class="text-center text-nowrap">
                <!-- Estado: requested -->
                <button
                  v-if="l.status === 'requested'"
                  class="btn btn-sm btn-outline-danger"
                  :disabled="loadingAction"
                  @click="cancelRequest(l.id)"
                >
                  <i class="bi bi-x-circle me-1"></i> Cancelar
                </button>

                <!-- Estado: borrowed -->
                <button
                  v-else-if="l.status === 'borrowed'"
                  class="btn btn-sm btn-outline-success"
                  :disabled="loadingAction"
                  @click="returnLoan(l.id)"
                >
                  <i class="bi bi-box-arrow-in-down me-1"></i> Devolver
                </button>

                <!-- Estado: late -->
                <button
                  v-else-if="l.status === 'late'"
                  class="btn btn-sm btn-outline-warning"
                  :disabled="loadingAction"
                  @click="returnLoan(l.id)"
                >
                  <i class="bi bi-exclamation-triangle me-1"></i> Devolver
                  (Atraso)
                </button>

                <!-- Estado: returned -->
                <span v-else class="text-muted small fst-italic"
                  >Sem ações</span
                >
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="alert alert-warning text-center m-2" role="alert">
          Nenhum empréstimo encontrado.
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
  import { ref, computed, onMounted } from 'vue'
  import { LoansService } from '@/services/loans.services'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'

  const { formatDate } = useDate()

  const loans = ref([])
  const loading = ref(false)
  const loadingAction = ref(false)
  const error = ref(null)
  const statusFilter = ref('')

  const page = ref(1)
  const limit = ref(10)
  const meta = ref({ total: 0 })

  const totalPages = computed(() => meta.value.total_pages || 1)

  function statusBadge(status) {
    switch (status) {
      case 'requested':
        return 'bg-primary'
      case 'borrowed':
        return 'bg-success'
      case 'returned':
        return 'bg-secondary'
      case 'late':
        return 'bg-danger'
      case 'canceled':
        return 'bg-info'
      case 'rejected':
        return 'bg-dark'
      default:
        return 'bg-dark'
    }
  }

  function statusLabel(status) {
    return (
      {
        requested: 'Solicitado',
        canceled: 'Cancelado',
        borrowed: 'Emprestado',
        returned: 'Devolvido',
        rejected: 'Rejeitado',
        late: 'Atrasado',
      }[status] || status
    )
  }

  async function load() {
    loading.value = true
    error.value = null

    const offset = (page.value - 1) * limit.value

    try {
      const data = await LoansService.listMy(
        offset,
        limit.value,
        statusFilter.value,
      )
      loans.value = data.loans || []
      meta.value = data.meta || {
        total_pages: 1,
        has_next: false,
        has_prev: false,
      }
    } catch (err) {
      console.error('Erro ao carregar empréstimos', err)
      error.value =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro desconhecido ao carregar empréstimos'
    } finally {
      loading.value = false
    }
  }

  async function cancelRequest(id) {
    const ok = await confirmToast('Deseja cancelar este pedido?', {
      title: 'Cancelar Solicitação',
    })
    if (!ok) return
    loadingAction.value = true
    try {
      await LoansService.cancel(id)
      successToast('Solicitação cancelada com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast('Erro ao cancelar solicitação.')
    } finally {
      loadingAction.value = false
    }
  }

  async function returnLoan(id) {
    const ok = await confirmToast('Confirmar devolução deste livro?', {
      title: 'Devolver Livro',
    })
    if (!ok) return
    loadingAction.value = true
    try {
      await LoansService.return(id)
      successToast('Livro devolvido com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast('Erro ao devolver livro.')
    } finally {
      loadingAction.value = false
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
