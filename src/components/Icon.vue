<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    :class="['inline-block shrink-0', sizeClass]"
    :aria-hidden="ariaHidden ? 'true' : undefined"
    :aria-label="ariaHidden ? undefined : ariaLabel"
    :role="ariaHidden ? undefined : 'img'"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script setup>
  import { computed } from 'vue'
  import { ICONS } from '@/components/iconPaths'

  const props = defineProps({
    name: { type: String, required: true },
    class: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    ariaHidden: { type: [Boolean, String], default: false },
  })

  const paths = computed(() => ICONS[props.name] || [])
  const sizeClass = computed(() => props.class || 'h-4 w-4')
</script>
