<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Minhas Solicitações de Férias</h1>
      <router-link :to="{ name: 'VacationRequestsCreate' }" class="btn-success">
        <Icon name="plus-lg" class="h-4 w-4" aria-hidden="true" /> Nova
        Solicitação
      </router-link>
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

      <div class="md:w-auto">
        <select
          v-model="statusFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
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
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div v-if="!error" class="table-wrap mb-4">
        <table v-if="pagedRequests.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="th">#</th>
              <th scope="col" class="th">Status</th>
              <th scope="col" class="th">Períodos</th>
              <th scope="col" class="th">Total Dias</th>
              <th scope="col" class="th">Solicitado em</th>
              <th scope="col" class="th">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in pagedRequests"
              :key="r.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="td">{{ r.id }}</td>
              <td class="td">
                <BaseBadge :color="requestColor(r.status)">
                  {{ requestStatus(r.status).label }}
                </BaseBadge>
              </td>
              <td class="td">{{ r.periods_count }}</td>
              <td class="td">{{ r.total_days }}</td>
              <td class="td whitespace-nowrap">
                {{ r.requested_at ? formatDate(r.requested_at, true) : '—' }}
              </td>
              <td class="td whitespace-nowrap">
                <router-link
                  :to="{ name: 'VacationRequestDetail', params: { id: r.id } }"
                  class="btn-outline-primary btn-sm mr-1"
                >
                  Ver
                </router-link>
                <button
                  v-if="canCancel(r.status)"
                  class="btn-outline-danger btn-sm"
                  @click="cancelRequest(r.id)"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="warning-alert m-2">
          Nenhuma solicitação encontrada.
        </div>
      </div>

      <!-- Paginação -->
      <BasePagination :meta="paginationMeta" @prev="prev" @next="next" />
    </div>

    <!-- Erro -->
    <div v-if="error" class="error-alert mt-4">
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
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const { formatDate } = useDate()

  const { requestStatus } = useVacation()

  const REQUEST_COLORS = {
    draft: 'slate',
    submitted: 'info',
    under_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'dark',
  }
  const requestColor = (s) => REQUEST_COLORS[s] || 'slate'

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

  const paginationMeta = computed(() => ({
    page: page.value,
    total_pages: totalPages.value,
    has_prev: hasPrev.value,
    has_next: hasNext.value,
  }))

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
