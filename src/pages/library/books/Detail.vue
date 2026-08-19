<template>
  <div class="m-4">
    <h1 class="mb-4 text-2xl font-bold">Detalhes do Livro</h1>

    <div v-if="error" class="error-alert mb-4">{{ error }}</div>
    <div v-if="loading" class="row-loading">
      <BaseSpinner class="h-5 w-5" />
    </div>

    <div
      v-else-if="book"
      class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label class="label-base">Título</label>
          <input v-model="book.title" type="text" class="input-base" disabled />
        </div>

        <div>
          <label class="label-base">Autor</label>
          <input
            v-model="book.author"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">ISBN</label>
          <input v-model="book.isbn" type="text" class="input-base" disabled />
        </div>

        <div>
          <label class="label-base">Editora</label>
          <input
            v-model="book.publisher"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">Edição</label>
          <input
            v-model="book.edition"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">Ano de publicação</label>
          <input v-model="book.year" type="text" class="input-base" disabled />
        </div>

        <div>
          <label class="label-base">Quantidade</label>
          <input
            v-model="book.quantity"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">Disponível</label>
          <input
            v-model="book.available_quantity"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">Criado em</label>
          <input
            :value="formatDate(book.created_at)"
            type="text"
            class="input-base"
            disabled
          />
        </div>

        <div>
          <label class="label-base">Atualizado em</label>
          <input
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
            Voltar
          </router-link>
          <router-link
            :to="{ name: 'BookEdit', params: { id: book.id } }"
            class="btn-primary"
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
  import { useDate } from '@/composables/useDate'
  import BaseSpinner from '@/components/BaseSpinner.vue'

  const route = useRoute()
  const router = useRouter()
  const { formatDate } = useDate()

  const book = ref(null)
  const loading = ref(false)
  const error = ref(null)

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
