import { ref, computed } from 'vue'

const MIN_PHONE_DIGITS = 10
const MAX_PHONE_DIGITS = 13

function limparTelefone(valor) {
  return String(valor || '')
    .replace(/\D/g, '')
    .slice(0, MAX_PHONE_DIGITS)
}

function formatarParte(rest, prefix) {
  if (rest.length >= 9) {
    return `${prefix} ${rest.slice(0, 5)}-${rest.slice(5)}`
  }
  if (rest.length === 8) {
    return `${prefix} ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  return `${prefix} ${rest}`
}

function formatarTelefone(valor) {
  const digits = limparTelefone(valor)

  if (!digits.length) return ''
  if (digits.length <= 2) return digits

  if (digits.length >= 12) {
    const countryCode = digits.slice(0, 2)
    const ddd = digits.slice(2, 4)
    const rest = digits.slice(4)
    return formatarParte(rest, `+${countryCode} (${ddd})`)
  }

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  return formatarParte(rest, `(${ddd})`)
}

function validarTelefone(digits) {
  if (!digits) return true
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS
}

export function usePhone() {
  const phone = ref('')
  const phoneError = ref('')

  const phoneDisplay = computed({
    get: () => formatarTelefone(phone.value),
    set: (value) => {
      phone.value = limparTelefone(value)
      phoneError.value = ''
    },
  })

  function validarCampoPhone() {
    if (!validarTelefone(phone.value)) {
      phoneError.value = 'Telefone deve conter entre 10 e 13 dígitos'
      return false
    }
    phoneError.value = ''
    return true
  }

  function setPhone(value) {
    phone.value = limparTelefone(value)
    phoneError.value = ''
  }

  function resetPhone() {
    phone.value = ''
    phoneError.value = ''
  }

  return {
    phone,
    phoneError,
    phoneDisplay,
    validarCampoPhone,
    formatarTelefone,
    limparTelefone,
    setPhone,
    resetPhone,
  }
}

export { formatarTelefone, limparTelefone }
