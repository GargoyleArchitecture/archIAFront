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

import { submitAttempt, evaluateAttempt, derivedStatus, summarizeFeedback } from './routinesService'

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

/* ─────────────── F21-T1: derivedStatus prefiere status del server ─────────────── */

describe('routinesService.derivedStatus — prioriza routine.status (F21-T1)', () => {
  it('retorna routine.status cuando viene del listado (sin attempts hidratados)', () => {
    // Caso real del bug: findAllByUser retorna status top-level pero sin attempts.
    // Antes esta función ignoraba el status y caía a "pending".
    expect(derivedStatus({ status: 'completed' })).toBe('completed')
    expect(derivedStatus({ status: 'in_progress' })).toBe('in_progress')
    expect(derivedStatus({ status: 'abandoned' })).toBe('abandoned')
    expect(derivedStatus({ status: 'pending' })).toBe('pending')
  })

  it('prefiere routine.status sobre el cálculo basado en attempts', () => {
    // Si el server dice completed pero el array attempts (legacy) dice
    // in_progress, gana el server. Esto evita falsos positivos por attempts
    // desactualizados en caches del cliente.
    const routine = {
      status: 'completed',
      attempts: [{ status: 'in_progress', createdAt: '2026-01-01T00:00:00Z' }],
    }
    expect(derivedStatus(routine)).toBe('completed')
  })

  it('cae al cálculo basado en attempts cuando routine.status no está (caso detalle)', () => {
    const routine = {
      attempts: [
        { status: 'in_progress', createdAt: '2026-01-01T00:00:00Z' },
        { status: 'completed',   createdAt: '2026-01-05T00:00:00Z' },
      ],
    }
    expect(derivedStatus(routine)).toBe('completed')
  })

  it('retorna "pending" cuando no hay routine.status ni attempts', () => {
    expect(derivedStatus({})).toBe('pending')
    expect(derivedStatus({ attempts: [] })).toBe('pending')
    expect(derivedStatus(null)).toBe('pending')
  })

  it('ignora valores de status no válidos y cae al fallback de attempts', () => {
    // Defensa contra basura: si el server alguna vez envía un status que no
    // es del enum, no romper la UI — caer al fallback.
    const routine = {
      status: 'GARBAGE',
      attempts: [{ status: 'completed', createdAt: '2026-01-01T00:00:00Z' }],
    }
    expect(derivedStatus(routine)).toBe('completed')
  })
})

describe('routinesService.summarizeFeedback — usa attemptsCount en el listado (F21-T1)', () => {
  it('muestra "Sin intentos" cuando no hay attempts ni attemptsCount', () => {
    expect(summarizeFeedback({ attempts: [] })).toBe('Sin intentos')
    expect(summarizeFeedback({})).toBe('Sin intentos')
  })

  it('usa attemptsCount cuando viene del listado (sin attempts hidratados)', () => {
    expect(summarizeFeedback({ attemptsCount: 1 })).toBe('1 intento · feedback en el detalle')
    expect(summarizeFeedback({ attemptsCount: 3 })).toBe('3 intentos · feedback en el detalle')
  })

  it('prefiere attempts cuando están hidratados (caso detalle)', () => {
    const routine = {
      attemptsCount: 99, // ignorado porque attempts está hidratado.
      attempts: [
        {
          status: 'completed',
          evaluatedAt: '2026-01-05T00:00:00Z',
          feedbackJson: { score: 85 },
        },
      ],
    }
    expect(summarizeFeedback(routine)).toBe('Evaluado · 85/100')
  })

  it('muestra "Intento sin evaluar" cuando hay attempts pero ninguno evaluado', () => {
    const routine = {
      attempts: [
        { status: 'in_progress', evaluatedAt: null, feedbackJson: null },
      ],
    }
    expect(summarizeFeedback(routine)).toBe('Intento sin evaluar')
  })
})
