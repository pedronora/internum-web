<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Alertas de Férias</h1>
      <router-link
        :to="{ name: 'VacationMyVacation' }"
        class="btn btn-outline-secondary"
      >
        <i class="bi bi-arrow-left me-1"></i> Voltar
      </router-link>
    </div>

    <div
      class="alert alert-warning d-flex align-items-center gap-2 mb-2"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle"></i>
      Períodos concessivos que precisam de atenção.
    </div>

    <div class="d-flex flex-column gap-2 mb-3 small text-muted">
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-danger">Vencido</span>
        <span
          >Concessivo já expirou — regularizar (gozo retroativo ou pagamento em
          dobro).</span
        >
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-warning text-dark">Prestes a vencer</span>
        <span>Concessivo vence em até 30 dias — basta marcar as férias.</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-info">Pendente de marcação</span>
        <span>Concessivo em aberto — basta marcar as férias.</span>
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

    <div v-else>
      <div v-if="alerts.length" class="table-responsive shadow-sm rounded">
        <table class="table table-striped table-hover align-middle mb-0">
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">Usuário</th>
              <th scope="col">Período</th>
              <th scope="col">Aquisitivo</th>
              <th scope="col">Concessivo</th>
              <th scope="col">Situação</th>
              <th scope="col">Saldo (dias)</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in alerts" :key="alert.id">
              <td>{{ alert.user_name }}</td>
              <td>#{{ alert.period_number }}</td>
              <td>
                {{ formatDate(alert.acquisitive_start, true) }} –
                {{ formatDate(alert.acquisitive_end, true) }}
              </td>
              <td>
                {{ formatDate(alert.concessive_start, true) }} –
                {{ formatDate(alert.concessive_end, true) }}
              </td>
              <td>
                <span :class="alertBadge(alert).badge">
                  {{ alertBadge(alert).label }}
                </span>
              </td>
              <td class="fw-bold">{{ alert.remaining_days }}</td>
              <td class="text-nowrap">
                <router-link
                  class="btn btn-sm btn-outline-primary"
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
      <div v-else class="alert alert-success" role="alert">
        Nenhum período requer atenção.
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useDate } from '@/composables/useDate'
  import { VacationService } from '@/services/vacation.services'

  const { formatDate } = useDate()

  const ALERT_TYPE = {
    expired: { label: 'Vencido', badge: 'badge bg-danger' },
    about_to_expire: {
      label: 'Prestes a vencer',
      badge: 'badge bg-warning text-dark',
    },
    pending: { label: 'Pendente de marcação', badge: 'badge bg-info' },
  }

  function alertBadge(alert) {
    return (
      ALERT_TYPE[alert.alert_type] || {
        label: alert.alert_type,
        badge: 'badge bg-secondary',
      }
    )
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
