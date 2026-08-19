import { ref, computed, onMounted, onUnmounted } from 'vue'

const THEME_KEY = 'theme'

export function useTheme() {
  const isDark = ref(false)

  const applyTheme = (theme) => {
    if (typeof document !== 'undefined' && document.documentElement) {
      // Marca o tema para o Tailwind (classe .dark) e, durante a transição,
      // mantém o data-bs-theme para as páginas Bootstrap ainda não migradas.
      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  const resolveStoredOrSystem = (stored) => {
    if (!stored || stored === 'auto') {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }
    return stored
  }

  const setTheme = (theme) => {
    isDark.value = theme === 'dark'
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (err) {
      console.error(`Erro ao salvar o theme definido pelo usuário: ${err}`)
    }
    applyTheme(theme)
  }

  const loadInitialTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (!stored) {
        // Sem preferência salva: segue o sistema sem persistir valor.
        applyTheme(resolveStoredOrSystem(null))
        isDark.value = document.documentElement.classList.contains('dark')
        return
      }
      if (stored === 'auto') {
        // Segue o sistema, mas mantém 'auto' salvo (não sobrescreve).
        const theme = resolveStoredOrSystem('auto')
        isDark.value = theme === 'dark'
        applyTheme(theme)
        return
      }
      isDark.value = stored === 'dark'
      applyTheme(stored)
    } catch (err) {
      console.error('Erro ao carregar tema inicial:', err)
      const system = resolveStoredOrSystem(null)
      isDark.value = system === 'dark'
      applyTheme(system)
    }
  }

  function toggle() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  let mql
  const handlePrefChange = (e) => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'auto') {
        const theme = e.matches ? 'dark' : 'light'
        applyTheme(theme)
        isDark.value = theme === 'dark'
      }
    } catch (err) {
      console.error('Erro ao lidar com mudança de preferência de cor:', err)
    }
  }

  const footerBgClass = computed(() =>
    isDark.value ? 'bg-dark bg-gradient' : 'bg-light bg-gradient',
  )

  onMounted(() => {
    loadInitialTheme()
    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)')
      if (mql.addEventListener) mql.addEventListener('change', handlePrefChange)
      else if (mql.addListener) mql.addListener(handlePrefChange)
    }
  })

  onUnmounted(() => {
    if (mql) {
      if (mql.removeEventListener)
        mql.removeEventListener('change', handlePrefChange)
      else if (mql.removeListener) mql.removeListener(handlePrefChange)
    }
  })

  const icon = computed(() => (isDark.value ? 'moon' : 'sun'))
  const buttonTitle = computed(() =>
    isDark.value ? 'Ativar modo claro' : 'Ativar modo escuro',
  )

  return {
    isDark,
    icon,
    buttonTitle,
    footerBgClass,
    toggle,
  }
}
