/**
 * Tests F11-T5: featuresService
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getMyFeatures, DEFAULT_FEATURES } from './featuresService'

beforeEach(() => {
  globalThis.fetch = vi.fn()
  try { localStorage.clear() } catch { /* noop */ }
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('getMyFeatures', () => {
  it('retorna defaults optimistas si no hay token en localStorage', async () => {
    const out = await getMyFeatures()
    expect(out).toEqual(DEFAULT_FEATURES)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('llama al endpoint y mapea los flags desde data.*', async () => {
    localStorage.setItem('archia.accessToken', 'tok')
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          enableTutorMode: false,
          enableProfileDashboard: true,
          enableRoutines: false,
        },
      }),
    })
    const out = await getMyFeatures()
    expect(out).toEqual({
      enableTutorMode: false,
      enableProfileDashboard: true,
      enableRoutines: false,
    })
  })

  it('mapea también cuando el body NO viene envuelto en {data}', async () => {
    localStorage.setItem('archia.accessToken', 'tok')
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        enableTutorMode: true,
        enableProfileDashboard: false,
        enableRoutines: true,
      }),
    })
    const out = await getMyFeatures()
    expect(out.enableProfileDashboard).toBe(false)
    expect(out.enableRoutines).toBe(true)
  })

  it('keys ausentes se tratan como true (optimista)', async () => {
    localStorage.setItem('archia.accessToken', 'tok')
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    })
    const out = await getMyFeatures()
    expect(out).toEqual(DEFAULT_FEATURES)
  })

  it('retorna defaults optimistas si el endpoint falla (5xx)', async () => {
    localStorage.setItem('archia.accessToken', 'tok')
    globalThis.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const out = await getMyFeatures()
    expect(out).toEqual(DEFAULT_FEATURES)
  })

  it('retorna defaults optimistas si fetch lanza', async () => {
    localStorage.setItem('archia.accessToken', 'tok')
    globalThis.fetch.mockRejectedValueOnce(new Error('network'))
    const out = await getMyFeatures()
    expect(out).toEqual(DEFAULT_FEATURES)
  })
})
