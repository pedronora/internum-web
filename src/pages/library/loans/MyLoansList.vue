<template>
  <div class="m-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Meus Empréstimos</h1>
    </div>

    <!-- Filtro de Estado -->
    <div
      class="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="flex items-center gap-2">
        <label
          for="statusFilter"
          class="text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200"
          >Filtrar por status:</label
        >
        <select
          id="statusFilter"
          v-model="statusFilter"
          class="select-base w-auto"
          @change="reload"
        >
          <option value="">Todos</option>
          <option value="requested">Solicitado</option>
          <option value="canceled">Cancelado</option>
          <option value="borrowed">Emprestado</option>
          <option value="returned">Devolvido</option>
          <option value="late">Atrasado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
      role="status"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <!-- Tabela -->
    <div v-else>
      <div
        v-if="!error"
        class="mb-4 overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-700"
      >
        <table v-if="loans.length" class="w-full text-sm">
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Livro/Autor
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Solicitado em
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Devolução
              </th>
              <th scope="col" class="px-4 py-3 font-semibold whitespace-nowrap">
                Status
              </th>
              <th
                scope="col"
                class="px-4 py-3 text-center font-semibold whitespace-nowrap"
              >
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="l in loans"
              :key="l.id"
              class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3">
                <strong>{{ l.book?.title }}</strong>
                <br />
                <span class="text-sm text-slate-500 dark:text-slate-400">{{
                  l.book?.author
                }}</span>
              </td>
              <td class="px-4 py-3">{{ formatDate(l.created_at, true) }}</td>

              <!-- Data dinâmica -->
              <td class="px-4 py-3">
                <template v-if="l.status === 'returned'">
                  {{ formatDate(l.returned_at, true) }}
                </template>
                <template v-else-if="l.status === 'borrowed'">
                  {{ formatDate(l.due_date, true) }}
                </template>
                <template v-else> - </template>
              </td>
              <td class="px-4 py-3">
                <BaseBadge :color="statusColor(l.status)">
                  {{ statusLabel(l.status) }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3 text-center whitespace-nowrap">
                <!-- Estado: requested -->
                <button
                  v-if="l.status === 'requested'"
                  class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                  :disabled="loadingAction"
                  @click="cancelRequest(l.id)"
                >
                  <Icon name="x-circle" class="h-3.5 w-3.5" /> Cancelar
                </button>

                <!-- Estado: borrowed -->
                <button
                  v-else-if="l.status === 'borrowed'"
                  class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="loadingAction"
                  @click="returnLoan(l.id)"
                >
                  <Icon name="box-arrow-in-down" class="h-3.5 w-3.5" />
                  Devolver
                </button>

                <!-- Estado: late -->
                <button
                  v-else-if="l.status === 'late'"
                  class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  :disabled="loadingAction"
                  @click="returnLoan(l.id)"
                >
                  <Icon name="exclamation-triangle" class="h-3.5 w-3.5" />
                  Devolver (Atraso)
                </button>

                <!-- Estado: returned -->
                <span
                  v-else
                  class="text-xs italic text-slate-500 dark:text-slate-400"
                  >Sem ações</span
                >
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-else
          class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          Nenhum empréstimo encontrado.
        </div>
      </div>

      <!-- Paginação -->
      <BasePagination
        v-if="meta.total && totalPages > 1"
        :meta="meta"
        @prev="prev"
        @next="next"
      />
    </div>

    <!-- Erro -->
    <div
      v-if="error"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { LoansService } from '@/services/loans.services'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'

  const { formatDate } = useDate()

  const loans = ref([])
  const loading = ref(false)
  const loadingAction = ref(false)
  const error = ref(null)
  const statusFilter = ref('')

  const page = ref(1)
  const limit = ref(10)
  const meta = ref({ total: 0 })

  const totalPages = computed(() => meta.value.total_pages || 1)

  const statusColor = (s) =>
    ({
      requested: 'warning',
      borrowed: 'primary',
      returned: 'success',
      late: 'danger',
      canceled: 'danger',
      rejected: 'danger',
    })[s] || 'slate'

  function statusLabel(status) {
    return (
      {
        requested: 'Solicitado',
        canceled: 'Cancelado',
        borrowed: 'Emprestado',
        returned: 'Devolvido',
        rejected: 'Rejeitado',
        late: 'Atrasado',
      }[status] || status
    )
  }

  async function load() {
    loading.value = true
    error.value = null

    const offset = (page.value - 1) * limit.value

    try {
      const data = await LoansService.listMy(
        offset,
        limit.value,
        statusFilter.value,
      )
      loans.value = data.loans || []
      meta.value = data.meta || {
        total_pages: 1,
        has_next: false,
        has_prev: false,
      }
    } catch (err) {
      console.error('Erro ao carregar empréstimos', err)
      error.value =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro desconhecido ao carregar empréstimos'
    } finally {
      loading.value = false
    }
  }

  async function cancelRequest(id) {
    const ok = await confirmToast('Deseja cancelar este pedido?', {
      title: 'Cancelar Solicitação',
    })
    if (!ok) return
    loadingAction.value = true
    try {
      await LoansService.cancel(id)
      successToast('Solicitação cancelada com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast('Erro ao cancelar solicitação.')
    } finally {
      loadingAction.value = false
    }
  }

  async function returnLoan(id) {
    const ok = await confirmToast('Confirmar devolução deste livro?', {
      title: 'Devolver Livro',
    })
    if (!ok) return
    loadingAction.value = true
    try {
      await LoansService.return(id)
      successToast('Livro devolvido com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast('Erro ao devolver livro.')
    } finally {
      loadingAction.value = false
    }
  }

  function reload() {
    page.value = 1
    load()
  }

  function next() {
    if (meta.value.has_next) {
      page.value++
      load()
    }
  }

  function prev() {
    if (meta.value.has_prev) {
      page.value--
      load()
    }
  }

  onMounted(load)
</script>
