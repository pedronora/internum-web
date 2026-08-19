<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="close"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        ></div>

        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          class="relative w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-slate-800"
        >
          <header
            :class="[
              'flex items-center justify-between gap-4 rounded-t-xl px-6 py-4',
              headerClasses,
            ]"
          >
            <h3 :id="titleId" class="text-lg font-semibold">
              <slot name="header">{{ title }}</slot>
            </h3>
            <button
              type="button"
              class="rounded-full p-1 transition hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Fechar"
              @click="close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                />
              </svg>
            </button>
          </header>

          <div class="px-6 py-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex flex-wrap justify-end gap-2 rounded-b-xl border-t border-slate-200 px-6 py-4 dark:border-slate-700"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { computed, watch, onUnmounted } from 'vue'

  const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    tone: { type: String, default: 'default' },
  })

  const emit = defineEmits(['close'])

  const titleId = computed(
    () => 'modal-title-' + Math.random().toString(36).slice(2, 8),
  )

  const headerClasses = computed(() => {
    if (props.tone === 'success') return 'bg-green-600 text-white'
    if (props.tone === 'danger') return 'bg-red-600 text-white'
    return 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
  })

  function close() {
    emit('close')
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close()
  }

  watch(
    () => props.open,
    (open) => {
      if (open) window.addEventListener('keydown', onKeydown)
      else window.removeEventListener('keydown', onKeydown)
    },
  )

  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.15s ease;
  }

  .modal-enter-active > div:last-child,
  .modal-leave-active > div:last-child {
    transition: transform 0.15s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from > div:last-child,
  .modal-leave-to > div:last-child {
    transform: scale(0.95);
  }
</style>
