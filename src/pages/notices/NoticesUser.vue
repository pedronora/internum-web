<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Meus Avisos</h1>
      <div class="d-flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Pesquisar..."
          style="max-width: 250px"
          @keyup.enter="fetchAll"
        />
        <button class="btn btn-outline-primary" @click="fetchAll">
          Buscar
        </button>
        <button class="btn btn-outline-success" @click="fetchAll">
          <i class="bi bi-repeat"></i>
        </button>
      </div>
    </div>

    <section>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Avisos não lidos ({{ unreadsMeta.total }})</h3>
        <div>
          <button
            class="btn btn-sm btn-outline-secondary me-2"
            :disabled="!unreadsMeta.has_prev"
            @click="changePage('unreads', unreadsMeta.page - 1)"
          >
            ← Anterior
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="!unreadsMeta.has_next"
            @click="changePage('unreads', unreadsMeta.page + 1)"
          >
            Próxima →
          </button>
        </div>
      </div>

      <div v-if="unreads.length" class="row">
        <div v-for="notice in unreads" :key="notice.id" class="col-md-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ notice.title }}</h5>
              <p class="card-text">
                {{ notice.content }}
              </p>
              <p class="text-muted small mt-auto mb-2">
                <strong>Autor:</strong> {{ notice.author?.name }} <br />
                <strong>Criado em:</strong> {{ formatDate(notice.created_at) }}
              </p>
              <button
                class="btn btn-sm btn-success w-100"
                :disabled="loadingIds.has(notice.id)"
                @click="markRead(notice.id)"
              >
                <span v-if="!loadingIds.has(notice.id)">Marcar como lido</span>
                <span v-else>
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Marcando...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="text-center text-muted my-4">Nenhum aviso não lido 🎉</p>
    </section>

    <hr />

    <section>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Avisos lidos</h3>
        <div>
          <button
            class="btn btn-sm btn-outline-secondary me-2"
            :disabled="!readsMeta.has_prev"
            @click="changePage('reads', readsMeta.page - 1)"
          >
            ← Anterior
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="!readsMeta.has_next"
            @click="changePage('reads', readsMeta.page + 1)"
          >
            Próxima →
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Conteúdo</th>
              <th>Criado em</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in reads" :key="notice.id">
              <td>{{ notice.title }}</td>
              <td>{{ notice.author?.name }}</td>
              <td class="text-truncate" style="max-width: 250px">
                {{ notice.content }}
              </td>
              <td>{{ formatDate(notice.created_at) }}</td>
              <td>
                <router-link
                  class="btn btn-outline-info btn-sm"
                  :to="{ name: 'NoticesDetail', params: { id: notice.id } }"
                >
                  ver
                </router-link>
              </td>
            </tr>
            <tr v-if="!reads.length">
              <td colspan="5" class="text-center text-muted">
                Nenhum aviso lido ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { NoticesService } from '@/services/notices.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import { useNoticeStore } from '@/stores/notices.js'

  const { formatDate } = useDate()

  const noticeStore = useNoticeStore()

  const unreads = ref([])
  const unreadsMeta = ref({ page: 1, has_next: false, has_prev: false })

  const reads = ref([])
  const readsMeta = ref({ page: 1, has_next: false, has_prev: false })

  const searchQuery = ref('')
  const loadingIds = ref(new Set())

  const fetchAll = async () => {
    await Promise.all([fetchUnreads(), fetchReads()])
  }

  const fetchUnreads = async (page = unreadsMeta.value.page) => {
    try {
      const res = await NoticesService.listUnreads(
        (page - 1) * 10,
        10,
        searchQuery.value,
      )
      unreads.value = res.data.notices
      unreadsMeta.value = res.data.meta
      noticeStore.setUnreadCount(unreadsMeta.value.total)
    } catch (err) {
      console.error('Erro ao buscar não lidos:', err)
    }
  }

  const fetchReads = async (page = readsMeta.value.page) => {
    try {
      const res = await NoticesService.listReads(
        (page - 1) * 10,
        10,
        searchQuery.value,
      )
      reads.value = res.data.notices
      readsMeta.value = res.data.meta
    } catch (err) {
      console.error('Erro ao buscar lidos:', err)
    }
  }

  const changePage = (type, newPage) => {
    if (type === 'unreads') fetchUnreads(newPage)
    else fetchReads(newPage)
  }

  const markRead = async (id) => {
    try {
      loadingIds.value.add(id)
      await NoticesService.markAsRead(id)
      successToast('Aviso marcado como lido com sucesso!')
      await fetchAll()
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
      errorToast('Erro ao marcar aviso como lido.')
    } finally {
      loadingIds.value.delete(id)
    }
  }

  onMounted(fetchAll)
</script>
