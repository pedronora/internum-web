import { ref, computed } from 'vue'

export function useCPF() {
  const cpf = ref('')
  const cpfError = ref('')

  // Funções de validação
  function validarDigitosVerificadores(cpfNumeros) {
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfNumeros.charAt(i)) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfNumeros.charAt(9))) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfNumeros.charAt(i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfNumeros.charAt(10))) return false

    return true
  }

  function validarCPF(valor) {
    const cpfNumeros = String(valor || '').replace(/\D/g, '')

    if (cpfNumeros.length !== 11) return false
    if (/^(\d)\1+$/.test(cpfNumeros)) return false

    return validarDigitosVerificadores(cpfNumeros)
  }

  function formatarCPF(valor) {
    const cpfNumeros = String(valor || '')
      .replace(/\D/g, '')
      .slice(0, 11)

    if (cpfNumeros.length <= 3) return cpfNumeros
    if (cpfNumeros.length <= 6)
      return cpfNumeros.replace(/^(\d{3})(\d{0,3})/, '$1.$2')
    if (cpfNumeros.length <= 9)
      return cpfNumeros.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    return cpfNumeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  }

  function limparCPF(valor) {
    return String(valor || '')
      .replace(/\D/g, '')
      .slice(0, 11)
  }

  function validarCampoCPF() {
    if (!cpf.value || cpf.value.length < 11) {
      cpfError.value = 'CPF deve ter 11 dígitos'
      return false
    }

    if (!validarCPF(cpf.value)) {
      cpfError.value = 'CPF inválido'
      return false
    }

    cpfError.value = ''
    return true
  }

  function handleCPFInput(event) {
    let value = String(event?.target?.value || '').replace(/\D/g, '')

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    cpf.value = value
    event.target.value = formatarCPF(value)
    validarCampoCPF()
  }

  // Computed para uso com v-model
  const cpfDisplay = computed({
    get: () => formatarCPF(cpf.value),
    set: (value) => {
      cpf.value = limparCPF(value)
      cpfError.value = ''
    },
  })

  function setCPF(value) {
    cpf.value = limparCPF(value)
    cpfError.value = ''
  }

  function resetCPF() {
    cpf.value = ''
    cpfError.value = ''
  }

  return {
    cpf,
    cpfError,
    cpfDisplay,
    handleCPFInput,
    validarCPF,
    validarCampoCPF,
    formatarCPF,
    limparCPF,
    setCPF,
    resetCPF,
  }
}
