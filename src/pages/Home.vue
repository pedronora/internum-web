<template>
  <div class="mt-4 py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="card-title mb-0">
        <i class="bi bi-house-door-fill me-2"></i>
        Dashboard
      </h3>

      <span class="badge bg-primary fs-5 ms-2">{{ time }}</span>
    </div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-success">
          <div class="card-header d-flex align-items-center text-success">
            <i class="bi bi-gift-fill me-2"></i>
            Aniversariantes de {{ homeSummary.current_month_pt }}
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="b in homeSummary.birthdays"
              :key="b.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              {{ b.name }}
              <span class="badge bg-light text-dark">{{
                formatDate(b.birthday, true).slice(0, 5)
              }}</span>
            </li>
            <li
              v-if="homeSummary.birthdays.length === 0"
              class="list-group-item"
            >
              Nenhum aniversariante este mês
            </li>
          </ul>
        </div>
      </div>

      <div class="col-md-6 col-lg-8">
        <div class="card h-100 border-primary">
          <div class="card-header text-primary d-flex align-items-center">
            <i class="bi bi-file-earmark-text me-2"></i>
            Sempre bom revisar
          </div>
          <div class="card-body">
            <h5 class="card-title">
              {{ homeSummary.legal_brief.id }}.
              {{ homeSummary.legal_brief.title }}
            </h5>
            <p class="card-text">{{ homeSummary.legal_brief.content }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-6">
        <div class="card h-100 border-warning">
          <div class="card-header text-warning d-flex align-items-center">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            Avisos ({{ homeSummary.unread_notices.total }})
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="notice in homeSummary.unread_notices.unread_notices"
              :key="notice.id"
              class="list-group-item"
            >
              <strong>{{ notice.title }}:</strong> {{ notice.content }}
            </li>
            <li
              v-if="homeSummary.unread_notices.unread_notices.length === 0"
              class="list-group-item"
            >
              Nenhum aviso
            </li>
          </ul>
        </div>
      </div>

      <div class="col-md-6 col-lg-6">
        <div class="card h-100 border-info">
          <div class="card-header text-info d-flex align-items-center">
            <i class="bi bi-book-fill me-2"></i>
            Meus Empréstimos
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="loan in homeSummary.loans"
              :key="loan.id"
              class="list-group-item d-flex justify-content-between align-items-center me-2"
            >
              {{ loan.book.title }}
              <span class="badge bg-light text-dark"
                >Vence em {{ formatDate(loan.due_date, true) }}</span
              >
            </li>
            <li v-if="homeSummary.loans.length === 0" class="list-group-item">
              Nenhum empréstimo ativo
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { HomeService } from '@/services/home.services.js'
  import { useDate } from '@/composables/useDate'
  import { useNoticeStore } from '@/stores/notices.js'

  const noticeStore = useNoticeStore()
  const { formatDate } = useDate()

  const homeSummary = ref({
    current_month: '',
    current_month_pt: '',
    birthdays: [],
    legal_brief: { title: '', content: '' },
    unread_notices: { total: 0, unread_notices: [] },
    loans: [],
  })

  // Carrega dados da Home
  async function loadHome() {
    const data = await HomeService.getSummary()
    // traduz mês
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
    data.current_month_pt = monthNames[new Date().getMonth()]
    homeSummary.value = data
    noticeStore.setUnreadCount(data.unread_notices.total)
  }

  // Relógio
  const time = ref(new Date().toLocaleTimeString())
  function updateTime() {
    time.value = new Date().toLocaleTimeString()
  }

  onMounted(() => {
    loadHome()
    setInterval(updateTime, 1000)
  })
</script>

<style scoped>
  .card-header {
    font-weight: 600;
  }
</style>
