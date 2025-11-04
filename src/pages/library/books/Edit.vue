<template>
  <div class="container mt-4">
    <h1 class="mb-4">Editar Livro</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <form v-else-if="book" class="card shadow-sm p-3" @submit.prevent="submit">
      <div class="row g-3">
        <!-- Linha 1 -->
        <div class="col-md-6">
          <label class="form-label fw-bold">Título</label>
          <input
            v-model="book.title"
            required
            type="text"
            class="form-control"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label fw-bold">Autor</label>
          <input
            v-model="book.author"
            required
            type="text"
            class="form-control"
          />
        </div>

        <!-- Linha 2 -->
        <div class="col-md-3">
          <label class="form-label fw-bold">ISBN</label>
          <input
            v-model="book.isbn"
            required
            type="text"
            class="form-control"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Editora</label>
          <input
            v-model="book.publisher"
            required
            type="text"
            class="form-control"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Edição</label>
          <input
            v-model.number="book.edition"
            type="number"
            min="1"
            class="form-control"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Ano de publicação</label>
          <input
            v-model.number="book.year"
            type="number"
            min="1500"
            :max="currentYear"
            required
            class="form-control"
          />
        </div>

        <!-- Linha 3 -->
        <div class="col-md-3">
          <label class="form-label fw-bold">Quantidade</label>
          <input
            v-model.number="book.quantity"
            type="number"
            min="0"
            required
            class="form-control"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Disponível</label>
          <input
            v-model.number="book.available_quantity"
            type="number"
            min="0"
            required
            class="form-control"
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Criado em</label>
          <input
            :value="formatDate(book.created_at)"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Atualizado em</label>
          <input
            :value="book.updated_at ? formatDate(book.updated_at) : '—'"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <!-- Ações -->
        <div class="col-12 d-flex gap-2 justify-content-end mt-3">
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
            Salvar alterações
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { BooksService } from '@/services/books.services.js'
  import {
    success as successToast,
    error as errorToast,
  } from '@/composables/useToast'
  import { useDate } from '@/composables/useDate'
  import * as yup from 'yup'

  const route = useRoute()
  const router = useRouter()
  const { formatDate } = useDate()

  const book = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const currentYear = new Date().getFullYear()

  // Validação do formulário
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
    quantity: yup.number().min(0, 'Quantidade inválida').required(),
    available_quantity: yup.number().min(0, 'Quantidade inválida').required(),
  })

  onMounted(async () => {
    const id = route.params.id
    if (!id) {
      error.value = 'ID do livro não informado'
      return
    }

    loading.value = true
    try {
      book.value = await BooksService.getById(id)
    } catch (err) {
      console.error(err)
      errorToast('Erro ao carregar o livro para edição')
      router.push({ name: 'BooksList' })
    } finally {
      loading.value = false
    }
  })

  async function submit() {
    error.value = null
    try {
      await validationSchema.validate(book.value, { abortEarly: false })
    } catch (validationError) {
      if (validationError.inner && validationError.inner.length) {
        validationError.inner.forEach((e) => errorToast(e.message))
        return
      }
      error.value = validationError.message
      return
    }

    loading.value = true
    try {
      await BooksService.update(book.value.id, book.value)
      successToast('Livro atualizado com sucesso.')
      router.push({ name: 'BooksList' })
    } catch (err) {
      console.error(err)
      errorToast(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message ||
          'Erro ao atualizar livro',
      )
    } finally {
      loading.value = false
    }
  }
</script>
