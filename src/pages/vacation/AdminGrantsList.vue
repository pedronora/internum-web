<template>
  <div class="container m-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Gerir Concessões de Férias</h1>
    </div>

    <!-- Filtros -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 border rounded bg-body border-secondary border-opacity-25"
    >
      <div class="d-flex gap-2 flex-wrap">
        <select
          v-model="statusFilter"
          class="form-select form-select-sm w-auto"
          @change="reload"
        >
          <option value="">Todos os status</option>
          <option v-for="(v, k) in GRANT_STATUS" :key="k" :value="k">
            {{ v.label }}
          </option>
        </select>

        <select
          v-model="sectorFilter"
          class="form-select form-select-sm w-auto"
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
          class="form-select form-select-sm w-auto"
          @change="reload"
        >
          <option value="">Todos os subsetores</option>
          <option v-for="s in subsetores" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div v-if="!error" class="table-responsive shadow-sm rounded mb-4">
        <table
          v-if="pagedGrants.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark align-middle">
            <tr>
              <th scope="col">Usuário</th>
              <th scope="col">Início</th>
              <th scope="col">Fim</th>
              <th scope="col">Dias</th>
              <th scope="col">Tipo</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in pagedGrants" :key="g.id">
              <td>{{ g.user_name || `Usuário #${g.user_id}` }}</td>
              <td>{{ formatDate(g.start_date, true) }}</td>
              <td>{{ formatDate(g.end_date, true) }}</td>
              <td>{{ g.days_count }}</td>
              <td>
                <span class="badge bg-secondary">{{
                  grantTypeLabel(g.grant_type)
                }}</span>
              </td>
              <td>
                <span :class="grantStatus(g.status).badge">
                  {{ grantStatus(g.status).label }}
                </span>
              </td>
              <td class="text-nowrap">
                <button
                  v-if="canConfirm(g.status)"
                  class="btn btn-sm btn-outline-success me-1"
                  @click="openConfirmModal(g)"
                >
                  Confirmar fruição
                </button>
                <button
                  v-if="canConfirm(g.status)"
                  class="btn btn-sm btn-outline-danger"
                  @click="denyFruition(g)"
                >
                  Não fruiu
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="alert alert-warning text-center m-2" role="alert">
          Nenhuma concessão encontrada.
        </div>
      </div>

      <!-- Paginação -->
      <div
        v-if="totalPages > 1"
        class="d-flex justify-content-between align-items-center"
      >
        <span class="text-muted">Página {{ page }} de {{ totalPages }}</span>
        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!hasPrev"
            @click="prev"
          >
            &laquo; Anterior
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!hasNext"
            @click="next"
          >
            Próxima &raquo;
          </button>
        </div>
      </div>
    </div>

    <!-- Erro -->
    <div v-if="error" class="alert alert-danger mt-4" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>

    <!-- Modal Confirmar fruição -->
    <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Confirmar fruição</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Close"
              @click="closeConfirmModal"
            ></button>
          </div>
          <form @submit.prevent="doConfirm">
            <div class="modal-body">
              <p class="mb-2">
                Confirmar a fruição de
                <strong>{{ confirmTarget?.days_count }}</strong> dia(s) para
                {{
                  confirmTarget?.user_name ||
                  `Usuário #${confirmTarget?.user_id}`
                }}?
              </p>
              <div class="mb-3">
                <label class="form-label">Observações (opcional)</label>
                <textarea
                  class="form-control"
                  v-model="confirmForm.notes"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeConfirmModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-success"
                :disabled="submitting"
              >
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Confirmar
              </button>
            </div>
          </form>
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
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { GRANT_STATUS, useVacation } from '@/composables/useVacation'
  import { VacationService } from '@/services/vacation.services'

  const bootstrap = inject('bootstrap')

  const { formatDate } = useDate()
  const { grantStatus, grantTypeLabel } = useVacation()

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

  const confirmTarget = ref(null)
  const confirmForm = ref({ notes: '' })
  const submitting = ref(false)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(grants.value.length / limit.value)),
  )
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

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
    new bootstrap.Modal(document.getElementById('confirmModal')).show()
  }

  function closeConfirmModal() {
    bootstrap.Modal.getInstance(document.getElementById('confirmModal'))?.hide()
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
      closeConfirmModal()
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
