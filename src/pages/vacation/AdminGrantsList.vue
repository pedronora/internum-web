<template>
  <div class="m-4">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Gerir Concessões de Férias</h1>
    </div>

    <!-- Filtros -->
    <div
      class="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="flex flex-wrap gap-2">
        <select
          v-model="statusFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
          @change="reload"
        >
          <option value="">Todos os status</option>
          <option v-for="(v, k) in GRANT_STATUS" :key="k" :value="k">
            {{ v.label }}
          </option>
        </select>

        <select
          v-model="sectorFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
          @change="reload"
        >
          <option value="">Todos os setores</option>
          <option v-for="s in setores" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>

        <select
          v-if="sectorFilter"
          v-model="subsetorFilter"
          class="select-base w-auto rounded-md py-1 text-xs"
          @change="reload"
        >
          <option value="">Todos os subsetores</option>
          <option v-for="s in subsetores" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div v-if="!error" class="table-wrap mb-4">
        <table v-if="pagedGrants.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="th">Usuário</th>
              <th scope="col" class="th">Início</th>
              <th scope="col" class="th">Fim</th>
              <th scope="col" class="th">Dias</th>
              <th scope="col" class="th">Tipo</th>
              <th scope="col" class="th">Status</th>
              <th scope="col" class="th">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="g in pagedGrants"
              :key="g.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="td">{{ g.user_name || `Usuário #${g.user_id}` }}</td>
              <td class="td whitespace-nowrap">
                {{ formatDate(g.start_date, true) }}
              </td>
              <td class="td whitespace-nowrap">
                {{ formatDate(g.end_date, true) }}
              </td>
              <td class="td">{{ g.days_count }}</td>
              <td class="td">
                <BaseBadge color="slate">{{
                  grantTypeLabel(g.grant_type)
                }}</BaseBadge>
              </td>
              <td class="td">
                <BaseBadge :color="grantColor(g.status)">
                  {{ grantStatus(g.status).label }}
                </BaseBadge>
              </td>
              <td class="td whitespace-nowrap">
                <button
                  v-if="canConfirm(g.status)"
                  class="btn-outline-success btn-sm mr-1"
                  @click="openConfirmModal(g)"
                >
                  Confirmar fruição
                </button>
                <button
                  v-if="canConfirm(g.status)"
                  class="btn-outline-danger btn-sm"
                  @click="denyFruition(g)"
                >
                  Não fruiu
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="warning-alert m-2">
          Nenhuma concessão encontrada.
        </div>
      </div>

      <!-- Paginação -->
      <BasePagination :meta="paginationMeta" @prev="prev" @next="next" />
    </div>

    <!-- Erro -->
    <div v-if="error" class="error-alert mt-4">
      <strong>Erro:</strong> {{ error }}
    </div>

    <!-- Modal Confirmar fruição -->
    <BaseModal
      :open="confirmOpen"
      title="Confirmar fruição"
      tone="success"
      @close="confirmOpen = false"
    >
      <form id="confirm-form" @submit.prevent="doConfirm">
        <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Confirmar a fruição de
          <strong>{{ confirmTarget?.days_count }}</strong> dia(s) para
          {{
            confirmTarget?.user_name || `Usuário #${confirmTarget?.user_id}`
          }}?
        </p>
        <div>
          <label class="label-base" for="confirm-notes"
            >Observações (opcional)</label
          >
          <textarea
            id="confirm-notes"
            v-model="confirmForm.notes"
            class="input-base"
            rows="3"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn-outline-secondary"
          @click="confirmOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="confirm-form"
          class="btn-success"
          :disabled="submitting"
        >
          <BaseSpinner v-if="submitting" class="h-4 w-4" />
          Confirmar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useDate } from '@/composables/useDate'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { GRANT_STATUS, useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'
  import BaseModal from '@/components/BaseModal.vue'

  const { formatDate } = useDate()
  const { grantStatus, grantTypeLabel } = useVacation()

  const GRANT_COLORS = {
    granted: 'info',
    in_progress: 'warning',
    fruited: 'success',
    cancelled: 'dark',
    paid_double: 'danger',
  }
  const grantColor = (s) => GRANT_COLORS[s] || 'slate'

  const setores = [
    { value: 'registro', label: 'Registro' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'oficial', label: 'Oficial' },
  ]

  const SUBSETORES = {
    registro: [
      'Análise',
      'Conferência',
      'Finalização/Impressão',
      'Busca e Certidão',
      'Arquivo',
    ],
    administrativo: ['Atendimento', 'Digitalização', 'Apoio'],
    oficial: ['Titular', 'Substituto'],
  }

  const subsetores = computed(() => SUBSETORES[sectorFilter.value] || [])

  const grants = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(1)
  const limit = ref(20)
  const statusFilter = ref('')
  const sectorFilter = ref('')
  const subsetorFilter = ref('')

  const confirmOpen = ref(false)
  const confirmTarget = ref(null)
  const confirmForm = ref({ notes: '' })
  const submitting = ref(false)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(grants.value.length / limit.value)),
  )
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  const paginationMeta = computed(() => ({
    page: page.value,
    total_pages: totalPages.value,
    has_prev: hasPrev.value,
    has_next: hasNext.value,
  }))

  const pagedGrants = computed(() => {
    const start = (page.value - 1) * limit.value
    return grants.value.slice(start, start + limit.value)
  })

  function canConfirm(status) {
    return status === 'granted' || status === 'in_progress'
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const params = {}
      if (statusFilter.value) params.status = statusFilter.value

      if (sectorFilter.value) {
        if (subsetorFilter.value) params.subsetor = subsetorFilter.value
        grants.value = await VacationService.listGrantsBySector(
          sectorFilter.value,
          params,
        )
      } else {
        grants.value = await VacationService.listGrants(params)
      }
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err?.message || 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  function openConfirmModal(grant) {
    confirmTarget.value = grant
    confirmForm.value.notes = ''
    confirmOpen.value = true
  }

  async function doConfirm() {
    if (!confirmTarget.value) return
    submitting.value = true
    try {
      await VacationService.confirmFruition(confirmTarget.value.id, {
        confirm: true,
        notes: confirmForm.value.notes || null,
      })
      successToast('Fruição confirmada.')
      confirmOpen.value = false
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao confirmar',
      )
    } finally {
      submitting.value = false
    }
  }

  async function denyFruition(grant) {
    const ok = await confirmToast(
      `Registrar que ${grant.user_name || `Usuário #${grant.user_id}`} NÃO fruiu ` +
        `${grant.days_count} dia(s)? A concessão será cancelada e os dias devolvidos.`,
      { title: 'Registrar não-fruição' },
    )
    if (!ok) return
    try {
      await VacationService.confirmFruition(grant.id, { confirm: false })
      successToast('Não-fruição registrada.')
      await load()
    } catch (err) {
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao registrar',
      )
    }
  }

  function reload() {
    page.value = 1
    load()
  }

  function next() {
    if (hasNext.value) {
      page.value++
    }
  }

  function prev() {
    if (hasPrev.value) {
      page.value--
    }
  }

  onMounted(load)
</script>
