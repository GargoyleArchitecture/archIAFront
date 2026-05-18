// @vitest-environment jsdom
/**
 * F15-T1 / F15-T2: contrato de body de los endpoints de attempts.
 *
 * - `submitAttempt` (POST /routines/:id/attempts) liga CreateRoutineAttemptDto:
 *   SOLO `status`. Nunca debe POSTear `userResponseText` (→ 400
 *   forbidNonWhitelisted contra el backend real).
 * - `evaluateAttempt` (POST /routine-attempts/:id/evaluate) liga
 *   EvaluateRoutineAttemptDto: `userResponseText` (requerido) + `reflection?`.
 */
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'

const mockApiRequest = vi.fn()
vi.mock('./http', () => ({
  API_BASE: '/api/v1',
  apiRequest: (...args) => mockApiRequest(...args),
}))

import { submitAttempt, evaluateAttempt } from './routinesService'

function lastCall() {
  const calls = mockApiRequest.mock.calls
  return calls[calls.length - 1]
}
function lastBody() {
  const [, opts] = lastCall()
  return JSON.parse(opts.body)
}

beforeEach(() => {
  mockApiRequest.mockReset()
  mockApiRequest.mockResolvedValue({ id: 'a1' })
  vi.stubEnv('VITE_USE_MOCKS', 'false') // forzar rama real
})
afterEach(() => {
  vi.unstubAllEnvs()
})

describe('routinesService.submitAttempt — solo status (F15-T1)', () => {
  it('NO incluye userResponseText aunque el caller lo pase', async () => {
    await submitAttempt('r1', { userResponseText: 'mi respuesta', status: 'in_progress' })
    const [url, opts] = lastCall()
    expect(url).toBe('/api/v1/routines/r1/attempts')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body).toEqual({ status: 'in_progress' })
    expect('userResponseText' in body).toBe(false)
  })

  it('body vacío cuando no se pasa status (sin propiedades extra)', async () => {
    await submitAttempt('r1', { userResponseText: 'x' })
    expect(lastBody()).toEqual({})
  })
})

describe('routinesService.evaluateAttempt — userResponseText requerido (F15-T2)', () => {
  it('reenvía userResponseText al endpoint evaluate', async () => {
    await evaluateAttempt('att1', { userResponseText: 'mi respuesta' })
    const [url, opts] = lastCall()
    expect(url).toBe('/api/v1/routine-attempts/att1/evaluate')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ userResponseText: 'mi respuesta' })
  })

  it('reenvía userResponseText + reflection juntos (paso de reflexión)', async () => {
    await evaluateAttempt('att1', {
      userResponseText: 'mi respuesta',
      reflection: { difficultPart: 'a', wouldDoDifferently: 'b' },
    })
    expect(lastBody()).toEqual({
      userResponseText: 'mi respuesta',
      reflection: { difficultPart: 'a', wouldDoDifferently: 'b' },
    })
  })
})
