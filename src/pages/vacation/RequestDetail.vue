<template>
  <div class="m-4">
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div v-else-if="error" class="error-alert">
      <strong>Erro:</strong> {{ error }}
      <router-link
        :to="{ name: 'VacationRequestsList' }"
        class="btn-outline-secondary btn-sm mt-2 inline-flex"
      >
        Voltar
      </router-link>
    </div>

    <div v-else-if="request">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="mb-1 text-2xl font-bold">Solicitação #{{ request.id }}</h1>
          <BaseBadge :color="requestColor(request.status)">
            {{ requestStatus(request.status).label }}
          </BaseBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="canCancel(request.status)"
            class="btn-outline-danger"
            @click="cancelRequest"
          >
            <Icon name="x-circle" class="h-4 w-4" aria-hidden="true" /> Cancelar
          </button>
          <router-link
            :to="{ name: 'VacationRequestsList' }"
            class="btn-outline-secondary"
          >
            <Icon name="arrow-left" class="h-4 w-4" aria-hidden="true" /> Voltar
          </router-link>
        </div>
      </div>

      <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div
            class="rounded-t-lg border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700"
          >
            Informações
          </div>
          <div
            class="grid grid-cols-1 gap-x-4 gap-y-2 p-4 text-sm sm:grid-cols-[8rem_1fr]"
          >
            <div class="text-slate-500 dark:text-slate-400">Status</div>
            <div>
              <BaseBadge :color="requestColor(request.status)">
                {{ requestStatus(request.status).label }}
              </BaseBadge>
            </div>
            <div class="text-slate-500 dark:text-slate-400">
              Período de referência
            </div>
            <div>{{ periodReference(request.target_accrual_period_id) }}</div>
            <div class="text-slate-500 dark:text-slate-400">Solicitado em</div>
            <div>
              {{
                request.requested_at
                  ? formatDateTime(request.requested_at)
                  : '—'
              }}
            </div>
            <div class="text-slate-500 dark:text-slate-400">Analisado em</div>
            <div>
              {{
                request.reviewed_at ? formatDateTime(request.reviewed_at) : '—'
              }}
            </div>
            <div class="text-slate-500 dark:text-slate-400">Analisado por</div>
            <div>{{ request.reviewer_name || '—' }}</div>
          </div>
        </div>

        <div
          class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div
            class="rounded-t-lg border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700"
          >
            Observações do analisador
          </div>
          <div class="p-4 text-sm">
            <p v-if="request.reviewer_notes" class="mb-0">
              {{ request.reviewer_notes }}
            </p>
            <p v-else class="mb-0 text-slate-500 dark:text-slate-400">—</p>
          </div>
        </div>
      </div>

      <!-- Períodos -->
      <div
        class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div
          class="rounded-t-lg border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700"
        >
          Períodos de gozo
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead
              class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <tr>
                <th class="th">#</th>
                <th class="th">Início</th>
                <th class="th">Fim</th>
                <th class="th">Tipo</th>
                <th class="th">Dias</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, i) in request.periods"
                :key="p.id"
                class="border-t border-slate-200 dark:border-slate-700"
              >
                <td class="td">{{ i + 1 }}</td>
                <td class="td whitespace-nowrap">
                  {{ formatDate(p.start_date, true) }}
                </td>
                <td class="td whitespace-nowrap">
                  {{ formatDate(p.end_date, true) }}
                </td>
                <td class="td">
                  <BaseBadge color="primary">
                    {{
                      p.period_type === 'main' ? 'Principal' : 'Complementar'
                    }}
                  </BaseBadge>
                </td>
                <td class="td">{{ p.days_count }}</td>
              </tr>
            </tbody>
          </table>
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
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

  const props = defineProps({
    id: { type: [String, Number], required: true },
  })

  const { formatDate, formatDateTime } = useDate()

  const { requestStatus } = useVacation()

  const REQUEST_COLORS = {
    draft: 'slate',
    submitted: 'info',
    under_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'dark',
  }
  const requestColor = (s) => REQUEST_COLORS[s] || 'slate'

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
