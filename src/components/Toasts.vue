<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    class="position-fixed bottom-0 end-0 p-3"
    style="z-index: 1080"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast show mb-2"
      role="alert"
      :aria-live="'assertive'"
    >
      <div :class="['toast-header', headerClass(t.type)]">
        <strong class="me-auto">{{ t.title || titleByType(t.type) }}</strong>
        <small v-if="t.meta?.small" class="text-muted">{{
          t.meta.small
        }}</small>
        <button
          type="button"
          class="btn-close ms-2 mb-1"
          aria-label="Close"
          @click="close(t.id)"
        ></button>
      </div>
      <div class="toast-body">
        <div>{{ t.message }}</div>

        <div v-if="t.actions?.length" class="mt-2 d-flex gap-2">
          <button
            v-for="(a, idx) in t.actions"
            :key="idx"
            :class="['btn btn-sm', a.class || 'btn-primary']"
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
      ? 'bg-success text-white'
      : type === 'error'
        ? 'bg-danger text-white'
        : type === 'warning'
          ? 'bg-warning text-dark'
          : 'bg-secondary text-white'
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
</script>

<style scoped>
  .toast {
    min-width: 260px;
    max-width: 360px;
  }
</style>
