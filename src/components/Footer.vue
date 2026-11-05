<template>
  <footer
    class="border-t border-slate-200 py-4 text-center dark:border-slate-700"
  >
    <p class="text-sm text-slate-500 dark:text-slate-400">
      © {{ year }} Internum - 1ª RI de Cascavel/PR. Todos os direitos
      reservados.
    </p>
    <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
      Versão {{ version }}
    </p>
  </footer>
</template>

<script setup>
  import { useAppInfo } from '@/composables/useAppInfo'

  const { year, version } = useAppInfo()
</script>
