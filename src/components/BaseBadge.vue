<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="classes"
  >
    <slot />
  </span>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    color: { type: String, default: 'slate' },
    variant: { type: String, default: 'solid' },
  })

  const colors = {
    slate: {
      solid: 'bg-slate-500 text-white',
      soft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    },
    dark: {
      solid: 'bg-slate-800 text-white',
      soft: 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
    },
    light: {
      solid: 'bg-slate-100 text-slate-700',
      soft: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
    },
    primary: {
      solid: 'bg-primary-600 text-white',
      soft: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    },
    success: {
      solid: 'bg-green-600 text-white',
      soft: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    warning: {
      solid: 'bg-amber-500 text-white',
      soft: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
    danger: {
      solid: 'bg-red-600 text-white',
      soft: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    info: {
      solid: 'bg-sky-600 text-white',
      soft: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    },
  }

  const classes = computed(
    () => colors[props.color]?.[props.variant] || colors.slate.solid,
  )
</script>
