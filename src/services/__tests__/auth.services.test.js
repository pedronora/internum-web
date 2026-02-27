import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { AuthService } from '../auth.services'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login sends form-url-encoded payload with expected headers', async () => {
    const payload = {
      username: 'john',
      password: 'secret',
    }
    const responseData = { access_token: 'token' }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await AuthService.login(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledTimes(1)

    const [url, body, config] = mockApi.post.mock.calls[0]
    expect(url).toBe('/api/v1/auth/token')
    expect(body).toBeInstanceOf(URLSearchParams)
    expect(body.get('username')).toBe('john')
    expect(body.get('password')).toBe('secret')
    expect(config).toEqual(
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-skip-refresh': '1',
        }),
      }),
    )
  })

  it('logout posts to logout endpoint with credentials', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { ok: true } })

    await AuthService.logout()

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      null,
      expect.objectContaining({ withCredentials: true }),
    )
  })

  it('refreshToken posts with skip-refresh header and returns data', async () => {
    const responseData = { access_token: 'new-token' }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await AuthService.refreshToken()

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/auth/refresh_token',
      null,
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({ 'x-skip-refresh': '1' }),
      }),
    )
  })

  it('forgotPassword posts payload and returns data', async () => {
    const payload = { email: 'user@example.com' }
    const responseData = { message: 'ok' }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await AuthService.forgotPassword(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/auth/forgot-password',
      payload,
    )
  })

  it('resetPassword posts payload and returns data', async () => {
    const payload = { token: 'abc', password: 'NewPass123!' }
    const responseData = { message: 'ok' }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await AuthService.resetPassword(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/auth/reset-password',
      payload,
    )
  })
})
