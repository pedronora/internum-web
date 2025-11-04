<template>
  <div class="container mt-4">
    <h1 class="mb-4">Cadastrar Livro</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form class="card shadow-sm p-3" @submit.prevent="submit">
      <div class="row g-3">
        <!-- Linha 1 -->
        <div class="col-md-6">
          <label class="form-label">Título</label>
          <input v-model="form.title" required class="form-control" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Autor</label>
          <input v-model="form.author" required class="form-control" />
        </div>

        <!-- Linha 2 -->
        <div class="col-md-3">
          <label class="form-label">ISBN</label>
          <input v-model="form.isbn" required class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Editora</label>
          <input v-model="form.publisher" required class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Edição</label>
          <input
            v-model.number="form.edition"
            type="number"
            min="1"
            class="form-control"
            placeholder="1"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label">Ano de publicação (Year)</label>
          <input
            v-model.number="form.year"
            type="number"
            min="1500"
            :max="currentYear"
            required
            class="form-control"
          />
        </div>

        <!-- Linha 3 - Ações -->
        <div class="col-12 d-flex gap-2 justify-content-end">
          <router-link
            :to="{ name: 'BooksList' }"
            class="btn btn-outline-secondary"
          >
            Cancelar
          </router-link>
          <button class="btn btn-primary" :disabled="loading">
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            Cadastrar
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { BooksService } from '@/services/books.services'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import * as yup from 'yup'

  const router = useRouter()
  const loading = ref(false)
  const error = ref(null)

  const currentYear = new Date().getFullYear()

  const form = ref({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    edition: 1, // valor padrão se não informado
    year: currentYear,
  })

  const validationSchema = yup.object({
    isbn: yup.string().required('O ISBN é obrigatório'),
    title: yup
      .string()
      .required('O título é obrigatório')
      .min(2, 'O título deve ter pelo menos 2 caracteres'),
    author: yup.string().required('O autor é obrigatório'),
    publisher: yup.string().required('A editora é obrigatória'),
    edition: yup.number().min(1, 'Edição inválida').default(1),
    year: yup
      .number()
      .required('O ano é obrigatório')
      .min(1500, 'Ano inválido')
      .max(currentYear, 'Ano futuro não permitido'),
  })

  async function submit() {
    error.value = null

    try {
      const validatedData = await validationSchema.validate(form.value, {
        abortEarly: false,
      })
      // Garantir que edition tenha 1 se não informado
      if (!validatedData.edition) validatedData.edition = 1

      loading.value = true
      await BooksService.create(validatedData)
      successToast('Livro cadastrado com sucesso.')
      router.push({ name: 'BooksList' })
    } catch (validationError) {
      if (validationError.inner && validationError.inner.length) {
        validationError.inner.forEach((e) => errorToast(e.message))
        return
      }
      error.value = validationError.message
    } finally {
      loading.value = false
    }
  }
</script>
