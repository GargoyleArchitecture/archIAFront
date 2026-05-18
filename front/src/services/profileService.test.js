// @vitest-environment jsdom
/**
 * F14-T1: getUserProfile normaliza mastery de la escala de contrato 0-100
 * a la convención interna 0-1 que esperan todos los consumidores del FE.
 * `decayRate` NO se reescala. Backend/contrato sin cambios.
 */
import { describe, it, beforeEach, expect, vi } from 'vitest'

const mockRequest = vi.fn()
vi.mock('./http', () => ({
  API_BASE: '/api/v1',
  apiRequest: (...args) => mockRequest(...args),
}))
// profileService importa de ./routinesService a nivel de módulo; lo stubeamos.
vi.mock('./routinesService', () => ({
  listRoutines: vi.fn(),
  getRoutine: vi.fn(),
  submitAttempt: vi.fn(),
  evaluateAttempt: vi.fn(),
}))

import { getUserProfile } from './profileService'

beforeEach(() => {
  mockRequest.mockReset()
})

describe('profileService.getUserProfile — normalización de mastery (F14-T1)', () => {
  it('convierte mastery 0-100 → 0-1 y deja decayRate intacto', async () => {
    mockRequest.mockResolvedValue({
      userId: 'u1',
      strengths: ['SOLID'],
      weaknesses: ['Caching'],
      evaluatedConcepts: [
        { name: 'SOLID', mastery: 85, decayRate: 0.05, lastSeenAt: '2026-05-01T10:00:00Z' },
        { name: 'Caching', mastery: 20, decayRate: 0.07, lastSeenAt: '2026-04-15T10:00:00Z' },
      ],
      updatedAt: '2026-05-01T10:00:00Z',
    })
    const p = await getUserProfile('u1')
    expect(p.evaluatedConcepts[0].mastery).toBeCloseTo(0.85, 5)
    expect(p.evaluatedConcepts[1].mastery).toBeCloseTo(0.2, 5)
    // decayRate NO se reescala (es ~0.05, no porcentaje)
    expect(p.evaluatedConcepts[0].decayRate).toBe(0.05)
    expect(p.evaluatedConcepts[1].decayRate).toBe(0.07)
    // resto del payload intacto
    expect(p.strengths).toEqual(['SOLID'])
    expect(p.weaknesses).toEqual(['Caching'])
    expect(p.userId).toBe('u1')
  })

  it('clampa valores fuera de rango a [0,1]', async () => {
    mockRequest.mockResolvedValue({
      evaluatedConcepts: [
        { name: 'A', mastery: 150 },
        { name: 'B', mastery: -10 },
        { name: 'C', mastery: 100 },
        { name: 'D', mastery: 0 },
      ],
    })
    const p = await getUserProfile('u1')
    expect(p.evaluatedConcepts[0].mastery).toBe(1)
    expect(p.evaluatedConcepts[1].mastery).toBe(0)
    expect(p.evaluatedConcepts[2].mastery).toBe(1)
    expect(p.evaluatedConcepts[3].mastery).toBe(0)
  })

  it('mastery no numérico se pasa tal cual (los componentes ya lo guardan)', async () => {
    mockRequest.mockResolvedValue({
      evaluatedConcepts: [
        { name: 'A', mastery: null },
        { name: 'B' },
        { name: 'C', mastery: 'NaNish' },
      ],
    })
    const p = await getUserProfile('u1')
    expect(p.evaluatedConcepts[0].mastery).toBeNull()
    expect(p.evaluatedConcepts[1].mastery).toBeUndefined()
    expect(p.evaluatedConcepts[2].mastery).toBe('NaNish')
  })

  it('no rompe si evaluatedConcepts falta o no es array', async () => {
    mockRequest.mockResolvedValue({ userId: 'u1', strengths: [], weaknesses: [] })
    const p = await getUserProfile('u1')
    expect(p.userId).toBe('u1')
    expect(p.evaluatedConcepts).toBeUndefined()
  })

  it('propaga la query de paginación al endpoint correcto', async () => {
    mockRequest.mockResolvedValue({ evaluatedConcepts: [] })
    await getUserProfile('u1', { page: 2, pageSize: 10 })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/users/u1/profile?page=2&pageSize=10')
  })
})
