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
        :to="{ name: 'VacationAdminRequestsList' }"
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
            v-if="request.status === 'submitted'"
            class="btn btn-success"
            @click="openApproveModal"
          >
            <i class="bi bi-check-circle me-1"></i> Aprovar
          </button>
          <button
            v-if="request.status === 'submitted'"
            class="btn btn-danger"
            @click="openRejectModal"
          >
            <i class="bi bi-x-circle me-1"></i> Rejeitar
          </button>
          <router-link
            :to="{ name: 'VacationAdminRequestsList' }"
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
                <dt class="col-sm-5 text-muted">Usuário</dt>
                <dd class="col-sm-7">
                  {{ request.user_name }}
                  <router-link
                    :to="{
                      name: 'UsersDetail',
                      params: { id: request.user_id },
                    }"
                    class="ms-2 small"
                  >
                    Perfil
                  </router-link>
                  <router-link
                    :to="{
                      name: 'VacationAdminAccrualList',
                      params: { userId: request.user_id },
                    }"
                    class="ms-2 small"
                  >
                    Períodos
                  </router-link>
                </dd>
                <dt class="col-sm-5 text-muted">Período de referência</dt>
                <dd class="col-sm-7">
                  Período #{{ request.target_accrual_period_id }}
                </dd>
                <dt class="col-sm-5 text-muted">Total de dias</dt>
                <dd class="col-sm-7">{{ totalDays }}</dd>
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

      <!-- Modal Aprovar -->
      <div
        class="modal fade"
        id="approveModal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">Aprovar Solicitação</h5>
              <button
                type="button"
                class="btn-close btn-close-white"
                aria-label="Close"
                @click="closeApproveModal"
              ></button>
            </div>
            <form @submit.prevent="doApprove">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Observações (opcional)</label>
                  <textarea
                    class="form-control"
                    v-model="approveForm.reviewer_notes"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="closeApproveModal"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-success"
                  :disabled="approving"
                >
                  <span
                    v-if="approving"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Aprovar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Rejeitar -->
      <div class="modal fade" id="rejectModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Rejeitar Solicitação</h5>
              <button
                type="button"
                class="btn-close btn-close-white"
                aria-label="Close"
                @click="closeRejectModal"
              ></button>
            </div>
            <form @submit.prevent="doReject">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">
                    Observações <span class="text-danger">*</span>
                  </label>
                  <textarea
                    class="form-control"
                    v-model="rejectForm.reviewer_notes"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="closeRejectModal"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-danger"
                  :disabled="rejecting"
                >
                  <span
                    v-if="rejecting"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Rejeitar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, inject } from 'vue'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const props = defineProps({
    id: { type: [String, Number], required: true },
  })

  const bootstrap = inject('bootstrap')

  const { formatDate, formatDateTime } = useDate()
  const { requestStatus } = useVacation()

  const request = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const approveForm = ref({ reviewer_notes: '' })
  const rejectForm = ref({ reviewer_notes: '' })
  const approving = ref(false)
  const rejecting = ref(false)

  const totalDays = computed(() =>
    (request.value?.periods || []).reduce((sum, p) => sum + p.days_count, 0),
  )

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

  function openApproveModal() {
    approveForm.value.reviewer_notes = ''
    new bootstrap.Modal(document.getElementById('approveModal')).show()
  }

  function closeApproveModal() {
    bootstrap.Modal.getInstance(document.getElementById('approveModal'))?.hide()
  }

  function openRejectModal() {
    rejectForm.value.reviewer_notes = ''
    new bootstrap.Modal(document.getElementById('rejectModal')).show()
  }

  function closeRejectModal() {
    bootstrap.Modal.getInstance(document.getElementById('rejectModal'))?.hide()
  }

  async function doApprove() {
    approving.value = true
    try {
      await VacationService.approveRequest(props.id, {
        reviewer_notes: approveForm.value.reviewer_notes,
      })
      successToast('Solicitação aprovada.')
      closeApproveModal()
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao aprovar',
      )
    } finally {
      approving.value = false
    }
  }

  async function doReject() {
    if (!rejectForm.value.reviewer_notes.trim()) return
    rejecting.value = true
    try {
      await VacationService.rejectRequest(props.id, {
        reviewer_notes: rejectForm.value.reviewer_notes,
      })
      successToast('Solicitação rejeitada.')
      closeRejectModal()
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao rejeitar',
      )
    } finally {
      rejecting.value = false
    }
  }

  onMounted(load)
</script>
