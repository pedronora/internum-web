<template>
  <nav
    v-if="meta && (meta.total_pages || 1) > 1"
    :aria-label="ariaLabel"
    class="mt-4"
  >
    <!-- Variante "simple": contagem + botões Anterior/Próxima -->
    <div
      v-if="variant === 'simple'"
      class="flex flex-col items-center justify-between gap-2 sm:flex-row"
    >
      <span class="text-sm text-slate-500 dark:text-slate-400">
        Página {{ meta.page }} de {{ totalPages }}
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          class="btn-pagination"
          :disabled="!meta.has_prev"
          @click="$emit('prev')"
        >
          &laquo; Anterior
        </button>
        <button
          type="button"
          class="btn-pagination"
          :disabled="!meta.has_next"
          @click="$emit('next')"
        >
          Próxima &raquo;
        </button>
      </div>
    </div>

    <!-- Variante "pages": páginas numeradas -->
    <ul v-else class="flex flex-wrap items-center justify-center gap-1">
      <li>
        <button
          type="button"
          class="btn-pagination"
          :class="{ 'cursor-not-allowed opacity-50': !meta.has_prev }"
          :disabled="!meta.has_prev"
          @click="$emit('prev')"
        >
          Anterior
        </button>
      </li>
      <li v-for="pageNum in totalPages" :key="pageNum">
        <button
          type="button"
          class="btn-pagination"
          :class="{
            'bg-primary-600 border-primary-600 text-white':
              pageNum === meta.page,
          }"
          @click="$emit('go', pageNum)"
        >
          {{ pageNum }}
        </button>
      </li>
      <li>
        <button
          type="button"
          class="btn-pagination"
          :class="{ 'cursor-not-allowed opacity-50': !meta.has_next }"
          :disabled="!meta.has_next"
          @click="$emit('next')"
        >
          Próximo
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    meta: { type: Object, required: true },
    variant: { type: String, default: 'simple' },
    ariaLabel: { type: String, default: 'Paginação' },
  })

  defineEmits(['prev', 'next', 'go'])

  const totalPages = computed(() => props.meta.total_pages || 1)
</script>

<style scoped>
  @reference '../assets/main.css';

  .btn-pagination {
    @apply inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700;
  }
</style>
