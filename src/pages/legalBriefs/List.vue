<template>
  <div>
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Ementas</h1>
      <router-link
        v-if="authStore.isAdminOrCoord"
        :to="{ name: 'LegalBriefsCreate' }"
        class="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="plus-lg" class="h-4 w-4" aria-hidden="true" /> Criar Novo
      </router-link>
    </div>

    <div
      class="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800"
    >
      <div
        class="flex items-center gap-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200"
      >
        Mostrar
        <select
          v-model.number="limit"
          class="select-base w-auto"
          @change="reload"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
        </select>
        por página
      </div>

      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <input
          id="search"
          v-model="search"
          class="input-base md:w-64"
          placeholder="Buscar..."
          @keyup.enter="reload"
        />
        <button
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          @click="reload"
        >
          <Icon name="search" class="h-4 w-4" aria-hidden="true" /> Buscar
        </button>
      </div>
    </div>

    <div v-if="briefs.length > 0" class="flex flex-col gap-4">
      <div
        v-for="brief in briefs"
        :key="brief.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        :class="{
          'text-slate-500 line-through dark:text-slate-400': brief.canceled,
        }"
      >
        <div class="mb-2 flex items-start justify-between gap-2">
          <h5 class="mb-1 text-base font-semibold">
            {{ brief.id }}. {{ brief.title }}
          </h5>
          <small class="text-slate-500 dark:text-slate-400">
            {{
              formatDate(
                brief.revisions?.length > 0
                  ? brief.updated_at
                  : brief.created_at,
              )
            }}
          </small>
        </div>

        <RichText :html="brief.content" class="mb-2" />

        <div
          v-if="brief.updated_by"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          Editado por {{ brief.updated_by.name || 'Usuário desconhecido' }}
        </div>
        <div v-else class="text-xs text-slate-500 dark:text-slate-400">
          Criado por {{ brief.created_by.name || 'Usuário desconhecido' }}
        </div>

        <div v-if="brief.revisions?.length > 0" class="mt-3">
          <small class="mb-2 block text-slate-500 dark:text-slate-400"
            >Versões anteriores:</small
          >

          <div
            v-for="rev in brief.revisions"
            :key="rev.id"
            class="mb-3 border-l border-slate-200 pl-3 dark:border-slate-700"
          >
            <div class="mb-1 flex items-center justify-between gap-2">
              <h6
                class="mb-0 text-sm font-semibold text-slate-500 dark:text-slate-400"
              >
                {{ rev.title }}
              </h6>
              <small class="text-slate-500 dark:text-slate-400">
                {{ formatDate(rev.created_at) }}
              </small>
            </div>
            <div class="mb-1 text-xs italic text-slate-500 dark:text-slate-400">
              <RichText :html="rev.content" />
            </div>
            <div
              v-if="rev.updated_by"
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              Editado por {{ rev.updated_by.name || 'Usuário desconhecido' }}
            </div>
          </div>
        </div>

        <div
          v-if="authStore.isAdminOrCoord && !brief.canceled"
          class="mt-3 flex justify-end gap-2"
        >
          <router-link
            :to="{ name: 'LegalBriefEdit', params: { id: brief.id } }"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-300 bg-white px-2.5 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary-700 dark:bg-slate-800 dark:text-primary-400 dark:hover:bg-primary-950/30"
          >
            <Icon name="pencil" class="h-3.5 w-3.5" aria-hidden="true" />
            Editar
          </router-link>

          <button
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
            @click="cancelBrief(brief.id)"
          >
            <Icon name="x-circle" class="h-3.5 w-3.5" aria-hidden="true" />
            Cancelar
          </button>
        </div>

        <div v-if="brief.canceled_at" class="mb-2">
          <BaseBadge color="danger">
            Cancelada em {{ formatDate(brief.canceled_at) }}
          </BaseBadge>
        </div>
      </div>
    </div>

    <div
      v-else
      class="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
    >
      Nenhum registro encontrado.
    </div>

    <BasePagination
      v-if="meta && meta.total_pages > 1"
      variant="pages"
      :meta="meta"
      @prev="previousPage"
      @next="nextPage"
      @go="goToPage"
    />
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
  import Icon from '@/components/Icon.vue'
  import BaseBadge from '@/components/BaseBadge.vue'
  import BasePagination from '@/components/BasePagination.vue'
  import RichText from '@/components/RichText.vue'

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
