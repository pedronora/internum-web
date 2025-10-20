import { reactive } from 'vue'

let nextId = 1

const toastStore = reactive({
  toasts: [],
})

function showToast({
  title = '',
  message = '',
  type = 'info',
  timeout = 5000,
  actions = [],
  meta = {},
} = {}) {
  const id = nextId++
  const t = { id, title, message, type, actions, meta }
  toastStore.toasts.push(t)

  if (timeout && timeout > 0) {
    setTimeout(() => {
      removeToast(id)
    }, timeout)
  }

  return id
}

function removeToast(id) {
  const idx = toastStore.toasts.findIndex((x) => x.id === id)
  if (idx !== -1) toastStore.toasts.splice(idx, 1)
}

function success(message, opts = {}) {
  return showToast({
    message,
    type: 'success',
    timeout: opts.timeout ?? 4000,
    title: opts.title,
  })
}
function error(message, opts = {}) {
  return showToast({
    message,
    type: 'error',
    timeout: opts.timeout ?? 7000,
    title: opts.title,
  })
}
function info(message, opts = {}) {
  return showToast({
    message,
    type: 'info',
    timeout: opts.timeout ?? 5000,
    title: opts.title,
  })
}
function warning(message, opts = {}) {
  return showToast({
    message,
    type: 'warning',
    timeout: opts.timeout ?? 6000,
    title: opts.title,
  })
}

/**
 * Confirm via toast: returns Promise<boolean>
 * options: { title, confirmLabel, cancelLabel, timeout }
 */
function confirm(message, options = {}) {
  return new Promise((resolve) => {
    const id = nextId++
    const confirmLabel = options.confirmLabel || 'Confirmar'
    const cancelLabel = options.cancelLabel || 'Cancelar'
    const t = {
      id,
      title: options.title || 'Confirmação',
      message,
      type: 'warning',
      meta: {},
      actions: [
        {
          label: cancelLabel,
          class: 'btn-outline-secondary',
          onClick: () => {
            removeToast(id)
            resolve(false)
          },
        },
        {
          label: confirmLabel,
          class: 'btn-warning',
          onClick: () => {
            removeToast(id)
            resolve(true)
          },
        },
      ],
    }

    toastStore.toasts.push(t)

    if (options.timeout && options.timeout > 0) {
      setTimeout(() => {
        // se tempo acabar, fecha e resolve false
        const found = toastStore.toasts.find((x) => x.id === id)
        if (found) {
          removeToast(id)
          resolve(false)
        }
      }, options.timeout)
    }
  })
}

export {
  toastStore,
  showToast,
  removeToast,
  success,
  error,
  info,
  warning,
  confirm,
}

export default {
  toastStore,
  showToast,
  removeToast,
  success,
  error,
  info,
  warning,
  confirm,
}
