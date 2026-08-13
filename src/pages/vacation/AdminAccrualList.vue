<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-0">Períodos de Férias</h1>
        <p v-if="user" class="text-muted mb-0">
          {{ user.name }} ({{ user.username }})
        </p>
      </div>
      <div class="d-flex gap-2">
        <select
          v-model="statusFilter"
          class="form-select form-select-sm w-auto"
        >
          <option value="">Todos os períodos</option>
          <option value="open">Em aberto (Concessivo e Aquisição)</option>
          <option v-for="(s, k) in ACCRUAL_STATUS" :key="k" :value="k">
            {{ s.label }}
          </option>
        </select>
        <router-link
          :to="{ name: 'VacationAdminAlerts' }"
          class="btn btn-outline-secondary"
        >
          <i class="bi bi-arrow-left me-1"></i> Voltar
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

    <div v-else class="accordion" id="accrualAccordion">
      <div
        v-for="(period, idx) in filteredPeriods"
        :key="period.id"
        class="accordion-item"
      >
        <h2 class="accordion-header">
          <button
            class="accordion-button"
            :class="{ collapsed: idx !== 0 }"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#period-' + period.id"
            aria-expanded="idx === 0"
          >
            Período #{{ period.period_number }}
            <span :class="accrualStatus(period.status).badge" class="ms-2">
              {{ accrualStatus(period.status).label }}
            </span>
            <span v-if="period.is_double_eligible" class="badge bg-danger ms-2">
              Elegível p/ dobro
            </span>
          </button>
        </h2>
        <div
          :id="'period-' + period.id"
          class="accordion-collapse collapse"
          :class="{ show: idx === 0 }"
          :data-bs-parent="'#accrualAccordion'"
        >
          <div class="accordion-body">
            <div class="row text-center mb-3">
              <div class="col-4">
                <label class="form-label text-muted small">Aquisitivo</label>
                <p class="mb-0 fw-bold">
                  {{ formatDate(period.acquisitive_start, true) }} –
                  {{ formatDate(period.acquisitive_end, true) }}
                </p>
              </div>
              <div class="col-4">
                <label class="form-label text-muted small">Concessivo</label>
                <p class="mb-0 fw-bold">
                  {{ formatDate(period.concessive_start, true) }} –
                  {{ formatDate(period.concessive_end, true) }}
                </p>
              </div>
              <div class="col-4">
                <label class="form-label text-muted small">
                  Dias adquiridos
                </label>
                <p class="mb-0 fw-bold">{{ period.days_earned }}</p>
              </div>
            </div>

            <div class="row text-center mb-3">
              <div class="col-2">
                <div class="text-info fs-5">{{ period.days_reserved }}</div>
                <div class="text-muted small">Reservados</div>
              </div>
              <div class="col-2">
                <div class="text-success fs-5">{{ period.days_enjoyed }}</div>
                <div class="text-muted small">Gozo</div>
              </div>
              <div class="col-2">
                <div class="text-warning fs-5">{{ period.days_sold }}</div>
                <div class="text-muted small">Vendidos</div>
              </div>
              <div class="col-2">
                <div class="text-danger fs-5">
                  {{ period.days_double_paid }}
                </div>
                <div class="text-muted small">Dobro</div>
              </div>
              <div class="col-4">
                <div class="text-primary fs-5">
                  {{ period.available_days }}
                </div>
                <div class="text-muted small">Disponíveis</div>
              </div>
            </div>

            <!-- Ações de RH -->
            <div
              v-if="rhActions(period).length"
              class="d-flex gap-2 flex-wrap mb-3"
            >
              <button
                v-if="rhActions(period).includes('register')"
                class="btn btn-sm btn-outline-success"
                @click="openGrantModal(period, 'normal')"
              >
                <i class="bi bi-calendar-check me-1"></i> Marcar férias
              </button>
              <button
                v-if="rhActions(period).includes('sell')"
                class="btn btn-sm btn-outline-warning"
                @click="openSellModal(period)"
              >
                <i class="bi bi-cash-stack me-1"></i> Vender dias
              </button>
              <button
                v-if="rhActions(period).includes('retroactive')"
                class="btn btn-sm btn-outline-primary"
                @click="openGrantModal(period, 'retroactive')"
              >
                <i class="bi bi-calendar-check me-1"></i> Gozo retroativo
              </button>
              <button
                v-if="rhActions(period).includes('double_payment')"
                class="btn btn-sm btn-outline-danger"
                @click="openGrantModal(period, 'double_payment')"
              >
                <i class="bi bi-exclamation-circle me-1"></i> Pagamento em dobro
              </button>
            </div>

            <!-- Concessões -->
            <div v-if="period.grants.length">
              <h6 class="text-muted">Concessões</h6>
              <div class="table-responsive">
                <table class="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Início</th>
                      <th>Fim</th>
                      <th>Dias</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="g in period.grants" :key="g.id">
                      <td>{{ formatDate(g.start_date, true) }}</td>
                      <td>{{ formatDate(g.end_date, true) }}</td>
                      <td>{{ g.days_count }}</td>
                      <td>{{ grantTypeLabel(g.grant_type) }}</td>
                      <td>
                        <span :class="grantStatus(g.status).badge">
                          {{ grantStatus(g.status).label }}
                        </span>
                      </td>
                      <td>{{ g.notes || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Vender dias -->
    <div class="modal fade" id="sellModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">Vender dias de férias</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="closeSellModal"
            ></button>
          </div>
          <form @submit.prevent="doSell">
            <div class="modal-body">
              <p>
                Período #{{ sellTarget?.period_number }} — saldo disponível:
                {{ sellTarget?.available_days }} dias.
              </p>
              <div class="mb-3">
                <label class="form-label">Dias para vender (máx. 10)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="sellForm.days"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeSellModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-warning"
                :disabled="submitting"
              >
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Vender
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Marcar férias / Gozo retroativo / Pagamento em dobro -->
    <div class="modal fade" id="grantModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" :class="grantModalInfo.headerClass">
            <h5 class="modal-title">{{ grantModalInfo.title }}</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Close"
              @click="closeGrantModal"
            ></button>
          </div>
          <form @submit.prevent="doGrant">
            <div class="modal-body">
              <p>
                Período #{{ grantTarget?.period_number }} — saldo disponível:
                {{ grantTarget?.available_days }} dias.
              </p>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >Início <span class="text-danger">*</span></label
                  >
                  <input
                    type="date"
                    class="form-control"
                    v-model="grantForm.start_date"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label"
                    >Fim <span class="text-danger">*</span></label
                  >
                  <input
                    type="date"
                    class="form-control"
                    v-model="grantForm.end_date"
                    required
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Observações (opcional)</label>
                <textarea
                  class="form-control"
                  v-model="grantForm.notes"
                  rows="2"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeGrantModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn"
                :class="grantModalInfo.submitClass"
                :disabled="submitting"
              >
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, inject } from 'vue'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useVacation, ACCRUAL_STATUS } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'
  import { UsersService } from '@/services/users.services'

  const props = defineProps({
    userId: { type: [String, Number], required: true },
  })

  const bootstrap = inject('bootstrap')

  const { formatDate } = useDate()
  const { accrualStatus, grantStatus, grantTypeLabel } = useVacation()

  const user = ref(null)
  const periods = ref([])
  const loading = ref(false)
  const error = ref(null)
  const submitting = ref(false)
  const statusFilter = ref('')

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

  const sellTarget = ref(null)
  const sellForm = ref({ days: 1 })

  const grantTarget = ref(null)
  const grantModalType = ref('retroactive')
  const grantForm = ref({ start_date: '', end_date: '', notes: '' })

  const grantModalInfo = computed(() => {
    if (grantModalType.value === 'double_payment') {
      return {
        title: 'Pagamento em dobro',
        headerClass: 'bg-danger text-white',
        submitClass: 'btn-danger',
      }
    }
    if (grantModalType.value === 'normal') {
      return {
        title: 'Marcar férias',
        headerClass: 'bg-success text-white',
        submitClass: 'btn-success',
      }
    }
    return {
      title: 'Gozo retroativo',
      headerClass: 'bg-primary text-white',
      submitClass: 'btn-primary',
    }
  })

  function rhActions(period) {
    const actions = []
    if (period.status === 'concessive' && period.available_days > 0) {
      actions.push('register')
      actions.push('sell')
    }
    if (period.status === 'expired') {
      actions.push('retroactive')
      actions.push('double_payment')
    }
    return actions
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const [userData, periodsData] = await Promise.all([
        UsersService.getById(props.userId),
        VacationService.getUserAccrualPeriods(props.userId),
      ])
      user.value = userData
      periods.value = periodsData
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar'
    } finally {
      loading.value = false
    }
  }

  function openSellModal(period) {
    sellTarget.value = period
    sellForm.value.days = 1
    new bootstrap.Modal(document.getElementById('sellModal')).show()
  }

  function closeSellModal() {
    bootstrap.Modal.getInstance(document.getElementById('sellModal'))?.hide()
  }

  async function doSell() {
    if (!sellTarget.value) return
    submitting.value = true
    try {
      await VacationService.sellDays(
        props.userId,
        sellTarget.value.id,
        sellForm.value.days,
      )
      successToast('Dias vendidos com sucesso.')
      closeSellModal()
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao vender',
      )
    } finally {
      submitting.value = false
    }
  }

  function openGrantModal(period, type) {
    grantTarget.value = period
    grantModalType.value = type
    grantForm.value = { start_date: '', end_date: '', notes: '' }
    new bootstrap.Modal(document.getElementById('grantModal')).show()
  }

  function closeGrantModal() {
    bootstrap.Modal.getInstance(document.getElementById('grantModal'))?.hide()
  }

  async function doGrant() {
    if (!grantTarget.value) return
    submitting.value = true
    try {
      await VacationService.createGrant(props.userId, grantTarget.value.id, {
        start_date: grantForm.value.start_date,
        end_date: grantForm.value.end_date,
        grant_type: grantModalType.value,
        notes: grantForm.value.notes || null,
      })
      successToast('Concessão registrada.')
      closeGrantModal()
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao salvar',
      )
    } finally {
      submitting.value = false
    }
  }

  onMounted(load)
</script>
