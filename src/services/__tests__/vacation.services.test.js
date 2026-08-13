import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../api', () => ({
  default: mockApi,
}))

import { VacationService } from '../vacation.services'

const ENDPOINT = '/api/v1/vacation'

describe('VacationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Períodos aquisitivos ---

  it('getMyAccrualPeriods gets my accrual periods', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    const result = await VacationService.getMyAccrualPeriods()
    expect(result).toEqual([])
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINT + '/accrual-periods')
  })

  it('getUserAccrualPeriods gets accrual periods of a user', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.getUserAccrualPeriods(42)
    expect(mockApi.get).toHaveBeenCalledWith(`${ENDPOINT}/accrual-periods/42`)
  })

  it('getUserAccrualPeriod gets a single accrual period', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 7 } })
    const result = await VacationService.getUserAccrualPeriod(42, 7)
    expect(result).toEqual({ id: 7 })
    expect(mockApi.get).toHaveBeenCalledWith(`${ENDPOINT}/accrual-periods/42/7`)
  })

  it('sellDays posts days to sell endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { days_sold: 10 } })
    const result = await VacationService.sellDays(42, 7, 10)
    expect(result).toEqual({ days_sold: 10 })
    expect(mockApi.post).toHaveBeenCalledWith(
      `${ENDPOINT}/accrual-periods/42/7/sell`,
      { days: 10 },
    )
  })

  it('createGrant posts payload to grants endpoint', async () => {
    const payload = {
      start_date: '2023-05-01',
      end_date: '2023-05-05',
      grant_type: 'retroactive',
      notes: 'Gozo atrasado',
    }
    const responseData = { id: 9, ...payload }
    mockApi.post.mockResolvedValueOnce({ data: responseData })
    const result = await VacationService.createGrant(42, 7, payload)
    expect(result).toEqual(responseData)
    expect(mockApi.post).toHaveBeenCalledWith(
      `${ENDPOINT}/accrual-periods/42/7/grants`,
      payload,
    )
  })

  // --- Solicitações ---

  it('createRequest posts payload to requests endpoint', async () => {
    const payload = {
      target_accrual_period_id: 7,
      periods: [{ start_date: '2025-06-12', end_date: '2025-06-25' }],
    }
    mockApi.post.mockResolvedValueOnce({ data: { id: 1, ...payload } })
    const result = await VacationService.createRequest(payload)
    expect(result).toEqual({ id: 1, ...payload })
    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINT + '/requests', payload)
  })

  it('listRequests sends query params', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.listRequests({ status: 'submitted', user_id: 9 })
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINT + '/requests', {
      params: { status: 'submitted', user_id: 9 },
    })
  })

  it('listRequests uses empty params by default', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.listRequests()
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINT + '/requests', {
      params: {},
    })
  })

  it('listRequestsBySector hits by-sector endpoint', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.listRequestsBySector('registro', {
      subsetor: 'Análise',
    })
    expect(mockApi.get).toHaveBeenCalledWith(
      `${ENDPOINT}/requests/by-sector/registro`,
      { params: { subsetor: 'Análise' } },
    )
  })

  it('getRequest gets request by id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 3 } })
    const result = await VacationService.getRequest(3)
    expect(result).toEqual({ id: 3 })
    expect(mockApi.get).toHaveBeenCalledWith(`${ENDPOINT}/requests/3`)
  })

  it('approveRequest posts notes to approve endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'approved' } })
    const result = await VacationService.approveRequest(3, {
      reviewer_notes: 'Ok',
    })
    expect(result).toEqual({ status: 'approved' })
    expect(mockApi.post).toHaveBeenCalledWith(
      `${ENDPOINT}/requests/3/approve`,
      { reviewer_notes: 'Ok' },
    )
  })

  it('rejectRequest posts notes to reject endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'rejected' } })
    await VacationService.rejectRequest(3, { reviewer_notes: 'Sem saldo' })
    expect(mockApi.post).toHaveBeenCalledWith(`${ENDPOINT}/requests/3/reject`, {
      reviewer_notes: 'Sem saldo',
    })
  })

  it('cancelRequest posts to cancel endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'cancelled' } })
    const result = await VacationService.cancelRequest(3)
    expect(result).toEqual({ status: 'cancelled' })
    expect(mockApi.post).toHaveBeenCalledWith(`${ENDPOINT}/requests/3/cancel`)
  })

  // --- Concessões ---

  it('listGrants sends params by default', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.listGrants({ status: 'granted' })
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINT + '/grants', {
      params: { status: 'granted' },
    })
  })

  it('listGrantsBySector hits by-sector endpoint', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await VacationService.listGrantsBySector('oficial', {})
    expect(mockApi.get).toHaveBeenCalledWith(
      `${ENDPOINT}/grants/by-sector/oficial`,
      { params: {} },
    )
  })

  it('getGrant gets grant by id', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 5 } })
    const result = await VacationService.getGrant(5)
    expect(result).toEqual({ id: 5 })
    expect(mockApi.get).toHaveBeenCalledWith(`${ENDPOINT}/grants/5`)
  })

  it('confirmFruition posts confirm payload', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'fruited' } })
    const result = await VacationService.confirmFruition(5, { confirm: true })
    expect(result).toEqual({ status: 'fruited' })
    expect(mockApi.post).toHaveBeenCalledWith(
      `${ENDPOINT}/grants/5/confirm-fruition`,
      { confirm: true },
    )
  })

  // --- Preview e alertas ---

  it('preview posts payload to preview endpoint', async () => {
    const payload = {
      target_accrual_period_id: 7,
      periods: [{ start_date: '2025-06-12', end_date: '2025-06-25' }],
    }
    mockApi.post.mockResolvedValueOnce({
      data: { valid: true, errors: [], warnings: [], total_days: 14 },
    })
    const result = await VacationService.preview(payload)
    expect(result.valid).toBe(true)
    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINT + '/preview', payload)
  })

  it('getAlerts gets alerts', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    const result = await VacationService.getAlerts()
    expect(result).toEqual([])
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINT + '/alerts')
  })
})
