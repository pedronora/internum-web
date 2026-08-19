<template>
  <div class="m-4">
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div v-else-if="error" class="error-alert">
      <strong>Erro:</strong> {{ error }}
      <router-link
        :to="{ name: 'VacationAdminRequestsList' }"
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
          <BaseBadge :color="requestStatus(request.status).color">
            {{ requestStatus(request.status).label }}
          </BaseBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="request.status === 'submitted'"
            class="btn-success"
            @click="openApproveModal"
          >
            <Icon name="check-circle" class="h-4 w-4" aria-hidden="true" />
            Aprovar
          </button>
          <button
            v-if="request.status === 'submitted'"
            class="btn-danger"
            @click="openRejectModal"
          >
            <Icon name="x-circle" class="h-4 w-4" aria-hidden="true" /> Rejeitar
          </button>
          <router-link
            :to="{ name: 'VacationAdminRequestsList' }"
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
            <div class="text-slate-500 dark:text-slate-400">Usuário</div>
            <div>
              {{ request.user_name }}
              <router-link
                :to="{
                  name: 'UsersDetail',
                  params: { id: request.user_id },
                }"
                class="ml-2 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                Perfil
              </router-link>
              <router-link
                :to="{
                  name: 'VacationAdminAccrualList',
                  params: { userId: request.user_id },
                }"
                class="ml-2 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                Períodos
              </router-link>
            </div>
            <div class="text-slate-500 dark:text-slate-400">
              Período de referência
            </div>
            <div>Período #{{ request.target_accrual_period_id }}</div>
            <div class="text-slate-500 dark:text-slate-400">Total de dias</div>
            <div>{{ totalDays }}</div>
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

      <!-- Modal Aprovar -->
      <BaseModal
        :open="approveOpen"
        title="Aprovar Solicitação"
        tone="success"
        @close="approveOpen = false"
      >
        <form id="approve-form" @submit.prevent="doApprove">
          <div>
            <label class="label-base" for="approve-notes"
              >Observações (opcional)</label
            >
            <textarea
              id="approve-notes"
              v-model="approveForm.reviewer_notes"
              class="input-base"
              rows="3"
            ></textarea>
          </div>
        </form>
        <template #footer>
          <button
            type="button"
            class="btn-outline-secondary"
            @click="approveOpen = false"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="approve-form"
            class="btn-success"
            :disabled="approving"
          >
            <BaseSpinner v-if="approving" class="h-4 w-4" />
            Aprovar
          </button>
        </template>
      </BaseModal>

      <!-- Modal Rejeitar -->
      <BaseModal
        :open="rejectOpen"
        title="Rejeitar Solicitação"
        tone="danger"
        @close="rejectOpen = false"
      >
        <form id="reject-form" @submit.prevent="doReject">
          <div>
            <label class="label-base" for="reject-notes">
              Observações <span class="text-red-600 dark:text-red-400">*</span>
            </label>
            <textarea
              id="reject-notes"
              v-model="rejectForm.reviewer_notes"
              class="input-base"
              rows="3"
              required
            ></textarea>
          </div>
        </form>
        <template #footer>
          <button
            type="button"
            class="btn-outline-secondary"
            @click="rejectOpen = false"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="reject-form"
            class="btn-danger"
            :disabled="rejecting"
          >
            <BaseSpinner v-if="rejecting" class="h-4 w-4" />
            Rejeitar
          </button>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
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
  import BaseModal from '@/components/BaseModal.vue'

  const props = defineProps({
    id: { type: [String, Number], required: true },
  })

  const { formatDate, formatDateTime } = useDate()
  const { requestStatus } = useVacation()

  const request = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const approveOpen = ref(false)
  const rejectOpen = ref(false)
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
    approveOpen.value = true
  }

  function openRejectModal() {
    rejectForm.value.reviewer_notes = ''
    rejectOpen.value = true
  }

  async function doApprove() {
    approving.value = true
    try {
      await VacationService.approveRequest(props.id, {
        reviewer_notes: approveForm.value.reviewer_notes,
      })
      successToast('Solicitação aprovada.')
      approveOpen.value = false
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
      rejectOpen.value = false
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
