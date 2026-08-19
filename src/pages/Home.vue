<template>
  <div class="mt-4 py-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h3 class="flex items-center gap-2 text-2xl font-bold">
        <Icon name="house-door-fill" class="h-6 w-6" aria-hidden="true" />
        Dashboard
      </h3>

      <span
        class="inline-flex items-center self-start rounded-full bg-primary-600 px-3 py-1 text-lg font-semibold text-white sm:self-auto"
        >{{ time }}</span
      >
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <!-- Aniversariantes -->
      <div class="md:col-span-1 lg:col-span-2">
        <div
          class="flex h-full flex-col rounded-xl border border-green-500 bg-white shadow-sm dark:border-green-700 dark:bg-slate-800"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-200 px-5 py-4 font-semibold text-green-600 dark:border-slate-700 dark:text-green-400"
          >
            <Icon name="gift-fill" class="h-5 w-5" aria-hidden="true" />
            Aniversariantes de {{ homeSummary.current_month_pt }}
          </div>
          <ul class="divide-y divide-slate-200 dark:divide-slate-700">
            <li
              v-for="b in homeSummary.birthdays"
              :key="b.id"
              class="flex items-center justify-between gap-2 px-5 py-3"
            >
              {{ b.name }}
              <BaseBadge color="light">{{
                formatBirthdayDate(b.birthday)
              }}</BaseBadge>
            </li>
            <li
              v-if="
                !homeSummary.birthdays || homeSummary.birthdays.length === 0
              "
              class="px-5 py-3 text-slate-500 dark:text-slate-400"
            >
              Nenhum aniversariante este mês
            </li>
          </ul>
        </div>
      </div>

      <!-- Legal Brief -->
      <div class="md:col-span-1 lg:col-span-4">
        <div
          class="flex h-full flex-col rounded-xl border border-primary-500 bg-white shadow-sm dark:border-primary-700 dark:bg-slate-800"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-200 px-5 py-4 font-semibold text-primary-600 dark:border-slate-700 dark:text-primary-400"
          >
            <Icon name="file-earmark-text" class="h-5 w-5" aria-hidden="true" />
            Sempre bom revisar
          </div>
          <div v-if="homeSummary.legal_brief" class="p-5">
            <h5 class="mb-2 text-lg font-semibold">
              {{ homeSummary.legal_brief.id }}.
              {{ homeSummary.legal_brief.title }}
            </h5>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              {{ homeSummary.legal_brief.content }}
            </p>
          </div>
          <div v-else class="p-5">
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Nenhum informativo disponível
            </p>
          </div>
        </div>
      </div>

      <!-- Avisos -->
      <div class="md:col-span-1 lg:col-span-3">
        <div
          class="flex h-full flex-col rounded-xl border border-amber-500 bg-white shadow-sm dark:border-amber-700 dark:bg-slate-800"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-200 px-5 py-4 font-semibold text-amber-600 dark:border-slate-700 dark:text-amber-400"
          >
            <Icon
              name="exclamation-circle-fill"
              class="h-5 w-5"
              aria-hidden="true"
            />
            Avisos ({{ homeSummary.unread_notices?.total || 0 }})
          </div>
          <ul class="divide-y divide-slate-200 dark:divide-slate-700">
            <li
              v-for="notice in homeSummary.unread_notices?.unread_notices || []"
              :key="notice.id"
              class="px-5 py-3"
            >
              <strong>{{ notice.title }}:</strong> {{ notice.content }}
            </li>
            <li
              v-if="
                !homeSummary.unread_notices?.unread_notices ||
                homeSummary.unread_notices.unread_notices.length === 0
              "
              class="px-5 py-3 text-slate-500 dark:text-slate-400"
            >
              Nenhum aviso
            </li>
          </ul>
        </div>
      </div>

      <!-- Empréstimos -->
      <div class="md:col-span-1 lg:col-span-3">
        <div
          class="flex h-full flex-col rounded-xl border border-sky-500 bg-white shadow-sm dark:border-sky-700 dark:bg-slate-800"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-200 px-5 py-4 font-semibold text-sky-600 dark:border-slate-700 dark:text-sky-400"
          >
            <Icon name="book-fill" class="h-5 w-5" aria-hidden="true" />
            Meus Empréstimos
          </div>
          <ul class="divide-y divide-slate-200 dark:divide-slate-700">
            <li
              v-for="loan in homeSummary.loans"
              :key="loan.id"
              class="flex items-center justify-between gap-2 px-5 py-3"
            >
              {{ loan.book?.title || 'Título não disponível' }}
              <BaseBadge color="light"
                >Vence em {{ formatLoanDate(loan.due_date) }}</BaseBadge
              >
            </li>
            <li
              v-if="!homeSummary.loans || homeSummary.loans.length === 0"
              class="px-5 py-3 text-slate-500 dark:text-slate-400"
            >
              Nenhum empréstimo ativo
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { HomeService } from '@/services/home.services.js'
  import { useDate } from '@/composables/useDate'
  import { useNoticeStore } from '@/stores/notices.js'
  import Icon from '@/components/Icon.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

  const noticeStore = useNoticeStore()
  const { formatDate } = useDate()

  const homeSummary = ref({
    current_month: '',
    current_month_pt: '',
    birthdays: [],
    legal_brief: null,
    unread_notices: { total: 0, unread_notices: [] },
    loans: [],
  })

  const time = ref('')
  let timeInterval = null

  function formatBirthdayDate(date) {
    if (!date || typeof date !== 'string') return ''
    try {
      const parts = date.split('-')
      if (parts.length !== 3) {
        throw new Error(
          `Data de aniversário com formato inesperado: "${date}". Esperado: AAAA-MM-DD.`,
        )
      }
      return `${parts[2]}/${parts[1]}`
    } catch (error) {
      console.error('Erro ao formatar data de aniversário:', error)
      return ''
    }
  }

  function formatLoanDate(date) {
    if (!date) return 'data inválida'
    try {
      return formatDate(date, true)
    } catch (error) {
      console.error('Erro ao formatar data de empréstimo:', error)
      return 'data inválida'
    }
  }

  async function loadHome() {
    try {
      const data = await HomeService.getSummary()

      Object.assign(homeSummary.value, {
        ...data,
        current_month_pt: getCurrentMonthPT(),
        birthdays: data.birthdays || [],
        loans: data.loans || [],
        unread_notices: data.unread_notices || { total: 0, unread_notices: [] },
      })

      noticeStore.setUnreadCount(homeSummary.value.unread_notices?.total || 0)
    } catch (error) {
      console.error('Erro ao carregar dados da home:', error)
    }
  }

  function getCurrentMonthPT() {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    return monthNames[new Date().getMonth()]
  }

  function updateTime() {
    time.value = new Date().toLocaleTimeString('pt-BR')
  }

  onMounted(() => {
    loadHome()
    updateTime()
    timeInterval = setInterval(updateTime, 1000)
  })

  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval)
    }
  })
</script>
