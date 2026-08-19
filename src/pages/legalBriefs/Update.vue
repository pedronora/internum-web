<template>
  <div>
    <div
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="p-5">
        <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Icon name="pencil-square" class="h-5 w-5" aria-hidden="true" />
          Editar Ementa
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
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
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
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
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
              Atualizar Ementa
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { LegalBriefsService } from '@/services/legalBriefs.services'
  import * as yup from 'yup'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import Icon from '@/components/Icon.vue'
  import BaseSpinner from '@/components/BaseSpinner.vue'

  const router = useRouter()
  const route = useRoute()

  const form = ref({
    title: '',
    content: '',
  })

  const loading = ref(false)
  const errors = ref({})

  const id = route.params.id

  // Esquema de validação Yup
  const schema = yup.object({
    title: yup
      .string()
      .required('O título é obrigatório')
      .min(3, 'O título deve ter pelo menos 3 caracteres'),
    content: yup
      .string()
      .required('O conteúdo é obrigatório')
      .min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
  })

  // Carrega a ementa existente
  onMounted(async () => {
    loading.value = true
    try {
      const data = await LegalBriefsService.getById(id)
      form.value = {
        title: data.title,
        content: data.content,
      }
    } catch (err) {
      errorToast('Erro ao carregar a ementa.' + err)
      router.push('/legal-briefs')
    } finally {
      loading.value = false
    }
  })

  // Envio do formulário
  const submitForm = async () => {
    loading.value = true
    errors.value = {}

    try {
      await schema.validate(form.value, { abortEarly: true })

      await LegalBriefsService.update(id, form.value)
      successToast('Ementa atualizada com sucesso!')
      setTimeout(() => router.push('/legal-briefs'), 800)
    } catch (err) {
      if (err.name === 'ValidationError') {
        // Erros de validação Yup
        const fieldErrors = {}
        err.inner.forEach((e) => {
          fieldErrors[e.path] = e.message
        })
        errors.value = fieldErrors
        errorToast('Verifique os campos e tente novamente.')
      } else if (err.response?.status === 422 || err.response?.status === 400) {
        // Erros de API
        errors.value = err.response.data.errors || {}
        errorToast('Verifique os campos e tente novamente.')
      } else {
        errorToast('Erro ao atualizar Ementa. Tente novamente mais tarde.')
      }
    } finally {
      loading.value = false
    }
  }
</script>
