<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Nova Solicitação de Férias</h1>
      <router-link
        :to="{ name: 'VacationRequestsList' }"
        class="btn-outline-secondary"
      >
        <Icon name="arrow-left" class="h-4 w-4" aria-hidden="true" /> Voltar
      </router-link>
    </div>

    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div v-else-if="error" class="error-alert">
      <strong>Erro:</strong> {{ error }}
    </div>

    <div v-else-if="!periodOptions.length" class="warning-alert">
      Não há períodos concessivos com saldo disponível para solicitar férias.
    </div>

    <form v-else novalidate @submit.prevent="submitForm">
      <!-- Período aquisitivo -->
      <div
        class="mb-4 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div
          class="rounded-t-lg border-b border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <h5 class="font-semibold">Período aquisitivo</h5>
        </div>
        <div class="p-4">
          <label class="label-base" for="targetPeriod">
            Período de referência
            <span class="text-red-600 dark:text-red-400">*</span>
          </label>
          <select
            id="targetPeriod"
            v-model="targetPeriodId"
            class="select-base w-full"
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
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Os dias solicitados são descontados do saldo desse período.
          </p>
        </div>
      </div>

      <!-- Períodos de gozo -->
      <div
        class="mb-4 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div
          class="rounded-t-lg border-b border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <h5 class="font-semibold">Períodos de gozo (máx. 3)</h5>
        </div>
        <div class="p-4">
          <div
            v-for="(period, index) in periods"
            :key="period.id"
            class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div class="mb-2 flex items-center justify-between">
              <h6 class="font-semibold">Período {{ index + 1 }}</h6>
              <button
                type="button"
                class="btn-outline-danger btn-sm"
                :disabled="periods.length <= 1"
                aria-label="Remover período"
                @click="removePeriod(index)"
              >
                <Icon name="trash" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="label-base"
                  >Início
                  <span class="text-red-600 dark:text-red-400">*</span></label
                >
                <input
                  v-model="period.start_date"
                  type="date"
                  class="input-base"
                  required
                />
              </div>
              <div>
                <label class="label-base"
                  >Fim
                  <span class="text-red-600 dark:text-red-400">*</span></label
                >
                <input
                  v-model="period.end_date"
                  type="date"
                  class="input-base"
                  required
                />
              </div>
            </div>
            <div
              v-if="periodDetail(index)"
              class="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <BaseBadge color="primary">
                {{
                  periodDetail(index).period_type === 'main'
                    ? 'Principal'
                    : 'Complementar'
                }}
              </BaseBadge>
              {{ periodDetail(index).calendar_days }} dias corridos
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-outline-primary btn-sm"
              :disabled="periods.length >= 3"
              @click="addPeriod"
            >
              <Icon name="plus-lg" class="h-4 w-4" aria-hidden="true" />
              Adicionar Período
            </button>
            <span
              v-if="periods.length >= 3"
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              Máximo de 3 períodos
            </span>
          </div>
        </div>
      </div>

      <!-- Preview / Validação CLT -->
      <div
        v-if="preview"
        class="mb-4 rounded-lg border bg-white shadow-sm dark:bg-slate-800"
        :class="
          preview.valid
            ? 'border-green-500 dark:border-green-700'
            : 'border-red-500 dark:border-red-700'
        "
      >
        <div
          class="flex items-center gap-2 rounded-t-lg px-4 py-3"
          :class="
            preview.valid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          "
        >
          <Icon
            :name="preview.valid ? 'check-circle' : 'x-circle'"
            class="h-5 w-5"
            aria-hidden="true"
          />
          {{ preview.valid ? 'Solicitação válida' : 'Erros de validação' }}
        </div>
        <div class="p-4">
          <div v-if="preview.errors.length" class="mb-3">
            <ul class="mb-0 list-disc space-y-1 pl-5">
              <li
                v-for="(e, i) in preview.errors"
                :key="i"
                class="text-sm text-red-600 dark:text-red-400"
              >
                {{ e }}
              </li>
            </ul>
          </div>
          <div v-if="preview.warnings.length" class="mb-3">
            <ul class="mb-0 list-disc space-y-1 pl-5">
              <li
                v-for="(w, i) in preview.warnings"
                :key="i"
                class="text-sm text-amber-600 dark:text-amber-400"
              >
                {{ w }}
              </li>
            </ul>
          </div>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-lg font-bold">{{ preview.total_days }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Dias corridos
              </div>
            </div>
            <div>
              <div class="text-lg font-bold">{{ periodCount }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Períodos
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          :disabled="!preview?.valid || submitting"
          class="btn-success"
        >
          <BaseSpinner v-if="submitting" class="h-4 w-4" />
          <Icon v-else name="send" class="h-4 w-4" aria-hidden="true" />
          Enviar para Aprovação
        </button>
        <router-link
          :to="{ name: 'VacationRequestsList' }"
          class="btn-outline-secondary"
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
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

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
