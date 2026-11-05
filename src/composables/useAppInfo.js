const FALLBACK_VERSION = 'dev'

export function getAppVersion() {
  const runtimeVersion =
    typeof window !== 'undefined' ? window.__ENV__?.APP_VERSION : null

  return runtimeVersion || FALLBACK_VERSION
}

export function useAppInfo() {
  return {
    year: new Date().getFullYear(),
    version: getAppVersion(),
  }
}
