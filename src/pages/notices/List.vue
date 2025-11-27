<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Avisos</h1>
      <router-link :to="{ name: 'NoticesCreate' }" class="btn btn-success">
        <i class="bi bi-plus-lg me-1"></i> Criar Novo
      </router-link>
    </div>

    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-3 border rounded bg-body border-secondary border-opacity-25"
    >
      <div class="mb-3 mb-md-0">
        <label class="d-flex align-items-center gap-2 text-nowrap text-body">
          Mostrar
          <select
            v-model.number="limit"
            class="form-select form-select-sm w-auto"
            @change="reload"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
          por página
        </label>
      </div>

      <div class="d-flex gap-2 w-md-auto">
        <input
          v-model="q"
          class="form-control"
          placeholder="Pesquisar..."
          @keyup.enter="reload"
        />
        <button class="btn btn-outline-primary text-nowrap" @click="reload">
          <i class="bi bi-search me-1"></i> Buscar
        </button>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info text-center" role="alert">
      <div class="spinner-border spinner-border-sm me-2" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      Carregando...
    </div>

    <div v-else>
      <div v-if="!error" class="table-responsive shadow-sm rounded mb-4">
        <table
          v-if="notices.length"
          class="table table-striped table-hover align-middle mb-0"
        >
          <thead class="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Título</th>
              <th scope="col">Conteúdo</th>
              <th scope="col">Lidos</th>
              <th scope="col">Criado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in notices" :key="n.id">
              <td>{{ n.id }}</td>
              <td>{{ n.title }}</td>
              <td class="text-truncate" style="max-width: 250px">
                {{ n.content }}
              </td>
              <td>
                <span class="badge bg-info">{{ n.reads_count }}</span>
              </td>
              <td>{{ formatDate(n.created_at) }}</td>
              <td class="text-nowrap">
                <router-link
                  :to="{ name: 'NoticesDetail', params: { id: n.id } }"
                  class="btn btn-sm btn-outline-primary me-1"
                >
                  Ver
                </router-link>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteNotice(n.id)"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="alert alert-warning text-center m-2" role="alert">
          Nenhum aviso encontrado.
        </div>
      </div>

      <div
        v-if="meta.total && totalPages > 1"
        class="d-flex justify-content-between align-items-center"
      >
        <span class="text-muted"
          >Página {{ meta.page }} de {{ totalPages }}</span
        >

        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!meta.has_prev"
            @click="prev"
          >
            &laquo; Anterior
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!meta.has_next"
            @click="next"
          >
            Próxima &raquo;
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert">
      <strong>Erro:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { NoticesService } from '@/services/notices.services'
  import {
    success as successToast,
    error as errorToast,
    confirm as confirmToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'

  const { formatDate } = useDate()

  const notices = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(1)
  const limit = ref(10)
  const q = ref('')

  const meta = ref({
    total: null,
    offset: 0,
    limit: 10,
  })

  const totalPages = computed(() => meta.value.total_pages || 1)

  async function load() {
    loading.value = true
    error.value = null

    const offset = (page.value - 1) * limit.value

    try {
      const res = await NoticesService.list(offset, limit.value, q.value)
      const data = res.data

      notices.value = data.notices || []

      meta.value = {
        total: data.meta?.total ?? notices.value.length,
        page: data.meta?.page ?? page.value,
        size: data.meta?.size ?? limit.value,
        total_pages: data.meta?.total_pages ?? 1,
        has_next: data.meta?.has_next ?? false,
        has_prev: data.meta?.has_prev ?? false,
        offset: data.meta?.offset ?? offset,
      }
    } catch (err) {
      console.error('Erro carregando avisos', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function deleteNotice(id) {
    const ok = await confirmToast('Deseja excluir este aviso?', {
      title: 'Excluir aviso',
    })
    if (!ok) return

    try {
      await NoticesService.deactivate(id)
      successToast('Aviso excluído com sucesso.')
      load()
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail || err?.message || 'Erro ao excluir aviso',
      )
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

  onMounted(() => {
    load()
  })
</script>
