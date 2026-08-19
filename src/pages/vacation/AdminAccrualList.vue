<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold">Períodos de Férias</h1>
        <p v-if="user" class="mb-0 text-sm text-slate-500 dark:text-slate-400">
          {{ user.name }} ({{ user.username }})
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select
          v-model="statusFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
        >
          <option value="">Todos os períodos</option>
          <option value="open">Em aberto (Concessivo e Aquisição)</option>
          <option v-for="(s, k) in ACCRUAL_STATUS" :key="k" :value="k">
            {{ s.label }}
          </option>
        </select>
        <router-link
          :to="{ name: 'VacationAdminAlerts' }"
          class="btn-outline-secondary"
        >
          <Icon name="arrow-left" class="h-4 w-4" aria-hidden="true" /> Voltar
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

    <div v-else class="space-y-3">
      <div
        v-for="period in filteredPeriods"
        :key="period.id"
        class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
          :aria-expanded="openPeriodId === period.id"
          @click="togglePeriod(period.id)"
        >
          Período #{{ period.period_number }}
          <BaseBadge :color="accrualColor(period.status)">
            {{ accrualStatus(period.status).label }}
          </BaseBadge>
          <BaseBadge v-if="period.is_double_eligible" color="danger">
            Elegível p/ dobro
          </BaseBadge>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="ml-auto h-4 w-4 transition-transform"
            :class="{ 'rotate-180': openPeriodId === period.id }"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
            />
          </svg>
        </button>

        <div
          v-if="openPeriodId === period.id"
          class="border-t border-slate-200 p-4 dark:border-slate-700"
        >
          <div class="mb-3 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400"
                >Aquisitivo</label
              >
              <p class="mb-0 text-sm font-bold">
                {{ formatDate(period.acquisitive_start, true) }} –
                {{ formatDate(period.acquisitive_end, true) }}
              </p>
            </div>
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400"
                >Concessivo</label
              >
              <p class="mb-0 text-sm font-bold">
                {{ formatDate(period.concessive_start, true) }} –
                {{ formatDate(period.concessive_end, true) }}
              </p>
            </div>
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400">
                Dias adquiridos
              </label>
              <p class="mb-0 text-sm font-bold">{{ period.days_earned }}</p>
            </div>
          </div>

          <div
            class="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-3 md:grid-cols-5"
          >
            <div>
              <div class="text-lg font-semibold text-sky-600 dark:text-sky-400">
                {{ period.days_reserved }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Reservados
              </div>
            </div>
            <div>
              <div
                class="text-lg font-semibold text-green-600 dark:text-green-400"
              >
                {{ period.days_enjoyed }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Gozo</div>
            </div>
            <div>
              <div
                class="text-lg font-semibold text-amber-600 dark:text-amber-400"
              >
                {{ period.days_sold }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Vendidos
              </div>
            </div>
            <div>
              <div class="text-lg font-semibold text-red-600 dark:text-red-400">
                {{ period.days_double_paid }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Dobro
              </div>
            </div>
            <div>
              <div
                class="text-lg font-semibold text-primary-600 dark:text-primary-400"
              >
                {{ period.available_days }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Disponíveis
              </div>
            </div>
          </div>

          <!-- Ações de RH -->
          <div
            v-if="rhActions(period).length"
            class="mb-3 flex flex-wrap gap-2"
          >
            <button
              v-if="rhActions(period).includes('register')"
              class="btn-outline-success btn-sm"
              @click="openGrantModal(period, 'normal')"
            >
              <Icon name="calendar-check" class="h-4 w-4" aria-hidden="true" />
              Marcar férias
            </button>
            <button
              v-if="rhActions(period).includes('sell')"
              class="btn-outline-warning btn-sm"
              @click="openSellModal(period)"
            >
              <Icon name="cash-stack" class="h-4 w-4" aria-hidden="true" />
              Vender dias
            </button>
            <button
              v-if="rhActions(period).includes('retroactive')"
              class="btn-outline-primary btn-sm"
              @click="openGrantModal(period, 'retroactive')"
            >
              <Icon name="calendar-check" class="h-4 w-4" aria-hidden="true" />
              Gozo retroativo
            </button>
            <button
              v-if="rhActions(period).includes('double_payment')"
              class="btn-outline-danger btn-sm"
              @click="openGrantModal(period, 'double_payment')"
            >
              <Icon
                name="exclamation-circle"
                class="h-4 w-4"
                aria-hidden="true"
              />
              Pagamento em dobro
            </button>
          </div>

          <!-- Concessões -->
          <div v-if="period.grants.length">
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
                    <th class="th">Tipo</th>
                    <th class="th">Status</th>
                    <th class="th">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="g in period.grants"
                    :key="g.id"
                    class="border-t border-slate-200 dark:border-slate-700"
                  >
                    <td class="td whitespace-nowrap">
                      {{ formatDate(g.start_date, true) }}
                    </td>
                    <td class="td whitespace-nowrap">
                      {{ formatDate(g.end_date, true) }}
                    </td>
                    <td class="td">{{ g.days_count }}</td>
                    <td class="td whitespace-nowrap">
                      {{ grantTypeLabel(g.grant_type) }}
                    </td>
                    <td class="td">
                      <BaseBadge :color="grantColor(g.status)">
                        {{ grantStatus(g.status).label }}
                      </BaseBadge>
                    </td>
                    <td class="td">{{ g.notes || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Vender dias -->
    <BaseModal
      :open="sellOpen"
      title="Vender dias de férias"
      @close="sellOpen = false"
    >
      <form id="sell-form" @submit.prevent="doSell">
        <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Período #{{ sellTarget?.period_number }} — saldo disponível:
          {{ sellTarget?.available_days }} dias.
        </p>
        <div>
          <label class="label-base" for="sell-days"
            >Dias para vender (máx. 10)</label
          >
          <input
            id="sell-days"
            v-model.number="sellForm.days"
            type="number"
            class="input-base"
            min="1"
            max="10"
            required
          />
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn-outline-secondary"
          @click="sellOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="sell-form"
          class="btn-warning"
          :disabled="submitting"
        >
          <BaseSpinner v-if="submitting" class="h-4 w-4" />
          Vender
        </button>
      </template>
    </BaseModal>

    <!-- Modal Marcar férias / Gozo retroativo / Pagamento em dobro -->
    <BaseModal
      :open="grantOpen"
      :title="grantModalInfo.title"
      :tone="grantModalInfo.tone"
      @close="grantOpen = false"
    >
      <form id="grant-form" @submit.prevent="doGrant">
        <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Período #{{ grantTarget?.period_number }} — saldo disponível:
          {{ grantTarget?.available_days }} dias.
        </p>
        <div class="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="label-base"
              >Início
              <span class="text-red-600 dark:text-red-400">*</span></label
            >
            <input
              v-model="grantForm.start_date"
              type="date"
              class="input-base"
              required
            />
          </div>
          <div>
            <label class="label-base"
              >Fim <span class="text-red-600 dark:text-red-400">*</span></label
            >
            <input
              v-model="grantForm.end_date"
              type="date"
              class="input-base"
              required
            />
          </div>
        </div>
        <div>
          <label class="label-base" for="grant-notes"
            >Observações (opcional)</label
          >
          <textarea
            id="grant-notes"
            v-model="grantForm.notes"
            class="input-base"
            rows="2"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn-outline-secondary"
          @click="grantOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="grant-form"
          class="btn-primary"
          :class="{ 'btn-danger': grantModalType === 'double_payment' }"
          :disabled="submitting"
        >
          <BaseSpinner v-if="submitting" class="h-4 w-4" />
          Salvar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useVacation, ACCRUAL_STATUS } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'
  import { UsersService } from '@/services/users.services'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BaseModal from '@/components/BaseModal.vue'

  const props = defineProps({
    userId: { type: [String, Number], required: true },
  })

  const { formatDate } = useDate()
  const { accrualStatus, grantStatus, grantTypeLabel } = useVacation()

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

  const user = ref(null)
  const periods = ref([])
  const loading = ref(false)
  const error = ref(null)
  const submitting = ref(false)
  const statusFilter = ref('')
  const openPeriodId = ref(null)

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

  const sellOpen = ref(false)
  const sellTarget = ref(null)
  const sellForm = ref({ days: 1 })

  const grantOpen = ref(false)
  const grantTarget = ref(null)
  const grantModalType = ref('retroactive')
  const grantForm = ref({ start_date: '', end_date: '', notes: '' })

  const grantModalInfo = computed(() => {
    if (grantModalType.value === 'double_payment') {
      return { title: 'Pagamento em dobro', tone: 'danger' }
    }
    if (grantModalType.value === 'normal') {
      return { title: 'Marcar férias', tone: 'success' }
    }
    return { title: 'Gozo retroativo', tone: 'default' }
  })

  function togglePeriod(id) {
    openPeriodId.value = openPeriodId.value === id ? null : id
  }

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
      if (periods.value.length) {
        openPeriodId.value = periods.value[0].id
      }
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
    sellOpen.value = true
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
      sellOpen.value = false
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
    grantOpen.value = true
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
      grantOpen.value = false
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
