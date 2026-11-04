<template>
  <div class="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <label
      v-for="role in roles"
      :key="role.value"
      class="group relative flex h-full cursor-pointer items-start gap-3 rounded-lg border p-3 transition"
      :class="[
        role.disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-900/40'
          : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20',
        selected.includes(role.value) ? 'ring-2 ring-primary-500/40' : '',
      ]"
    >
      <input
        :checked="selected.includes(role.value)"
        type="checkbox"
        :value="role.value"
        :disabled="role.disabled"
        :aria-describedby="tooltipId(role.value)"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
        @change="toggle(role.value, $event.target.checked)"
      />

      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-1.5">
          <span class="text-sm font-medium text-slate-800 dark:text-slate-100">
            {{ role.label }}
          </span>
          <span
            aria-hidden="true"
            class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500 dark:border-slate-600 dark:text-slate-400"
          >
            i
          </span>
        </span>
      </span>

      <span
        :id="tooltipId(role.value)"
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 px-3 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-700"
      >
        {{ role.description }}
      </span>
    </label>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    roles: { type: Array, default: () => [] },
  })

  const emit = defineEmits(['update:modelValue'])

  const uid = Math.random().toString(36).slice(2, 8)

  const selected = computed(() => props.modelValue || [])

  function tooltipId(role) {
    return `role-tooltip-${uid}-${role}`
  }

  function toggle(role, checked) {
    const next = new Set(selected.value)
    if (checked) next.add(role)
    else next.delete(role)
    emit('update:modelValue', [...next])
  }
</script>
