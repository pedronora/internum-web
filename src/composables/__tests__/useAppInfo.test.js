import { afterEach, describe, expect, it } from 'vitest'
import { getAppVersion, useAppInfo } from '../useAppInfo'

describe('useAppInfo', () => {
  afterEach(() => {
    delete globalThis.window
  })

  it('returns the version injected at runtime', () => {
    globalThis.window = { __ENV__: { APP_VERSION: '2.1.0' } }

    expect(getAppVersion()).toBe('2.1.0')
  })

  it('falls back to dev when the runtime env is missing', () => {
    expect(getAppVersion()).toBe('dev')
  })

  it('returns the current year', () => {
    expect(useAppInfo().year).toBe(new Date().getFullYear())
  })
})
