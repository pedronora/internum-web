<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Minhas Solicitações de Férias</h1>
      <router-link
        :to="{ name: 'VacationRequestsCreate' }"
        class="btn btn-success"
      >
        <i class="bi bi-plus-lg me-1"></i> Nova Solicitação
      </router-link>
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
        <select
          v-model="statusFilter"
          class="form-select form-select-sm w-auto"
          @change="reload"
        >
          <option value="">Todos os status</option>
          <option value="submitted">Enviado</option>
          <option value="under_review">Em Análise</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
          <option value="cancelled">Cancelado</option>
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
          v-if="pagedRequests.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Status</th>
              <th scope="col">Períodos</th>
              <th scope="col">Total Dias</th>
              <th scope="col">Solicitado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagedRequests" :key="r.id">
              <td>{{ r.id }}</td>
              <td>
                <span :class="requestStatus(r.status).badge">
                  {{ requestStatus(r.status).label }}
                </span>
              </td>
              <td>{{ r.periods_count }}</td>
              <td>{{ r.total_days }}</td>
              <td>
                {{ r.requested_at ? formatDate(r.requested_at, true) : '—' }}
              </td>
              <td class="text-nowrap">
                <router-link
                  :to="{ name: 'VacationRequestDetail', params: { id: r.id } }"
                  class="btn btn-sm btn-outline-primary me-1"
                >
                  Ver
                </router-link>
                <button
                  v-if="canCancel(r.status)"
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelRequest(r.id)"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="alert alert-warning text-center m-2" role="alert">
          Nenhuma solicitação encontrada.
        </div>
      </div>

      <!-- Paginação -->
      <div
        v-if="totalPages > 1"
        class="d-flex justify-content-between align-items-center"
      >
        <span class="text-muted">Página {{ page }} de {{ totalPages }}</span>
        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!hasPrev"
            @click="prev"
          >
            &laquo; Anterior
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!hasNext"
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
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const { formatDate } = useDate()

  const { requestStatus } = useVacation()

  const requests = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(1)
  const limit = ref(10)
  const statusFilter = ref('')

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(requests.value.length / limit.value)),
  )
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  const pagedRequests = computed(() => {
    const start = (page.value - 1) * limit.value
    return requests.value.slice(start, start + limit.value)
  })

  function canCancel(status) {
    return status === 'submitted' || status === 'under_review'
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (statusFilter.value) params.status = statusFilter.value
      requests.value = await VacationService.listRequests(params)
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function cancelRequest(id) {
    const ok = await confirmToast('Deseja cancelar esta solicitação?', {
      title: 'Cancelar Solicitação',
    })
    if (!ok) return
    try {
      await VacationService.cancelRequest(id)
      successToast('Solicitação cancelada.')
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao cancelar',
      )
    }
  }

  function reload() {
    page.value = 1
    load()
  }

  function next() {
    if (hasNext.value) {
      page.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      page.value--
    }
  }

  onMounted(load)
</script>
