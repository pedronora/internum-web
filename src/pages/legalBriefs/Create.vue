<template>
  <div>
    <div
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="p-5">
        <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Icon name="file-earmark-plus" class="h-5 w-5" aria-hidden="true" />
          Nova Ementa
        </h4>

        <form @submit.prevent="submitForm">
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
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.title,
              }"
              placeholder="Digite o título da ementa"
              required
            />
            <div
              v-if="errors.title"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.title }}
            </div>
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
              class="input-base"
              rows="6"
              :class="{
                'border-red-500 focus:border-red-500 focus:ring-red-500/40':
                  errors.content,
              }"
              placeholder="Escreva aqui o conteúdo da ementa"
              required
            ></textarea>
            <div
              v-if="errors.content"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.content }}
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <router-link
              to="/legal-briefs"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
            >
              <BaseSpinner v-if="loading" class="h-4 w-4" />
              Criar Ementa
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { LegalBriefsService } from '@/services/legalBriefs.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'

  const router = useRouter()

  const form = ref({
    title: '',
    content: '',
  })

  const loading = ref(false)
  const errors = ref({})

  const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
      await LegalBriefsService.create(form.value)
      successToast('Ementa criada com sucesso!')
      // redireciona após pequeno delay
      setTimeout(() => router.push('/legal-briefs'), 800)
    } catch (err) {
      if (err.response?.status === 422 || err.response?.status === 400) {
        errors.value = err.response.data.errors || {}
        errorToast('Verifique os campos e tente novamente.')
      } else {
        errorToast('Erro ao criar Ementa. Tente novamente mais tarde.')
      }
    } finally {
      loading.value = false
    }
  }
</script>
