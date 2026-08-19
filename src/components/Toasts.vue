<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    class="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 p-2"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      role="alert"
      aria-live="assertive"
    >
      <div
        :class="[
          'flex items-center justify-between gap-2 px-4 py-2',
          headerClass(t.type),
        ]"
      >
        <strong class="font-semibold">{{
          t.title || titleByType(t.type)
        }}</strong>
        <span class="flex items-center gap-2">
          <small v-if="t.meta?.small" class="opacity-75">{{
            t.meta.small
          }}</small>
          <button
            type="button"
            class="rounded p-0.5 opacity-70 transition hover:opacity-100"
            aria-label="Fechar"
            @click="close(t.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
              />
            </svg>
          </button>
        </span>
      </div>
      <div class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
        <div>{{ t.message }}</div>

        <div v-if="t.actions?.length" class="mt-3 flex gap-2">
          <button
            v-for="(a, idx) in t.actions"
            :key="idx"
            :class="actionClass(a.class)"
            @click="actionClick(t.id, a)"
          >
            {{ a.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { toastStore, removeToast } from '@/composables/useToast'

  const toasts = toastStore.toasts

  function close(id) {
    removeToast(id)
  }

  function actionClick(id, action) {
    if (action && typeof action.onClick === 'function') {
      action.onClick()
    }
    if (!action.stay) removeToast(id)
  }

  function headerClass(type) {
    return type === 'success'
      ? 'bg-green-600 text-white'
      : type === 'error'
        ? 'bg-red-600 text-white'
        : type === 'warning'
          ? 'bg-amber-500 text-white'
          : 'bg-sky-600 text-white'
  }

  function titleByType(type) {
    return type === 'success'
      ? 'Sucesso'
      : type === 'error'
        ? 'Erro'
        : type === 'warning'
          ? 'Atenção'
          : 'Info'
  }

  const ACTION_CLASSES = {
    'btn-outline-secondary':
      'inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    'btn-warning':
      'inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600',
    'btn-primary':
      'inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700',
  }

  function actionClass(bootstrapClass) {
    return ACTION_CLASSES[bootstrapClass] || ACTION_CLASSES['btn-primary']
  }
</script>
