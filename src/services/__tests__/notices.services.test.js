import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { NoticesService } from '../notices.services'

describe('NoticesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listUnreads sends offset and limit params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.listUnreads(5, 20)

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/unreads/me', {
      params: { offset: 5, limit: 20 },
    })
  })

  it('listUnreads includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.listUnreads(0, 10, 'search term')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/unreads/me', {
      params: { offset: 0, limit: 10, search: 'search term' },
    })
  })

  it('listReads sends offset and limit params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.listReads(5, 20)

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/reads/me', {
      params: { offset: 5, limit: 20 },
    })
  })

  it('listReads includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.listReads(0, 10, 'search term')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/reads/me', {
      params: { offset: 0, limit: 10, search: 'search term' },
    })
  })

  it('markAsRead posts to mark notice as read', async () => {
    const responseData = { marked: true }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await NoticesService.markAsRead(1)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/notices/1/mark-read/me')
  })

  it('create posts payload to notices endpoint', async () => {
    const payload = { title: 'Notice Title', content: 'Content' }
    const responseData = { id: 1, ...payload }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await NoticesService.create(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/notices/', payload)
  })

  it('list sends offset and limit params as URLSearchParams', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.list(5, 20)

    const expectedParams = new URLSearchParams()
    expectedParams.append('offset', '5')
    expectedParams.append('limit', '20')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/', {
      params: expectedParams,
    })
  })

  it('list includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { notices: [] } })

    await NoticesService.list(0, 10, 'search term')

    const expectedParams = new URLSearchParams()
    expectedParams.append('offset', '0')
    expectedParams.append('limit', '10')
    expectedParams.append('search', 'search term')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/', {
      params: expectedParams,
    })
  })

  it('getById gets notice by id', async () => {
    const responseData = { id: 1, title: 'Notice' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await NoticesService.getById(1)

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notices/1')
  })

  it('deactivate deletes notice by id', async () => {
    mockApi.delete.mockResolvedValueOnce({})

    await NoticesService.deactivate(1)

    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/notices/1')
  })
})
