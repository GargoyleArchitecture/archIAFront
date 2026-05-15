/**
 * Tests F12-T6 (modalidad MOCK): capa de datos del Frontend.
 *
 * Cobertura:
 *  - listRoutines: paginación + filtrado por status derivado.
 *  - getRoutine: oculta solutionMd hasta primer attempt evaluado.
 *  - submitAttempt: añade attempt en localStorage y sobrevive a recargas.
 *  - evaluateAttempt: produce feedback determinista, idempotente con
 *    reflection separada del scoring inicial.
 *  - Helpers puros: summarizeFeedback / derivedStatus.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'true')
  try { localStorage.clear() } catch { /* noop */ }
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

async function importService() {
  return await import('../routinesService')
}

describe('routinesService (MOCK) — listRoutines', () => {
  it('lista todos los retos del usuario (limit 20 por defecto)', async () => {
    const svc = await importService()
    const list = await svc.listRoutines(svc.FIXTURE_USER_ID)
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list.every((r) => r.userId === svc.FIXTURE_USER_ID)).toBe(true)
  })

  it('filtra por status derivado del attempt más reciente', async () => {
    const svc = await importService()
    const completed = await svc.listRoutines(svc.FIXTURE_USER_ID, { status: 'completed' })
    expect(completed.length).toBeGreaterThanOrEqual(1)
    expect(completed.every((r) => svc.derivedStatus(r) === 'completed')).toBe(true)

    const pending = await svc.listRoutines(svc.FIXTURE_USER_ID, { status: 'pending' })
    expect(pending.length).toBeGreaterThanOrEqual(1)
    expect(pending.every((r) => svc.derivedStatus(r) === 'pending')).toBe(true)
  })
})

describe('routinesService (MOCK) — getRoutine', () => {
  it('retorna el reto si existe', async () => {
    const svc = await importService()
    const r = await svc.getRoutine('r-002')
    expect(r).toBeTruthy()
    expect(r.id).toBe('r-002')
    expect(Array.isArray(r.rubricJson)).toBe(true)
  })

  it('retorna null si el reto no existe', async () => {
    const svc = await importService()
    const r = await svc.getRoutine('no-existe')
    expect(r).toBeNull()
  })

  it('oculta solutionMd cuando no hay attempts evaluados (anti-spoiler)', async () => {
    const svc = await importService()
    const r = await svc.getRoutine('r-001')
    expect(r.solutionMd).toBeNull()
  })

  it('expone solutionMd cuando ya existe un attempt evaluado', async () => {
    const svc = await importService()
    const r = await svc.getRoutine('r-002') // ya trae attempt evaluado en fixtures
    expect(typeof r.solutionMd).toBe('string')
    expect(r.solutionMd.length).toBeGreaterThan(20)
  })
})

describe('routinesService (MOCK) — submitAttempt', () => {
  it('crea un attempt nuevo con userResponseText y lo persiste', async () => {
    const svc = await importService()
    const attempt = await svc.submitAttempt('r-001', {
      userResponseText: 'def lru(): pass',
    })
    expect(attempt.routineId).toBe('r-001')
    expect(attempt.status).toBe('in_progress')
    expect(attempt.userResponseText).toBe('def lru(): pass')
    expect(attempt.evaluatedAt).toBeNull()

    // Verificamos persistencia: re-importando, el attempt debe seguir ahí.
    vi.resetModules()
    const svc2 = await importService()
    const r = await svc2.getRoutine('r-001')
    expect(r.attempts.find((a) => a.id === attempt.id)).toBeTruthy()
  })

  it('lanza si la rutina no existe', async () => {
    const svc = await importService()
    await expect(svc.submitAttempt('no-existe', { userResponseText: 'x' })).rejects.toThrow(/not found/i)
  })
})

