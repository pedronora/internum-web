<template>
  <div class="container m-4">
    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <strong>Erro:</strong> {{ error }}
      <router-link
        :to="{ name: 'VacationRequestsList' }"
        class="btn btn-sm btn-outline-secondary ms-2"
      >
        Voltar
      </router-link>
    </div>

    <div v-else-if="request">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="mb-1">Solicitação #{{ request.id }}</h1>
          <span :class="requestStatus(request.status).badge">
            {{ requestStatus(request.status).label }}
          </span>
        </div>
        <div class="d-flex gap-2">
          <button
            v-if="canCancel(request.status)"
            class="btn btn-outline-danger"
            @click="cancelRequest"
          >
            <i class="bi bi-x-circle me-1"></i> Cancelar
          </button>
          <router-link
            :to="{ name: 'VacationRequestsList' }"
            class="btn btn-outline-secondary"
          >
            <i class="bi bi-arrow-left me-1"></i> Voltar
          </router-link>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header">Informações</div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-5 text-muted">Status</dt>
                <dd class="col-sm-7">
                  <span :class="requestStatus(request.status).badge">
                    {{ requestStatus(request.status).label }}
                  </span>
                </dd>
                <dt class="col-sm-5 text-muted">Período de referência</dt>
                <dd class="col-sm-7">
                  {{ periodReference(request.target_accrual_period_id) }}
                </dd>
                <dt class="col-sm-5 text-muted">Solicitado em</dt>
                <dd class="col-sm-7">
                  {{
                    request.requested_at
                      ? formatDateTime(request.requested_at)
                      : '—'
                  }}
                </dd>
                <dt class="col-sm-5 text-muted">Analisado em</dt>
                <dd class="col-sm-7">
                  {{
                    request.reviewed_at
                      ? formatDateTime(request.reviewed_at)
                      : '—'
                  }}
                </dd>
                <dt class="col-sm-5 text-muted">Analisado por</dt>
                <dd class="col-sm-7">{{ request.reviewer_name || '—' }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header">Observações do analisador</div>
            <div class="card-body">
              <p v-if="request.reviewer_notes" class="mb-0">
                {{ request.reviewer_notes }}
              </p>
              <p v-else class="text-muted mb-0">—</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Períodos -->
      <div class="card shadow-sm">
        <div class="card-header">Períodos de gozo</div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-striped table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Tipo</th>
                  <th>Dias</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in request.periods" :key="p.id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ formatDate(p.start_date, true) }}</td>
                  <td>{{ formatDate(p.end_date, true) }}</td>
                  <td>
                    <span class="badge bg-primary">
                      {{
                        p.period_type === 'main' ? 'Principal' : 'Complementar'
                      }}
                    </span>
                  </td>
                  <td>{{ p.days_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const props = defineProps({
    id: { type: [String, Number], required: true },
  })

  const { formatDate, formatDateTime } = useDate()

  const { requestStatus } = useVacation()

  const request = ref(null)
  const loading = ref(true)
  const error = ref(null)

  function periodReference(periodId) {
    return `Período #${periodId}`
  }

  function canCancel(status) {
    return status === 'submitted' || status === 'under_review'
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      request.value = await VacationService.getRequest(props.id)
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar'
    } finally {
      loading.value = false
    }
  }

  async function cancelRequest() {
    const ok = await confirmToast('Deseja cancelar esta solicitação?', {
      title: 'Cancelar Solicitação',
    })
    if (!ok) return
    try {
      await VacationService.cancelRequest(props.id)
      successToast('Solicitação cancelada.')
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao cancelar',
      )
    }
  }

  onMounted(load)
</script>
