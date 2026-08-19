<template>
  <div class="m-4">
    <h1 class="mb-4 text-2xl font-bold">Editar Livro</h1>

    <div v-if="error" class="error-alert mb-4">{{ error }}</div>
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
    </div>

    <form
      v-else-if="book"
      class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="submit"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label class="label-base" for="title">Título</label>
          <input
            id="title"
            v-model="book.title"
            required
            type="text"
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="author">Autor</label>
          <input
            id="author"
            v-model="book.author"
            required
            type="text"
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="isbn">ISBN</label>
          <input
            id="isbn"
            v-model="book.isbn"
            required
            type="text"
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="publisher">Editora</label>
          <input
            id="publisher"
            v-model="book.publisher"
            required
            type="text"
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="edition">Edição</label>
          <input
            id="edition"
            v-model.number="book.edition"
            type="number"
            min="1"
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="year">Ano de publicação</label>
          <input
            id="year"
            v-model.number="book.year"
            type="number"
            min="1500"
            :max="currentYear"
            required
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="quantity">Quantidade</label>
          <input
            id="quantity"
            v-model.number="book.quantity"
            type="number"
            min="0"
            required
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="available_quantity">Disponível</label>
          <input
            id="available_quantity"
            v-model.number="book.available_quantity"
            type="number"
            min="0"
            required
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="created_at">Criado em</label>
          <input
            id="created_at"
            :value="formatDate(book.created_at)"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base" for="updated_at">Atualizado em</label>
          <input
            id="updated_at"
            :value="book.updated_at ? formatDate(book.updated_at) : '—'"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div class="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
          <router-link
            :to="{ name: 'BooksList' }"
            class="btn-outline-secondary"
          >
            Cancelar
          </router-link>
          <button class="btn-primary" :disabled="loading">
            <BaseSpinner v-if="loading" class="h-4 w-4" />
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
  import BaseSpinner from '@/components/BaseSpinner.vue'

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
