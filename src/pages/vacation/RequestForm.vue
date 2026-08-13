<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Nova Solicitação de Férias</h1>
      <router-link
        :to="{ name: 'VacationRequestsList' }"
        class="btn btn-outline-secondary"
      >
        <i class="bi bi-arrow-left me-1"></i> Voltar
      </router-link>
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
      v-else-if="!periodOptions.length"
      class="alert alert-warning"
      role="alert"
    >
      Não há períodos concessivos com saldo disponível para solicitar férias.
    </div>

    <form v-else @submit.prevent="submitForm" novalidate>
      <!-- Período aquisitivo -->
      <div class="card shadow-sm mb-4">
        <div class="card-header">
          <h5 class="mb-0">Período aquisitivo</h5>
        </div>
        <div class="card-body">
          <label class="form-label" for="targetPeriod">
            Período de referência <span class="text-danger">*</span>
          </label>
          <select
            id="targetPeriod"
            v-model="targetPeriodId"
            class="form-select"
            required
          >
            <option :value="null" disabled>Selecione o período...</option>
            <option v-for="p in periodOptions" :key="p.id" :value="p.id">
              Período #{{ p.period_number }} ({{
                formatDate(p.concessive_start, true)
              }}
              – {{ formatDate(p.concessive_end, true) }}) —
              {{ p.available_days }} dias disponíveis
            </option>
          </select>
          <div class="form-text">
            Os dias solicitados são descontados do saldo desse período.
          </div>
        </div>
      </div>

      <!-- Períodos de gozo -->
      <div class="card shadow-sm mb-4">
        <div class="card-header">
          <h5 class="mb-0">Períodos de gozo (máx. 3)</h5>
        </div>
        <div class="card-body">
          <div
            v-for="(period, index) in periods"
            :key="period.id"
            class="mb-3 p-3 border rounded bg-body-tertiary"
          >
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">Período {{ index + 1 }}</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removePeriod(index)"
                :disabled="periods.length <= 1"
                aria-label="Remover período"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label"
                  >Início <span class="text-danger">*</span></label
                >
                <input
                  type="date"
                  class="form-control"
                  v-model="period.start_date"
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
                  v-model="period.end_date"
                  required
                />
              </div>
            </div>
            <div v-if="periodDetail(index)" class="mt-2 small text-muted">
              <span class="badge bg-primary">{{
                periodDetail(index).period_type === 'main'
                  ? 'Principal'
                  : 'Complementar'
              }}</span>
              {{ periodDetail(index).calendar_days }} dias corridos
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="addPeriod"
              :disabled="periods.length >= 3"
            >
              <i class="bi bi-plus-lg me-1"></i> Adicionar Período
            </button>
            <span v-if="periods.length >= 3" class="text-muted small">
              Máximo de 3 períodos
            </span>
          </div>
        </div>
      </div>

      <!-- Preview / Validação CLT -->
      <div
        v-if="preview"
        class="card shadow-sm mb-4"
        :class="preview.valid ? 'border-success' : 'border-danger'"
      >
        <div
          class="card-header"
          :class="
            preview.valid ? 'bg-success text-white' : 'bg-danger text-white'
          "
        >
          <i
            :class="preview.valid ? 'bi bi-check-circle' : 'bi bi-x-circle'"
            class="me-1"
          ></i>
          {{ preview.valid ? 'Solicitação válida' : 'Erros de validação' }}
        </div>
        <div class="card-body">
          <div v-if="preview.errors.length" class="mb-3">
            <ul class="mb-0">
              <li v-for="(e, i) in preview.errors" :key="i" class="text-danger">
                {{ e }}
              </li>
            </ul>
          </div>
          <div v-if="preview.warnings.length" class="mb-3">
            <ul class="mb-0">
              <li
                v-for="(w, i) in preview.warnings"
                :key="i"
                class="text-warning"
              >
                {{ w }}
              </li>
            </ul>
          </div>
          <div class="row text-center">
            <div class="col-6">
              <div class="fw-bold fs-5">{{ preview.total_days }}</div>
              <div class="text-muted small">Dias corridos</div>
            </div>
            <div class="col-6">
              <div class="fw-bold fs-5">{{ periodCount }}</div>
              <div class="text-muted small">Períodos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="d-flex gap-2">
        <button
          type="submit"
          :disabled="!preview?.valid || submitting"
          class="btn btn-success"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm me-1"
          ></span>
          <i class="bi bi-send me-1"></i> Enviar para Aprovação
        </button>
        <router-link
          :to="{ name: 'VacationRequestsList' }"
          class="btn btn-outline-secondary"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const { formatDate } = useDate()

  const route = useRoute()
  const router = useRouter()

  const { requestablePeriods } = useVacation()

  const loading = ref(false)
  const error = ref(null)
  const submitting = ref(false)

  const allPeriods = ref([])
  const periodOptions = computed(() => requestablePeriods(allPeriods.value))

  const targetPeriodId = ref(null)
  const periods = ref([{ id: 1, start_date: '', end_date: '' }])
  let nextPeriodId = 2

  const preview = ref(null)

  const periodDetailMap = ref({})
  const periodDetail = (index) => periodDetailMap.value[index]

  const periodCount = computed(() => periods.value.length)

  async function load() {
    loading.value = true
    error.value = null
    try {
      allPeriods.value = await VacationService.getMyAccrualPeriods()
      const fromQuery = Number(route.query.period)
      if (fromQuery && periodOptions.value.some((p) => p.id === fromQuery)) {
        targetPeriodId.value = fromQuery
      } else if (periodOptions.value.length) {
        targetPeriodId.value = periodOptions.value[0].id
      }
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar saldo'
    } finally {
      loading.value = false
    }
  }

  function addPeriod() {
    if (periods.value.length >= 3) return
    periods.value.push({ id: nextPeriodId++, start_date: '', end_date: '' })
  }

  function removePeriod(index) {
    if (periods.value.length <= 1) return
    periods.value.splice(index, 1)
    periods.value.forEach((p, i) => {
      p.id = i + 1
    })
    nextPeriodId = periods.value.length + 1
  }

  function buildPayload() {
    return {
      target_accrual_period_id: targetPeriodId.value,
      periods: periods.value.map((p) => ({
        start_date: p.start_date,
        end_date: p.end_date,
      })),
    }
  }

  async function runPreview() {
    const filled = periods.value.filter((p) => p.start_date && p.end_date)
    if (!filled.length || !targetPeriodId.value) {
      preview.value = null
      periodDetailMap.value = {}
      return
    }
    try {
      const data = await VacationService.preview(buildPayload())
      preview.value = data
      const details = {}
      data.periods_detail.forEach((d, i) => {
        details[i] = d
      })
      periodDetailMap.value = details
    } catch (err) {
      preview.value = {
        valid: false,
        errors: [err?.response?.data?.detail || err?.message],
        warnings: [],
        total_days: 0,
        periods_detail: [],
      }
    }
  }

  async function submitForm() {
    if (!preview.value?.valid) return
    submitting.value = true
    try {
      await VacationService.createRequest(buildPayload())
      successToast('Solicitação enviada para aprovação.')
      router.push({ name: 'VacationRequestsList' })
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao solicitar',
      )
    } finally {
      submitting.value = false
    }
  }

  watch(
    periods,
    () => {
      runPreview()
    },
    { deep: true },
  )

  watch(targetPeriodId, () => {
    runPreview()
  })

  onMounted(load)
</script>
