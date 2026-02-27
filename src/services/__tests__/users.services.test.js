import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { UsersService } from '../users.services'

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list sends offset and limit params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { users: [] } })

    await UsersService.list(5, 20)

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/', {
      params: { offset: 5, limit: 20 },
    })
  })

  it('list includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { users: [] } })

    await UsersService.list(0, 10, 'ana')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/', {
      params: { offset: 0, limit: 10, search: 'ana' },
    })
  })

  it('me returns response data', async () => {
    const responseData = { id: 1, username: 'user1' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await UsersService.me()

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me')
  })

  it('getById returns response data', async () => {
    const responseData = { id: 7, name: 'Maria' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await UsersService.getById(7)

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/7')
  })

  it('create posts payload and returns data', async () => {
    const payload = { username: 'new.user', cpf: '12345678901' }
    const responseData = { id: 10 }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await UsersService.create(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/users/', payload)
  })

  it('update sends id and payload and returns data', async () => {
    const payload = { active: false, termination_date: '2026-02-27' }
    const responseData = { id: 10, active: false }
    mockApi.put.mockResolvedValueOnce({ data: responseData })

    const result = await UsersService.update(10, payload)

    expect(result).toEqual(responseData)
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/10', payload)
  })

  it('deactivate calls delete endpoint', async () => {
    mockApi.delete.mockResolvedValueOnce({ status: 204 })

    await UsersService.deactivate(3)

    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/users/3')
  })

  it('changePassword posts expected shape and returns data', async () => {
    const responseData = { ok: true }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await UsersService.changePassword(8, 'oldPwd', 'newPwd')

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/users/8/change-password', {
      old_password: 'oldPwd',
      new_password: 'newPwd',
    })
  })
})
