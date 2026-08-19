<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Alertas de Férias</h1>
      <router-link
        :to="{ name: 'VacationMyVacation' }"
        class="btn-outline-secondary"
      >
        <Icon name="arrow-left" class="h-4 w-4" aria-hidden="true" /> Voltar
      </router-link>
    </div>

    <div class="warning-alert mb-2 flex items-center gap-2" role="alert">
      <Icon name="exclamation-triangle" class="h-5 w-5" aria-hidden="true" />
      Períodos concessivos que precisam de atenção.
    </div>

    <div
      class="mb-3 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400"
    >
      <div class="flex items-center gap-2">
        <BaseBadge color="danger">Vencido</BaseBadge>
        <span>
          Concessivo já expirou — regularizar (gozo retroativo ou pagamento em
          dobro).
        </span>
      </div>
      <div class="flex items-center gap-2">
        <BaseBadge color="warning">Prestes a vencer</BaseBadge>
        <span>Concessivo vence em até 30 dias — basta marcar as férias.</span>
      </div>
      <div class="flex items-center gap-2">
        <BaseBadge color="info">Pendente de marcação</BaseBadge>
        <span>Concessivo em aberto — basta marcar as férias.</span>
      </div>
    </div>

    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div v-else-if="error" class="error-alert">
      <strong>Erro:</strong> {{ error }}
    </div>

    <div v-else>
      <div v-if="alerts.length" class="table-wrap">
        <table class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="th">Usuário</th>
              <th scope="col" class="th">Período</th>
              <th scope="col" class="th">Aquisitivo</th>
              <th scope="col" class="th">Concessivo</th>
              <th scope="col" class="th">Situação</th>
              <th scope="col" class="th">Saldo (dias)</th>
              <th scope="col" class="th">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="alert in alerts"
              :key="alert.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="td">{{ alert.user_name }}</td>
              <td class="td">#{{ alert.period_number }}</td>
              <td class="td whitespace-nowrap">
                {{ formatDate(alert.acquisitive_start, true) }} –
                {{ formatDate(alert.acquisitive_end, true) }}
              </td>
              <td class="td whitespace-nowrap">
                {{ formatDate(alert.concessive_start, true) }} –
                {{ formatDate(alert.concessive_end, true) }}
              </td>
              <td class="td">
                <BaseBadge :color="alertColor(alert)">
                  {{ alertBadge(alert).label }}
                </BaseBadge>
              </td>
              <td class="td font-bold">{{ alert.remaining_days }}</td>
              <td class="td whitespace-nowrap">
                <router-link
                  class="btn-outline-primary btn-sm"
                  :to="{
                    name: 'VacationAdminAccrualList',
                    params: { userId: alert.user_id },
                  }"
                >
                  {{ actionLabel(alert) }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="success-alert">Nenhum período requer atenção.</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useDate } from '@/composables/useDate'
  import { VacationService } from '@/services/vacation.services'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

  const { formatDate } = useDate()

  const ALERT_TYPE = {
    expired: 'Vencido',
    about_to_expire: 'Prestes a vencer',
    pending: 'Pendente de marcação',
  }

  const ALERT_COLORS = {
    expired: 'danger',
    about_to_expire: 'warning',
    pending: 'info',
  }
  const alertColor = (alert) => ALERT_COLORS[alert.alert_type] || 'slate'

  function alertBadge(alert) {
    return { label: ALERT_TYPE[alert.alert_type] || alert.alert_type }
  }

  function actionLabel(alert) {
    return alert.alert_type === 'expired' ? 'Regularizar' : 'Marcar'
  }

  const alerts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      alerts.value = await VacationService.getAlerts()
    } catch (err) {
      error.value =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro ao carregar alertas'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
</script>
