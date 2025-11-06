<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Gestão de Empréstimos</h1>
    </div>

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
          <option value="rejected">Rejeitado</option>
        </select>
      </div>

      <div class="d-flex align-items-center gap-2">
        <label for="searchFilter" class="form-label fw-semibold mb-0"
          >Buscar:</label
        >
        <div class="input-group input-group-sm">
          <input
            id="searchFilter"
            v-model="searchFilter"
            type="text"
            class="form-control"
            placeholder="Título, Autor, Usuário"
            @keyup.enter="reload"
          />
          <button class="btn btn-outline-secondary" @click="reload">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <div v-else>
      <div v-if="!error" class="table-responsive shadow-sm rounded mb-4">
        <table
          v-if="loans.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">Livro/Autor</th>
              <th scope="col">Usuário</th>
              <th scope="col">Solicitado em</th>
              <th scope="col">Devolução Prevista</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in loans" :key="l.id">
              <td>
                <strong>{{ l.book?.title }}</strong>
                <br />
                <span class="small text-muted">{{ l.book?.author }}</span>
              </td>
              <td>
                {{ l.user?.name }}
                <br />
                <span class="small text-muted">{{ l.user?.email }}</span>
              </td>
              <td>{{ formatDate(l.created_at) }}</td>

              <td>
                <template v-if="l.status === 'borrowed' || l.status === 'late'">
                  {{ formatDate(l.due_date) }}
                </template>
                <template v-else-if="l.status === 'returned'">
                  {{ formatDate(l.returned_at) }}
                </template>
                <template v-else> - </template>
              </td>
              <td>
                <span :class="['badge', statusBadge(l.status)]">
                  {{ statusLabel(l.status) }}
                </span>
              </td>
              <td class="text-center text-nowrap">
                <div v-if="l.status === 'requested'">
                  <button
                    class="btn btn-sm btn-success me-2"
                    :disabled="loadingAction"
                    @click="approveRequest(l.id)"
                  >
                    <i class="bi bi-check-circle me-1"></i> Aprovar
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    :disabled="loadingAction"
                    @click="rejectRequest(l.id)"
                  >
                    <i class="bi bi-x-circle me-1"></i> Rejeitar
                  </button>
                </div>

                <button
                  v-else-if="l.status === 'borrowed' || l.status === 'late'"
                  class="btn btn-sm btn-outline-success"
                  :disabled="loadingAction"
                  @click="returnLoan(l.id)"
                >
                  <i class="bi bi-box-arrow-in-down me-1"></i> Devolver
                </button>

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

      <div
        v-if="meta.total && totalPages > 1"
        class="d-flex justify-content-between align-items-center mt-3"
      >
        <span class="text-muted"
          >Página {{ meta.page }} de {{ totalPages }} (Total:
          {{ meta.total }})</span
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

    <div v-if="error" class="alert alert-danger mt-4" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  // Presumindo que você tem um arquivo para serviços de Toast e Data
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
  const searchFilter = ref('') // Novo filtro de busca

  const page = ref(1)
  const limit = ref(10)
  const meta = ref({ total: 0 })

  const totalPages = computed(() => meta.value.total_pages || 1)

  // Funções de Status (Reaproveitadas do componente original)
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

  // Lógica de carregamento (Usando LoansService.list)
  async function load() {
    loading.value = true
    error.value = null

    const offset = (page.value - 1) * limit.value

    try {
      // ATENÇÃO: Usando LoansService.list() para listar todos
      const data = await LoansService.list(
        offset,
        limit.value,
        searchFilter.value, // Passando o novo filtro de busca
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

  // --- Funções Administrativas de Ação ---

  async function approveRequest(id) {
    const ok = await confirmToast('Confirmar aprovação deste empréstimo?', {
      title: 'Aprovar Solicitação',
      icon: 'question',
    })
    if (!ok) return

    loadingAction.value = true
    try {
      await LoansService.approve(id) // Chamada para o novo endpoint 'approve'
      successToast('Empréstimo aprovado e livro emprestado!')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail || 'Erro ao aprovar a solicitação.',
      )
    } finally {
      loadingAction.value = false
    }
  }

  async function rejectRequest(id) {
    const ok = await confirmToast(
      'Deseja rejeitar este pedido de empréstimo?',
      {
        title: 'Rejeitar Solicitação',
        icon: 'warning',
      },
    )
    if (!ok) return

    loadingAction.value = true
    try {
      await LoansService.reject(id) // Chamada para o novo endpoint 'reject'
      successToast('Solicitação rejeitada com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail || 'Erro ao rejeitar a solicitação.',
      )
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
      successToast('Livro devolvido e estoque atualizado com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail || 'Erro ao registrar a devolução.',
      )
    } finally {
      loadingAction.value = false
    }
  }
  // ----------------------------------------

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
