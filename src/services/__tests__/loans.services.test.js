import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { LoansService } from '../loans.services'

describe('LoansService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('request posts to request loan for book', async () => {
    const responseData = { id: 1, status: 'requested' }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await LoansService.request(1)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/library/loans/1/request')
  })

  it('approve patches loan to approve', async () => {
    const responseData = { id: 1, status: 'approved' }
    mockApi.patch.mockResolvedValueOnce({ data: responseData })

    const result = await LoansService.approve(1)

    expect(result).toEqual(responseData)
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/library/loans/1/approve')
  })

  it('reject patches loan to reject', async () => {
    const responseData = { id: 1, status: 'rejected' }
    mockApi.patch.mockResolvedValueOnce({ data: responseData })

    const result = await LoansService.reject(1)

    expect(result).toEqual(responseData)
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/library/loans/1/reject')
  })

  it('cancel patches loan to cancel', async () => {
    const responseData = { id: 1, status: 'cancelled' }
    mockApi.patch.mockResolvedValueOnce({ data: responseData })

    const result = await LoansService.cancel(1)

    expect(result).toEqual(responseData)
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/library/loans/1/cancel')
  })

  it('return patches loan to return', async () => {
    const responseData = { id: 1, status: 'returned' }
    mockApi.patch.mockResolvedValueOnce({ data: responseData })

    const result = await LoansService.return(1)

    expect(result).toEqual(responseData)
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/library/loans/1/return')
  })

  it('list sends params including offset, limit, search, status, sort', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { loans: [] } })

    await LoansService.list(5, 20, 'search', 'approved', 'created_at', 'asc')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/library/loans', {
      params: { offset: 5, limit: 20, search: 'search', status: 'approved', sort_by: 'created_at', sort_order: 'asc' },
    })
  })

  it('listMy sends params for my loans', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { loans: [] } })

    await LoansService.listMy(0, 10, 'pending', 'updated_at', 'desc')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/library/loans/my', {
      params: { offset: 0, limit: 10, status: 'pending', sort_by: 'updated_at', sort_order: 'desc' },
    })
  })
})