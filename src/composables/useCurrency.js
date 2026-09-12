import { ref, computed } from 'vue'

function parseParaNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null

  if (typeof valor === 'number' && !isNaN(valor)) return valor

  let str = String(valor).trim()

  const hasComma = str.includes(',')

  if (hasComma) {
    str = str
      .replace(/\./g, '')
      .replace(/[^0-9,-]/g, '')
      .replace(',', '.')
  } else {
    str = str.replace(/[^0-9.]/g, '')
  }

  const parsed = parseFloat(str)
  return isNaN(parsed) ? null : parsed
}

function formatarMoedaBR(valor) {
  const numero = parseParaNumero(valor)

  if (numero === null) return ''

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function validarSalario(numero) {
  if (numero === null) return true
  return numero >= 0
}

export function useCurrency() {
  const grossSalary = ref(null)
  const salaryError = ref('')

  const salaryDisplay = computed({
    get: () => formatarMoedaBR(grossSalary.value),
    set: (value) => {
      const digits = String(value || '')
        .replace(/\D/g, '')
        .slice(0, 12)

      if (!digits) {
        grossSalary.value = null
      } else {
        grossSalary.value = parseInt(digits, 10) / 100
      }
      salaryError.value = ''
    },
  })

  function validarCampoSalary() {
    if (!validarSalario(grossSalary.value)) {
      salaryError.value = 'O salário não pode ser negativo'
      return false
    }
    salaryError.value = ''
    return true
  }

  function setGrossSalary(value) {
    grossSalary.value = parseParaNumero(value)
    salaryError.value = ''
  }

  function resetSalary() {
    grossSalary.value = null
    salaryError.value = ''
  }

  return {
    grossSalary,
    salaryError,
    salaryDisplay,
    validarCampoSalary,
    formatarMoedaBR,
    parseParaNumero,
    setGrossSalary,
    resetSalary,
  }
}

export { formatarMoedaBR, parseParaNumero }
