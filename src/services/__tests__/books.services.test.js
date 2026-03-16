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

import { BooksService } from '../books.services'

describe('BooksService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create posts payload to books endpoint', async () => {
    const payload = { title: 'Book Title', author: 'Author' }
    const responseData = { id: 1, ...payload }
    mockApi.post.mockResolvedValueOnce({ data: responseData })

    const result = await BooksService.create(payload)

    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/library/books', payload)
  })

  it('list sends offset and limit params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { books: [] } })

    await BooksService.list(5, 20)

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/library/books', {
      params: { offset: 5, limit: 20 },
    })
  })

  it('list includes search param when provided', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { books: [] } })

    await BooksService.list(0, 10, 'search term')

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/library/books', {
      params: { offset: 0, limit: 10, search: 'search term' },
    })
  })

  it('getById gets book by id', async () => {
    const responseData = { id: 1, title: 'Book' }
    mockApi.get.mockResolvedValueOnce({ data: responseData })

    const result = await BooksService.getById(1)

    expect(result).toEqual(responseData)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/library/books/1')
  })

  it('update puts payload to book endpoint', async () => {
    const payload = { title: 'Updated Title' }
    const responseData = { id: 1, ...payload }
    mockApi.put.mockResolvedValueOnce({ data: responseData })

    const result = await BooksService.update(1, payload)

    expect(result).toEqual(responseData)
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/library/books/1', payload)
  })

  it('remove deletes book by id', async () => {
    mockApi.delete.mockResolvedValueOnce({ status: 204 })

    const result = await BooksService.remove(1)

    expect(result).toBe(true)
    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/library/books/1')
  })
})
