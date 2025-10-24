<template>
  <div class="container py-4">
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h4 class="card-title mb-4">
          <i class="bi bi-pencil-square me-2"></i>
          Editar Ementa
        </h4>

        <!-- Formulário -->
        <form @submit.prevent="submitForm">
          <!-- Título -->
          <div class="mb-3">
            <label for="title" class="form-label fw-semibold">Título</label>
            <input
              id="title"
              v-model.trim="form.title"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              placeholder="Digite o título da ementa"
              required
            />
            <div v-if="errors.title" class="invalid-feedback">
              {{ errors.title }}
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="mb-3">
            <label for="content" class="form-label fw-semibold">Conteúdo</label>
            <textarea
              id="content"
              v-model.trim="form.content"
              class="form-control"
              rows="6"
              :class="{ 'is-invalid': errors.content }"
              placeholder="Escreva aqui o conteúdo da ementa"
              required
            ></textarea>
            <div v-if="errors.content" class="invalid-feedback">
              {{ errors.content }}
            </div>
          </div>

          <!-- Ações -->
          <div class="d-flex justify-content-end">
            <router-link
              to="/legal-briefs"
              class="btn btn-outline-secondary me-2"
            >
              Cancelar
            </router-link>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-1"
              ></span>
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
