<template>
  <div class="container mt-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Aviso n. {{ id }}</h1>
      <button
        class="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-auto dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        @click="goBack"
      >
        Voltar
      </button>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400"
    >
      <BaseSpinner class="h-5 w-5" />
      Carregando...
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      {{ error }}
    </div>

    <div
      v-else-if="notice"
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="p-5">
        <h4 class="mb-3 text-xl font-bold">{{ notice.title }}</h4>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          {{ notice.content }}
        </p>

        <ul class="my-4 divide-y divide-slate-200 dark:divide-slate-700">
          <li class="py-3">
            <strong>Autor:</strong> {{ notice.author?.name || '-' }}
          </li>
          <li class="py-3">
            <strong>Criado em:</strong> {{ formatDate(notice.created_at) }}
          </li>
          <li v-if="isUserAdminOrCoord" class="py-3">
            <strong>Status: </strong>
            <BaseBadge :color="notice.active ? 'success' : 'slate'">
              {{ notice.active ? 'Active' : 'Inactive' }}
            </BaseBadge>
          </li>
        </ul>

        <div v-if="isUserAdminOrCoord">
          <h6 class="mb-2 font-semibold">
            Leitores ({{ notice.reads_count }})
          </h6>

          <div
            v-if="notice.reads?.length"
            class="overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-700"
          >
            <table class="w-full text-sm">
              <thead
                class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <tr>
                  <th class="px-4 py-3 whitespace-nowrap font-semibold">
                    Usuário
                  </th>
                  <th class="px-4 py-3 whitespace-nowrap font-semibold">
                    Lido em
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(read, idx) in notice.reads"
                  :key="idx"
                  class="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                >
                  <td class="px-4 py-3">{{ read.created_by?.name }}</td>
                  <td class="px-4 py-3">{{ formatDate(read.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="text-sm text-slate-500 dark:text-slate-400">
            Este comunicado ainda não foi lido.
          </p>
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
  import BaseSpinner from '@/components/BaseSpinner.vue'
  import BaseBadge from '@/components/BaseBadge.vue'

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
