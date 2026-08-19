<template>
  <div class="m-4">
    <h1 class="mb-4 text-2xl font-bold">Cadastrar Livro</h1>

    <div v-if="error" class="error-alert mb-4">{{ error }}</div>

    <form
      class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      @submit.prevent="submit"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label class="label-base" for="title">Título</label>
          <input id="title" v-model="form.title" required class="input-base" />
        </div>

        <div>
          <label class="label-base" for="author">Autor</label>
          <input
            id="author"
            v-model="form.author"
            required
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="isbn">ISBN</label>
          <input id="isbn" v-model="form.isbn" required class="input-base" />
        </div>

        <div>
          <label class="label-base" for="publisher">Editora</label>
          <input
            id="publisher"
            v-model="form.publisher"
            required
            class="input-base"
          />
        </div>

        <div>
          <label class="label-base" for="edition">Edição</label>
          <input
            id="edition"
            v-model.number="form.edition"
            type="number"
            min="1"
            class="input-base"
            placeholder="1"
          />
        </div>

        <div>
          <label class="label-base" for="year">Ano de publicação</label>
          <input
            id="year"
            v-model.number="form.year"
            type="number"
            min="1500"
            :max="currentYear"
            required
            class="input-base"
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
  import BaseSpinner from '@/components/BaseSpinner.vue'

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
