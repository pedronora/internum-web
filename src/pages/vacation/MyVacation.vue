<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Minhas Férias</h1>
      <div class="flex flex-wrap gap-2">
        <select
          v-model="statusFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
        >
          <option value="open">Em aberto (Concessivo e Aquisição)</option>
          <option value="">Todos os períodos</option>
          <option v-for="(s, k) in ACCRUAL_STATUS" :key="k" :value="k">
            {{ s.label }}
          </option>
        </select>
        <router-link
          :to="{ name: 'VacationRequestsCreate' }"
          class="btn-success"
        >
          <Icon name="plus-lg" class="h-4 w-4" aria-hidden="true" /> Nova
          Solicitação
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div v-else-if="error" class="error-alert">
      <strong>Erro:</strong> {{ error }}
    </div>

    <div v-else-if="!filteredPeriods.length" class="warning-alert">
      Nenhum período corresponde ao filtro selecionado.
    </div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="period in filteredPeriods"
        :key="period.id"
        class="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div
          class="flex items-center justify-between rounded-t-lg border-b border-slate-200 px-4 py-3 dark:border-slate-700"
          :class="period.status === 'expired' ? 'bg-red-600 text-white' : ''"
        >
          <h5 class="font-semibold">Período #{{ period.period_number }}</h5>
          <BaseBadge :color="accrualColor(period.status)">
            {{ accrualStatus(period.status).label }}
          </BaseBadge>
        </div>
        <div class="flex flex-1 flex-col gap-3 p-4">
          <!-- Linha do tempo -->
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400"
                >Aquisitivo</label
              >
              <p class="mb-0 font-bold text-sm">
                {{ formatDate(period.acquisitive_start, true) }} –
                {{ formatDate(period.acquisitive_end, true) }}
              </p>
            </div>
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400"
                >Concessivo</label
              >
              <p class="mb-0 font-bold text-sm">
                {{ formatDate(period.concessive_start, true) }} –
                {{ formatDate(period.concessive_end, true) }}
              </p>
            </div>
          </div>

          <!-- Progresso da fase aquisitiva: nenhum número de dias exposto -->
          <div v-if="counters(period).isAcquisitive">
            <label class="text-xs text-slate-500 dark:text-slate-400">
              Período em aquisição (agendado para
              {{ formatDate(period.acquisitive_end, true) }})
            </label>
            <div
              class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-label="Período em aquisição"
            >
              <div
                class="h-full rounded-full bg-sky-500"
                :style="{ width: progress(period) + '%' }"
              ></div>
            </div>
            <small class="text-slate-500 dark:text-slate-400">
              Os dias desse período ficarão disponíveis ao seu término.
            </small>
          </div>

          <!-- Contadores -->
          <div v-else class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div
                class="text-green-600 text-xl font-semibold dark:text-green-400"
              >
                {{ counters(period).earned ?? '—' }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Adquiridos
              </div>
            </div>
            <div>
              <div class="text-sky-600 text-xl font-semibold dark:text-sky-400">
                {{ counters(period).reserved ?? '—' }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Reservados
              </div>
            </div>
            <div>
              <div
                class="text-amber-600 text-xl font-semibold dark:text-amber-400"
              >
                {{ counters(period).available ?? '—' }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Disponíveis
              </div>
            </div>
            <div class="mt-2">
              <div
                class="text-primary-600 text-xl font-semibold dark:text-primary-400"
              >
                {{ counters(period).enjoyed ?? '—' }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Gozo</div>
            </div>
            <div v-if="(counters(period).sold ?? 0) > 0" class="mt-2">
              <div class="text-red-600 text-xl font-semibold dark:text-red-400">
                {{ counters(period).sold }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Vendidos
              </div>
            </div>
            <div v-if="(counters(period).doublePaid ?? 0) > 0" class="mt-2">
              <div class="text-red-600 text-xl font-semibold dark:text-red-400">
                {{ counters(period).doublePaid }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Pago em dobro
              </div>
            </div>
          </div>

          <!-- Aviso gestor: período vencido -->
          <div
            v-if="isManager && period.status === 'expired'"
            class="warning-alert py-2 text-sm"
            role="alert"
          >
            Período concessivo vencido com saldo. ({{
              counters(period).available ?? 0
            }}
            dias)
            <router-link
              class="font-semibold text-amber-700 underline dark:text-amber-300"
              :to="{
                name: 'VacationAdminAccrualList',
                params: { userId: period.user_id },
              }"
            >
              Regularizar
            </router-link>
          </div>

          <!-- Ação: solicitar férias -->
          <router-link
            v-if="period.status === 'concessive' && period.available_days > 0"
            class="btn-outline-success w-full"
            :to="{
              name: 'VacationRequestsCreate',
              query: { period: period.id },
            }"
          >
            <Icon name="calendar-plus" class="h-4 w-4" aria-hidden="true" />
            Solicitar Férias deste período
          </router-link>

          <!-- Concessões -->
          <div v-if="visibleGrants(period.grants).length" class="mt-auto">
            <hr class="border-slate-200 dark:border-slate-700" />
            <h6
              class="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              Concessões
            </h6>
            <div
              class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <table class="w-full text-sm">
                <thead
                  class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <tr>
                    <th class="th">Início</th>
                    <th class="th">Fim</th>
                    <th class="th">Dias</th>
                    <th class="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="grant in visibleGrants(period.grants)"
                    :key="grant.id"
                    class="border-t border-slate-200 dark:border-slate-700"
                  >
                    <td class="td whitespace-nowrap">
                      {{ formatDate(grant.start_date, true) }}
                    </td>
                    <td class="td whitespace-nowrap">
                      {{ formatDate(grant.end_date, true) }}
                    </td>
                    <td class="td">{{ grant.days_count }}</td>
                    <td class="td">
                      <BaseBadge :color="grantColor(grant.status)">
                        {{ grantStatus(grant.status).label }}
                      </BaseBadge>
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
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useDate } from '@/composables/useDate'
  import { useVacation, ACCRUAL_STATUS } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

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

  const ACCRUAL_COLORS = {
    acquisitive: 'info',
    concessive: 'success',
    expired: 'danger',
    closed: 'slate',
  }
  const GRANT_COLORS = {
    granted: 'info',
    in_progress: 'warning',
    fruited: 'success',
    cancelled: 'dark',
    paid_double: 'danger',
  }
  const accrualColor = (s) => ACCRUAL_COLORS[s] || 'slate'
  const grantColor = (s) => GRANT_COLORS[s] || 'slate'

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
