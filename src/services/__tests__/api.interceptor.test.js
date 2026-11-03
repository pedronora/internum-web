import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  accessToken: 'old-token',
  refreshToken: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => authMock,
}))

import api, { REFRESH_LOCK_NAME, refreshTokenWithLock } from '../api'

const okResponse = (config) => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('api response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.accessToken = 'old-token'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    api.defaults.adapter = undefined
  })

  it('refreshes inside the cross-tab lock and retries the request', async () => {
    const requests = []

    api.defaults.adapter = async (config) => {
      requests.push(config)

      if (requests.length === 1) {
        return Promise.reject({ config, response: { status: 401 } })
      }

      return okResponse(config)
    }

    const lockRequest = vi.fn(async (_name, callback) => callback())
    vi.stubGlobal('navigator', { locks: { request: lockRequest } })

    authMock.refreshToken.mockImplementation(async () => {
      authMock.accessToken = 'new-token'
      return { access_token: 'new-token' }
    })

    const response = await api.get('/api/v1/books')

    expect(response.data).toEqual({ ok: true })
    expect(lockRequest).toHaveBeenCalledWith(
      REFRESH_LOCK_NAME,
      expect.any(Function),
    )
    expect(authMock.refreshToken).toHaveBeenCalledTimes(1)
    expect(requests).toHaveLength(2)
    expect(requests[1].headers.Authorization).toBe('Bearer new-token')
  })

  it('falls back to a direct refresh without Web Locks', async () => {
    api.defaults.adapter = async (config) =>
      config.headers.Authorization === 'Bearer old-token'
        ? Promise.reject({ config, response: { status: 401 } })
        : okResponse(config)

    vi.stubGlobal('navigator', {})

    authMock.refreshToken.mockImplementation(async () => {
      authMock.accessToken = 'new-token'
      return { access_token: 'new-token' }
    })

    const response = await api.get('/api/v1/books')

    expect(response.data).toEqual({ ok: true })
    expect(authMock.refreshToken).toHaveBeenCalledTimes(1)
  })
})

describe('refreshTokenWithLock', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('serializes concurrent refreshes from different tabs', async () => {
    let releaseFirst
    const firstRefresh = new Promise((resolve) => {
      releaseFirst = resolve
    })

    const refreshToken = vi
      .fn()
      .mockImplementationOnce(() => firstRefresh)
      .mockImplementationOnce(async () => 'second')

    let tail = Promise.resolve()
    const lockRequest = vi.fn((_name, callback) => {
      const run = tail.then(() => callback())
      tail = run.then(
        () => undefined,
        () => undefined,
      )
      return run
    })

    vi.stubGlobal('navigator', { locks: { request: lockRequest } })

    const auth = { refreshToken }
    const firstCall = refreshTokenWithLock(auth)
    const secondCall = refreshTokenWithLock(auth)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(refreshToken).toHaveBeenCalledTimes(1)

    releaseFirst('first')

    await expect(firstCall).resolves.toBe('first')
    await expect(secondCall).resolves.toBe('second')
    expect(refreshToken).toHaveBeenCalledTimes(2)
  })
})
