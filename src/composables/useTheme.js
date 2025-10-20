import { ref, computed, onMounted, onUnmounted } from "vue";

const THEME_KEY = "theme";

export function useTheme() {
  const isDark = ref(false);

  const applyTheme = (theme) => {
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  };

  const resolveStoredOrSystem = (stored) => {
    if (!stored || stored === "auto") {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return stored;
  };

  const setTheme = (theme) => {
    isDark.value = theme === "dark";
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    applyTheme(theme);
  };

  const loadInitialTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const initial = resolveStoredOrSystem(stored);
      setTheme(initial);
    } catch (e) {
      const system = resolveStoredOrSystem(null);
      setTheme(system);
    }
  };

  function toggle() {
    setTheme(isDark.value ? "light" : "dark");
  }

  let mql;
  const handlePrefChange = (e) => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "auto") {
        const theme = e.matches ? "dark" : "light";
        applyTheme(theme);
        isDark.value = theme === "dark";
      }
    } catch (err) {}
  };

  onMounted(() => {
    loadInitialTheme();
    if (typeof window !== "undefined" && window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.addEventListener)
        mql.addEventListener("change", handlePrefChange);
      else if (mql.addListener) mql.addListener(handlePrefChange);
    }
  });

  onUnmounted(() => {
    if (mql) {
      if (mql.removeEventListener)
        mql.removeEventListener("change", handlePrefChange);
      else if (mql.removeListener) mql.removeListener(handlePrefChange);
    }
  });

  const iconClass = computed(() =>
    isDark.value ? "bi bi-moon-fill" : "bi bi-sun-fill",
  );
  const buttonTitle = computed(() =>
    isDark.value ? "Ativar modo claro" : "Ativar modo escuro",
  );

  return {
    isDark,
    iconClass,
    buttonTitle,
    toggle,
  };
}
