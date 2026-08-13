<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Minhas Férias</h1>
      <div class="d-flex gap-2">
        <select
          v-model="statusFilter"
          class="form-select form-select-sm w-auto"
        >
          <option value="open">Em aberto (Concessivo e Aquisição)</option>
          <option value="">Todos os períodos</option>
          <option v-for="(s, k) in ACCRUAL_STATUS" :key="k" :value="k">
            {{ s.label }}
          </option>
        </select>
        <router-link
          :to="{ name: 'VacationRequestsCreate' }"
          class="btn btn-success"
        >
          <i class="bi bi-plus-lg me-1"></i> Nova Solicitação
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>

    <div
      v-else-if="!filteredPeriods.length"
      class="alert alert-warning"
      role="alert"
    >
      Nenhum período corresponde ao filtro selecionado.
    </div>

    <div v-else class="row g-4">
      <div v-for="period in filteredPeriods" :key="period.id" class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div
            class="card-header d-flex justify-content-between align-items-center"
            :class="period.status === 'expired' ? 'bg-danger text-white' : ''"
          >
            <h5 class="mb-0">Período #{{ period.period_number }}</h5>
            <span :class="accrualStatus(period.status).badge">
              {{ accrualStatus(period.status).label }}
            </span>
          </div>
          <div class="card-body">
            <!-- Linha do tempo -->
            <div class="row text-center mb-3">
              <div class="col-6">
                <label class="form-label text-muted small">Aquisitivo</label>
                <p class="mb-0 fw-bold">
                  {{ formatDate(period.acquisitive_start, true) }} –
                  {{ formatDate(period.acquisitive_end, true) }}
                </p>
              </div>
              <div class="col-6">
                <label class="form-label text-muted small">Concessivo</label>
                <p class="mb-0 fw-bold">
                  {{ formatDate(period.concessive_start, true) }} –
                  {{ formatDate(period.concessive_end, true) }}
                </p>
              </div>
            </div>

            <!-- Progresso da fase aquisitiva: nenhum número de dias exposto -->
            <div v-if="counters(period).isAcquisitive" class="mb-3">
              <label class="form-label text-muted small">
                Período em aquisição (agendado para
                {{ formatDate(period.acquisitive_end, true) }})
              </label>
              <div
                class="progress"
                role="progressbar"
                aria-label="Período em aquisição"
              >
                <div
                  class="progress-bar bg-info"
                  :style="{ width: progress(period) + '%' }"
                ></div>
              </div>
              <small class="text-muted">
                Os dias desse período ficarão disponíveis ao seu término.
              </small>
            </div>

            <!-- Contadores -->
            <div v-else class="row text-center mb-3">
              <div class="col-4">
                <div class="text-success fs-4">
                  {{ counters(period).earned ?? '—' }}
                </div>
                <div class="text-muted small">Adquiridos</div>
              </div>
              <div class="col-4">
                <div class="text-info fs-4">
                  {{ counters(period).reserved ?? '—' }}
                </div>
                <div class="text-muted small">Reservados</div>
              </div>
              <div class="col-4">
                <div class="text-warning fs-4">
                  {{ counters(period).available ?? '—' }}
                </div>
                <div class="text-muted small">Disponíveis</div>
              </div>
              <div class="col-4 mt-2">
                <div class="text-primary fs-4">
                  {{ counters(period).enjoyed ?? '—' }}
                </div>
                <div class="text-muted small">Gozo</div>
              </div>
              <div v-if="(counters(period).sold ?? 0) > 0" class="col-4 mt-2">
                <div class="text-danger fs-4">{{ counters(period).sold }}</div>
                <div class="text-muted small">Vendidos</div>
              </div>
              <div
                v-if="(counters(period).doublePaid ?? 0) > 0"
                class="col-4 mt-2"
              >
                <div class="text-danger fs-4">
                  {{ counters(period).doublePaid }}
                </div>
                <div class="text-muted small">Pago em dobro</div>
              </div>
            </div>

            <!-- Aviso gestor: período vencido -->
            <div
              v-if="isManager && period.status === 'expired'"
              class="alert alert-warning py-2 small mb-3"
              role="alert"
            >
              Período concessivo vencido com saldo. ({{
                counters(period).available ?? 0
              }}
              dias)
              <router-link
                class="alert-link"
                :to="{
                  name: 'VacationAdminAccrualList',
                  params: { userId: period.user_id },
                }"
              >
                Regularizar
              </router-link>
            </div>

            <!-- Ação: solicitar férias -->
            <div
              v-if="period.status === 'concessive' && period.available_days > 0"
              class="d-grid"
            >
              <router-link
                class="btn btn-outline-success"
                :to="{
                  name: 'VacationRequestsCreate',
                  query: { period: period.id },
                }"
              >
                <i class="bi bi-calendar-plus me-1"></i> Solicitar Férias deste
                período
              </router-link>
            </div>

            <!-- Concessões -->
            <div v-if="visibleGrants(period.grants).length">
              <hr />
              <h6 class="text-muted">Concessões</h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Início</th>
                      <th>Fim</th>
                      <th>Dias</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="grant in visibleGrants(period.grants)"
                      :key="grant.id"
                    >
                      <td>{{ formatDate(grant.start_date, true) }}</td>
                      <td>{{ formatDate(grant.end_date, true) }}</td>
                      <td>{{ grant.days_count }}</td>
                      <td>
                        <span :class="grantStatus(grant.status).badge">
                          {{ grantStatus(grant.status).label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useDate } from '@/composables/useDate'
  import { useVacation, ACCRUAL_STATUS } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const { formatDate } = useDate()

  const {
    isManager,
    accrualStatus,
    grantStatus,
    visiblePeriods,
    visibleGrants,
    periodCounters,
    acquisitiveProgress,
  } = useVacation()

  const periods = ref([])
  const loading = ref(false)
  const error = ref(null)
  const statusFilter = ref('open')

  const filteredPeriods = computed(() => {
    const all = periods.value
    if (statusFilter.value === 'open') {
      return all.filter(
        (p) => p.status === 'concessive' || p.status === 'acquisitive',
      )
    }
    if (statusFilter.value) {
      return all.filter((p) => p.status === statusFilter.value)
    }
    return all
  })

  const countersMap = {}
  const progressMap = {}

  function counters(period) {
    if (!countersMap[period.id]) {
      countersMap[period.id] = periodCounters(period)
    }
    return countersMap[period.id]
  }

  function progress(period) {
    if (progressMap[period.id] === undefined) {
      progressMap[period.id] = acquisitiveProgress(period)
    }
    return progressMap[period.id]
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const data = await VacationService.getMyAccrualPeriods()
      periods.value = visiblePeriods(data)
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar férias'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
</script>
