<template>
  <div class="m-4">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Gerir Solicitações de Férias</h1>
    </div>

    <!-- Filtros -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="flex flex-wrap gap-2">
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

        <select
          v-model="sectorFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
          @change="reload"
        >
          <option value="">Todos os setores</option>
          <option v-for="s in setores" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>

        <select
          v-if="sectorFilter"
          v-model="subsetorFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
          @change="reload"
        >
          <option value="">Todos os subsetores</option>
          <option v-for="s in subsetores" :key="s" :value="s">{{ s }}</option>
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
              <th scope="col" class="th">Usuário</th>
              <th scope="col" class="th">Status</th>
              <th scope="col" class="th">Períodos</th>
              <th scope="col" class="th">Total Dias</th>
              <th scope="col" class="th">Solicitado em</th>
              <th scope="col" class="th">Criado em</th>
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
              <td class="td">{{ r.user_name }}</td>
              <td class="td">
                <BaseBadge :color="requestStatus(r.status).color">
                  {{ requestStatus(r.status).label }}
                </BaseBadge>
              </td>
              <td class="td">{{ r.periods_count }}</td>
              <td class="td">{{ r.total_days }}</td>
              <td class="td whitespace-nowrap">
                {{ r.requested_at ? formatDate(r.requested_at, true) : '—' }}
              </td>
              <td class="td whitespace-nowrap">
                {{ formatDateTime(r.created_at) }}
              </td>
              <td class="td whitespace-nowrap">
                <router-link
                  :to="{
                    name: 'VacationAdminRequestDetail',
                    params: { id: r.id },
                  }"
                  class="btn-outline-primary btn-sm"
                >
                  Ver
                </router-link>
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
  import { useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const { formatDate, formatDateTime } = useDate()
  const { requestStatus } = useVacation()

  const setores = [
    { value: 'registro', label: 'Registro' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'oficial', label: 'Oficial' },
  ]

  const SUBSETORES = {
    registro: [
      'Análise',
      'Conferência',
      'Finalização/Impressão',
      'Busca e Certidão',
      'Arquivo',
    ],
    administrativo: ['Atendimento', 'Digitalização', 'Apoio'],
    oficial: ['Titular', 'Substituto'],
  }

  const subsetores = computed(() => SUBSETORES[sectorFilter.value] || [])

  const requests = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(1)
  const limit = ref(20)
  const statusFilter = ref('')
  const sectorFilter = ref('')
  const subsetorFilter = ref('')

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

  async function load() {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (statusFilter.value) params.status = statusFilter.value

      if (sectorFilter.value) {
        if (subsetorFilter.value) params.subsetor = subsetorFilter.value
        requests.value = await VacationService.listRequestsBySector(
          sectorFilter.value,
          params,
        )
      } else {
        requests.value = await VacationService.listRequests(params)
      }
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro desconhecido'
    } finally {
      loading.value = false
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
