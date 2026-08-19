<template>
  <div class="container mt-4">
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Criar Novo Aviso</h1>
      <router-link
        :to="{ name: 'NoticesList' }"
        class="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-auto dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Icon name="arrow-left" class="h-4 w-4" aria-hidden="true" /> Voltar
      </router-link>
    </div>

    <div
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="p-5">
        <form class="needs-validation" novalidate @submit.prevent="saveNotice">
          <div class="mb-4">
            <label
              for="title"
              class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >Título</label
            >
            <input
              id="title"
              v-model.trim="form.title"
              type="text"
              class="input-base"
              placeholder="Digite o título do aviso"
              required
            />
          </div>

          <div class="mb-4">
            <label
              for="content"
              class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >Conteúdo</label
            >
            <textarea
              id="content"
              v-model.trim="form.content"
              class="input-base resize-y"
              rows="5"
              placeholder="Digite o conteúdo do aviso"
              required
            ></textarea>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <router-link
              :to="{ name: 'NoticesList' }"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
            >
              <BaseSpinner v-if="loading" class="h-4 w-4" />
              <Icon
                v-else
                name="check-circle"
                class="h-4 w-4"
                aria-hidden="true"
              />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

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
  import { ref } from 'vue'
  import { NoticesService } from '@/services/notices.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useRouter } from 'vue-router'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'

  const router = useRouter()
  const loading = ref(false)
  const error = ref(null)

  const form = ref({
    title: '',
    content: '',
  })

  async function saveNotice() {
    if (!form.value.title || !form.value.content) {
      errorToast('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    loading.value = true
    error.value = null

    try {
      await NoticesService.create({
        title: form.value.title,
        content: form.value.content,
      })

      successToast('Aviso criado com sucesso!')
      router.push({ name: 'NoticesList' })
    } catch (err) {
      console.error('Erro ao criar aviso:', err)
      error.value =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro desconhecido'
      errorToast(error.value)
    } finally {
      loading.value = false
    }
  }
</script>
