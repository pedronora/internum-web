import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { HomeService } from '../home.services'

describe('HomeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getSummary gets from home endpoint', async () => {
    const responseData = { summary: 'data' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await HomeService.getSummary()

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('api/v1/home/')
  })
})