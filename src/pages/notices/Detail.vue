<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Aviso n. {{ id }}</h1>
      <button class="btn btn-outline-secondary" @click="goBack">Voltar</button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="notice" class="card shadow-sm">
      <div class="card-body">
        <h4 class="card-title mb-3">{{ notice.title }}</h4>
        <p class="card-text">{{ notice.content }}</p>

        <ul class="list-group list-group-flush my-4">
          <li class="list-group-item">
            <strong>Autor:</strong> {{ notice.author?.name || '-' }}
          </li>
          <li class="list-group-item">
            <strong>Criado em:</strong> {{ formatDate(notice.created_at) }}
          </li>
          <li v-if="isUserAdminOrCoord" class="list-group-item">
            <strong>Status: </strong>
            <span
              class="badge"
              :class="notice.active ? 'bg-success' : 'bg-secondary'"
            >
              {{ notice.active ? 'Active' : 'Inactive' }}
            </span>
          </li>
        </ul>

        <div v-if="isUserAdminOrCoord">
          <h6>Leitores ({{ notice.reads_count }})</h6>

          <div v-if="notice.reads?.length" class="table-responsive">
            <table class="table table-striped table-sm mt-2 mb-0">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Lido em</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(read, idx) in notice.reads" :key="idx">
                  <td>{{ read.user?.name }}</td>
                  <td>{{ formatDate(read.read_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="text-muted">Este comunicado ainda não foi lido.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { NoticesService } from '@/services/notices.services'
  import { useAuthStore } from '@/stores/auth'
  import { useDate } from '@/composables/useDate'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const { formatDate } = useDate()
  const notice = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const id = route.params.id

  const isUserAdminOrCoord = computed(() => {
    const role = auth.user?.role
    return role === 'admin' || role === 'coord'
  })

  onMounted(() => {
    fetchNotice(id)
  })

  async function fetchNotice(id) {
    loading.value = true
    try {
      const data = await NoticesService.getById(id)
      notice.value = data
    } catch (err) {
      console.error(err)
      error.value = err?.response?.data?.detail || 'Error loading notice.'
    } finally {
      loading.value = false
    }
  }

  function goBack() {
    router.go(-1)
  }
</script>
