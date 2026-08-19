<template>
  <svg
    class="inline-block animate-spin"
    :class="sizeClass"
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    aria-label="Carregando..."
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    ></circle>
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
    ></path>
  </svg>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    class: { type: String, default: '' },
  })

  const sizeClass = computed(() => props.class || 'h-4 w-4')
</script>
