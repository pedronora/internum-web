<template>
  <div class="container mt-4">
    <h1 class="mb-4">Detalhes do Livro</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="book" class="card shadow-sm p-3">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-bold">Título</label>
          <input
            v-model="book.title"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-6">
          <label class="form-label fw-bold">Autor</label>
          <input
            v-model="book.author"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">ISBN</label>
          <input
            v-model="book.isbn"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Editora</label>
          <input
            v-model="book.publisher"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Edição</label>
          <input
            v-model="book.edition"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Ano de publicação</label>
          <input
            v-model="book.year"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Quantidade</label>
          <input
            v-model="book.quantity"
            type="text"
            class="form-control"
            disabled
          />
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold">Disponível</label>
          <input
            v-model="book.available_quantity"
            type="text"
            class="form-control"
            disabled
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
            Voltar
          </router-link>
          <router-link
            :to="{ name: 'BookEdit', params: { id: book.id } }"
            class="btn btn-primary"
          >
            Editar
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { BooksService } from '@/services/books.services.js'
  import { error as errorToast } from '@/composables/useToast'

  const route = useRoute()
  const router = useRouter()

  const book = ref(null)
  const loading = ref(false)
  const error = ref(null)

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
      errorToast('Erro ao carregar detalhes do livro')
      router.push({ name: 'BooksList' })
    } finally {
      loading.value = false
    }
  })
</script>

<!-- <style scoped>
  .form-control {
    background-color: #f8f9fa;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #dee2e6;
  }
</style> -->
