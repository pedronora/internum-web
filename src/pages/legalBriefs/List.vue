<template>
  <div class="container m-4">
    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Ementas</h1>
      <router-link
        v-if="authStore.user?.role === 'admin'"
        :to="{ name: 'LegalBriefsCreate' }"
        class="btn btn-success"
      >
        <i class="bi bi-plus-lg me-1"></i> Criar Novo
      </router-link>
    </div>

    <!-- Filtros -->
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

      <div class="input-group w-auto">
        <input
          v-model="search"
          type="text"
          class="form-control form-control-sm"
          placeholder="Buscar..."
          @keyup.enter="reload"
        />
        <button class="btn btn-outline-secondary btn-sm" @click="reload">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="briefs.length > 0" class="d-flex flex-column gap-3">
      <div
        v-for="brief in briefs"
        :key="brief.id"
        class="card p-3 border-0 border-bottom position-relative"
        :class="{
          'text-body-secondary text-decoration-line-through': brief.canceled,
        }"
      >
        <!-- Cabeçalho -->
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="mb-1">{{ brief.id }}. {{ brief.title }}</h5>
          <small class="text-body-secondary text-decoration-none">
            {{ formatDate(brief.updated_at || brief.created_at) }}
          </small>
        </div>

        <!-- Conteúdo -->
        <p class="mb-2">{{ brief.content }}</p>

        <!-- Autor -->
        <div
          v-if="brief.updated_by"
          class="text-secondary"
          style="font-size: 0.75rem"
        >
          Editado por {{ brief.updated_by.name || 'Usuário desconhecido' }}
        </div>
        <div v-else class="text-secondary" style="font-size: 0.75rem">
          Criado por {{ brief.created_by.name || 'Usuário desconhecido' }}
        </div>

        <!-- Revisões -->
        <div v-if="brief.revisions?.length > 0" class="mt-3">
          <small class="text-body-secondary d-block mb-2"
            >Versões anteriores:</small
          >

          <div
            v-for="rev in brief.revisions"
            :key="rev.id"
            class="border-start ps-3 mb-3"
          >
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h6 class="mb-0 text-body-secondary fw-semibold">
                {{ rev.title }}
              </h6>
              <small class="text-secondary">{{
                formatDate(rev.created_at)
              }}</small>
            </div>
            <p class="small text-body-secondary fst-italic mb-1">
              {{ rev.content }}
            </p>
            <div
              v-if="rev.updated_by"
              class="text-secondary"
              style="font-size: 0.75rem"
            >
              Editado por {{ rev.updated_by.name || 'Usuário desconhecido' }}
            </div>
          </div>
        </div>

        <!-- Botões Admin -->
        <div
          v-if="authStore.user?.role === 'admin' && !brief.canceled"
          class="d-flex justify-content-end gap-2 mt-3"
        >
          <router-link
            :to="`/legal-briefs/${brief.id}/edit`"
            class="btn btn-sm btn-outline-primary"
          >
            <i class="bi bi-pencil"></i> Editar
          </router-link>

          <button
            class="btn btn-sm btn-outline-danger"
            @click="cancelBrief(brief.id)"
          >
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
        </div>

        <!-- Status -->
        <div v-if="brief.canceled" class="mt-2">
          <span class="badge bg-secondary">CANCELADA</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5 text-body-secondary">
      Nenhum registro encontrado.
    </div>

    <!-- Paginação -->
    <nav
      v-if="meta && meta.total_pages > 1"
      aria-label="Paginação"
      class="mt-4 d-flex justify-content-center"
    >
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: !meta.has_prev }">
          <button
            class="page-link"
            :disabled="!meta.has_prev"
            @click="previousPage"
          >
            Anterior
          </button>
        </li>

        <li
          v-for="pageNum in meta.total_pages"
          :key="pageNum"
          class="page-item"
          :class="{ active: pageNum === meta.page }"
        >
          <button class="page-link" @click="goToPage(pageNum)">
            {{ pageNum }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: !meta.has_next }">
          <button
            class="page-link"
            :disabled="!meta.has_next"
            @click="nextPage"
          >
            Próximo
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { LegalBriefsService } from '@/services/legalBriefs.services'
  import {
    success as successToast,
    confirm as confirmToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'

  const { formatDate } = useDate()
  const authStore = useAuthStore()
  authStore.initFromStorage()

  const briefs = ref([])
  const meta = ref(null)
  const limit = ref(10)
  const offset = ref(0)
  const search = ref('')

  const loadData = async () => {
    try {
      const res = await LegalBriefsService.list(
        offset.value,
        limit.value,
        search.value,
      )
      briefs.value = res.data.legal_briefs
      meta.value = res.data.meta
    } catch (err) {
      console.error('Erro ao carregar ementas:', err)
    }
  }

  const reload = () => {
    offset.value = 0
    loadData()
  }

  const cancelBrief = async (id) => {
    const ok = await confirmToast(
      'Tem certeza que deseja cancelar esta ementa?',
      {
        title: `Excluir ementa n. ${id}`,
      },
    )
    if (!ok) return

    try {
      await LegalBriefsService.cancel(id)
      successToast('Ementa cancelada com sucesso!')
      loadData()
    } catch (err) {
      errorToast('Erro ao cancelar ementa. ' + err)
    }
  }

  const nextPage = () => {
    if (meta.value?.has_next) {
      offset.value += limit.value
      loadData()
    }
  }

  const previousPage = () => {
    if (meta.value?.has_prev) {
      offset.value -= limit.value
      loadData()
    }
  }

  const goToPage = (pageNum) => {
    offset.value = (pageNum - 1) * limit.value
    loadData()
  }

  onMounted(loadData)
</script>

<style scoped>
  .btn-outline-secondary {
    border: 1px solid var(--bs-border-color);
    border-left: 0;
  }
</style>
