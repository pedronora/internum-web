import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { LegalBriefsService } from '../legalBriefs.services'

describe('LegalBriefsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create posts payload to legal-briefs endpoint', async () => {
    const payload = { title: 'Brief Title', content: 'Content' }
    const responseData = { id: 1, ...payload }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await LegalBriefsService.create(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/legal-briefs/', payload)
  })

  it('list sends offset and limit params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { briefs: [] } })

    await LegalBriefsService.list(5, 20)

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/legal-briefs/', {
      params: { offset: 5, limit: 20 },
    })
  })

  it('list includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { briefs: [] } })

    await LegalBriefsService.list(0, 10, 'search term')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/legal-briefs/', {
      params: { offset: 0, limit: 10, search: 'search term' },
    })
  })

  it('getById gets brief by id', async () => {
    const responseData = { id: 1, title: 'Brief' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await LegalBriefsService.getById(1)

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/legal-briefs/1')
  })

  it('update puts payload to brief endpoint', async () => {
    const payload = { title: 'Updated Title' }
    const responseData = { id: 1, ...payload }
    mockApi.put.mockResolvedValueOnce({ data: responseData })

    const result = await LegalBriefsService.update(1, payload)

    expect(result).toEqual(responseData)
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/legal-briefs/1', payload)
  })

  it('cancel patches brief to cancel', async () => {
    const responseData = { status: 'cancelled' }
    mockApi.patch.mockResolvedValueOnce({ data: responseData })

    const result = await LegalBriefsService.cancel(1)

    expect(result).toEqual(responseData)
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/legal-briefs/1/cancel')
  })
})