describe('routinesService (MOCK) — evaluateAttempt', () => {
  it('genera feedback determinista con score en [0,100]', async () => {
    const svc = await importService()
    const created = await svc.submitAttempt('r-001', { userResponseText: 'intento 1' })
    const evaluated = await svc.evaluateAttempt(created.id, {})
    expect(evaluated.feedbackJson).toBeTruthy()
    expect(evaluated.feedbackJson.score).toBeGreaterThanOrEqual(0)
    expect(evaluated.feedbackJson.score).toBeLessThanOrEqual(100)
    expect(evaluated.evaluatedAt).toBeTruthy()
    // Cada criterio de la rúbrica tiene su CriterionResult.
    expect(evaluated.feedbackJson.criteria.length).toBe(3)
    for (const c of evaluated.feedbackJson.criteria) {
      expect(['met', 'partial', 'missing']).toContain(c.status)
    }
  })

  it('es determinista: misma evaluación produce el mismo score', async () => {
    const svc = await importService()
    const a1 = await svc.submitAttempt('r-001', { userResponseText: 'x' })
    const f1 = await svc.evaluateAttempt(a1.id, {})
    // Segunda llamada sin reflection: feedback NO cambia (idempotencia)
    const f2 = await svc.evaluateAttempt(a1.id, {})
    expect(f2.feedbackJson.score).toBe(f1.feedbackJson.score)
  })

  it('con reflection: marca status=completed y rellena completedAt', async () => {
    const svc = await importService()
    const created = await svc.submitAttempt('r-001', { userResponseText: 'mi intento' })
    const evaluated = await svc.evaluateAttempt(created.id, {
      reflection: {
        difficultPart: 'identificar el invariante',
        wouldDoDifferently: 'empezar por el test antes del code',
      },
    })
    expect(evaluated.status).toBe('completed')
    expect(evaluated.completedAt).toBeTruthy()
    expect(evaluated.reflectionJson.difficultPart).toContain('invariante')
  })

  it('lanza si el attempt no existe', async () => {
    const svc = await importService()
    await expect(svc.evaluateAttempt('a-nope', {})).rejects.toThrow(/not found/i)
  })
})

describe('routinesService (MOCK) — helpers puros', () => {
  it('derivedStatus: pending sin attempts', async () => {
    const svc = await importService()
    expect(svc.derivedStatus({ attempts: [] })).toBe('pending')
    expect(svc.derivedStatus({})).toBe('pending')
    expect(svc.derivedStatus(null)).toBe('pending')
  })

  it('derivedStatus: retorna el status del attempt más reciente', async () => {
    const svc = await importService()
    const routine = {
      attempts: [
        { status: 'abandoned', createdAt: '2026-01-01T00:00:00Z' },
        { status: 'completed', createdAt: '2026-05-01T00:00:00Z' },
        { status: 'in_progress', createdAt: '2026-03-01T00:00:00Z' },
      ],
    }
    expect(svc.derivedStatus(routine)).toBe('completed')
  })

  it('summarizeFeedback: Sin intentos / Intento sin evaluar / Evaluado · N/100', async () => {
    const svc = await importService()
    expect(svc.summarizeFeedback({ attempts: [] })).toBe('Sin intentos')

    const noEval = { attempts: [{ feedbackJson: null, evaluatedAt: null }] }
    expect(svc.summarizeFeedback(noEval)).toBe('Intento sin evaluar')

    const evaluated = {
      attempts: [{
        feedbackJson: { score: 78 },
        evaluatedAt: '2026-05-10T00:00:00Z',
      }],
    }
    expect(svc.summarizeFeedback(evaluated)).toBe('Evaluado · 78/100')
  })
})

describe('routinesService — rama real con VITE_USE_MOCKS=false', () => {
  it('listRoutines llama a fetch contra /users/:id/routines', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.resetModules()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ data: [{ id: 'r-x', userId: 'u-1', attempts: [] }] }),
    })
    globalThis.fetch = fetchMock
    const svc = await importService()
    const list = await svc.listRoutines('u-1', { page: 1, limit: 5 })
    expect(fetchMock).toHaveBeenCalled()
    const calledUrl = fetchMock.mock.calls[0][0]
    expect(calledUrl).toMatch(/\/users\/u-1\/routines\?/)
    expect(list[0].id).toBe('r-x')
  })

  it('evaluateAttempt llama a POST /routine-attempts/:id/evaluate', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false')
    vi.resetModules()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ data: { id: 'a-1', status: 'completed' } }),
    })
    globalThis.fetch = fetchMock
    const svc = await importService()
    const r = await svc.evaluateAttempt('a-1', {
      userResponseText: 'x',
      reflection: { difficultPart: 'a', wouldDoDifferently: 'b' },
    })
    expect(fetchMock).toHaveBeenCalled()
    const url = fetchMock.mock.calls[0][0]
    const opts = fetchMock.mock.calls[0][1]
    expect(url).toMatch(/\/routine-attempts\/a-1\/evaluate$/)
    expect(opts.method).toBe('POST')
    expect(r.id).toBe('a-1')
  })
})
