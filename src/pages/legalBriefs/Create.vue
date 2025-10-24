<template>
  <div class="container py-4">
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h4 class="card-title mb-4">
          <i class="bi bi-file-earmark-plus me-2"></i>
          Nova Ementa
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
