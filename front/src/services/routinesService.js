/**
 * F12-T6 — routinesService: Capa de datos del Frontend para el ciclo
 * pedagógico completo (enunciado → intento → evaluación → solución → reflexión).
 *
 * Modalidad de ejecución acordada (Tracking_Maestro Fase 12, 2026-05-14):
 *   - Mientras F12-T3/T4/T5 (Backend) están pausados, este módulo opera en
 *     MOCK MODE: lee fixtures de `routinesMockData.js` y persiste la sesión
 *     en `localStorage`. Esto permite validar la UX completa sin coste de
 *     LLM ni dependencia de Negocio.
 *   - Cuando Backend reanude, basta con `VITE_USE_MOCKS=false`. La rama
 *     `_real()` se activa y consume las APIs reales (mismo shape de respuesta).
 *
 * Decisiones de diseño:
 *   1. Cada función tiene dos ramas claramente separadas (`if (MOCK_MODE)`).
 *   2. La evaluación mock es DETERMINISTA: dado el mismo `attemptId`, devuelve
 *      el mismo feedback. Esto permite tests reproducibles y demos consistentes.
 *   3. Los attempts creados en sesión se guardan en `localStorage` bajo la
 *      key `archia.routines.mock.v1` para sobrevivir refresh.
 */

import { API_BASE, apiRequest } from './http'
import { cloneInitialMockState, FIXTURE_USER_ID } from './routinesMockData'

/* ============================================================
   Configuración
============================================================ */

const STORAGE_KEY = 'archia.routines.mock.v1'
const MOCK_LATENCY_MS = 250

/**
 * Lectura del flag de mocks en cada llamada (no en el top-level)
 * para que los tests con `vi.stubEnv` puedan flipearlo dinámicamente.
 */
function _isMockMode() {
  try {
    return import.meta.env.VITE_USE_MOCKS === 'true'
  } catch {
    // En tests SSR-like donde `import.meta.env` no exista, default a true.
    return true
  }
}

function _delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ============================================================
   Persistencia local (MOCK only)
============================================================ */

function _loadMockState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneInitialMockState()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return cloneInitialMockState()
    return parsed
  } catch {
    return cloneInitialMockState()
  }
}

function _persistMockState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable */
  }
}

/**
 * Test-only: resetea el state mock a los fixtures iniciales.
 * No exportada por nombre amigable para evitar uso accidental en producción.
 */
export function __resetMockStateForTests() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* noop */ }
}

/* ============================================================
   Helpers puros (compartidos por UI y servicios)
============================================================ */

/**
 * Deriva el status lógico del reto a partir del attempt más reciente.
 * Convención alineada con la decisión arquitectónica de F4-T6 (Negocio):
 * el status no se duplica en la columna `routines.status`; se calcula
 * del `routine_attempts` más nuevo.
 *
 * @param {object} routine
 * @returns {'pending' | 'in_progress' | 'completed' | 'abandoned'}
 */
export function derivedStatus(routine) {
  if (!routine || !Array.isArray(routine.attempts) || routine.attempts.length === 0) {
    return 'pending'
  }
  const sorted = [...routine.attempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return sorted[0].status || 'pending'
}

/**
 * Microcopy compacto para tarjetas del listado.
 *
 * @param {object} routine
 * @returns {string}
 */
export function summarizeFeedback(routine) {
  if (!routine || !Array.isArray(routine.attempts) || routine.attempts.length === 0) {
    return 'Sin intentos'
  }
  // Tomamos el attempt evaluado más reciente.
  const evaluated = [...routine.attempts]
    .filter((a) => a && a.evaluatedAt && a.feedbackJson)
    .sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime())
  if (evaluated.length === 0) {
    return 'Intento sin evaluar'
  }
  const score = Math.round(Number(evaluated[0].feedbackJson?.score ?? evaluated[0].score ?? 0))
  return `Evaluado · ${score}/100`
}

/* ============================================================
   Mock evaluation engine (deterministic)
============================================================ */

/**
 * Hash estable simple para distribuir met/partial/missing por (attemptId, concept).
 * Determinismo + reproducibilidad sin coste de LLM.
 */
function _stableHash(str) {
  let h = 0
  const s = String(str ?? '')
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const STATUS_DISTRIBUTION = ['met', 'met', 'met', 'partial', 'partial', 'missing']

function _statusForCriterion(attemptId, concept) {
  const idx = _stableHash(`${attemptId}:${concept}`) % STATUS_DISTRIBUTION.length
  return STATUS_DISTRIBUTION[idx]
}

const STATUS_WEIGHT_FACTOR = { met: 1, partial: 0.5, missing: 0 }

function _commentForCriterion(criterion, status) {
  const map = {
    met: `Cumplido. ${criterion.description}`,
    partial:
      'Parcial: hay una aproximación, pero falta refinamiento para cubrir el criterio por completo.',
    missing: 'No se observa evidencia de este aspecto en la respuesta enviada.',
  }
  return map[status] || ''
}

function _generateMockFeedback(attemptId, rubric) {
  const criteria = (Array.isArray(rubric) ? rubric : []).map((c) => {
    const status = _statusForCriterion(attemptId, c.concept)
    return {
      concept: c.concept,
      status,
      comment: _commentForCriterion(c, status),
    }
  })
  // Score ponderado por weight × factor
  const totalWeight = (rubric || []).reduce((acc, c) => acc + (c.weight || 1), 0) || 1
  const weighted = criteria.reduce((acc, r, i) => {
    const w = (rubric[i]?.weight) || 1
    return acc + STATUS_WEIGHT_FACTOR[r.status] * w
  }, 0)
  const score = Math.round((weighted / totalWeight) * 100)
  const strengths = criteria.filter((c) => c.status === 'met').map((c) => c.concept)
  const improvements = criteria
    .filter((c) => c.status !== 'met')
    .map((c) => c.concept)
  return {
    score,
    criteria,
    strengths: strengths.length ? strengths : ['Estructura general legible'],
    improvements: improvements.length ? improvements : ['Profundizar en el razonamiento detrás de cada decisión'],
    socratic_comment:
      score >= 80
        ? '¿Cómo cambiaría tu solución si los requisitos de carga se duplicaran?'
        : '¿Qué supuesto implícito hizo más difícil este ejercicio?',
  }
}

/* ============================================================
   API pública — modalidad MOCK + rama real
============================================================ */

/**
 * Lista los retos del usuario, opcionalmente filtrando por status derivado.
 *
 * @param {string} userId
 * @param {{ page?: number, limit?: number, status?: string }} options
 * @returns {Promise<Array<object>>}
 */
export async function listRoutines(userId, { page = 1, limit = 20, status } = {}) {
  if (_isMockMode()) {
    await _delay()
    const state = _loadMockState()
    const ofUser = state.filter((r) => r.userId === (userId || FIXTURE_USER_ID))
    const filtered = status
      ? ofUser.filter((r) => derivedStatus(r) === status)
      : ofUser
    const start = (page - 1) * limit
    return filtered.slice(start, start + limit)
  }
  return _realListRoutines(userId, { page, limit, status })
}

async function _realListRoutines(userId, { page, limit } = {}) {
  const qs = new URLSearchParams({ page, limit })
  const result = await apiRequest(`${API_BASE}/users/${userId}/routines?${qs.toString()}`)
  return Array.isArray(result) ? result : (result?.data ?? [])
}

/**
 * Detalle de un reto. En MOCK ocluye `solutionMd` cuando aún no hay attempt
 * evaluado, respetando la política anti-spoiler que F12-T5 aplicará real.
 *
 * @param {string} routineId
 * @returns {Promise<object | null>}
 */
export async function getRoutine(routineId) {
  if (_isMockMode()) {
    await _delay()
    const state = _loadMockState()
    const found = state.find((r) => r.id === routineId)
    if (!found) return null
    const hasEvaluatedAttempt =
      Array.isArray(found.attempts) &&
      found.attempts.some((a) => a && a.evaluatedAt && a.feedbackJson)
    return hasEvaluatedAttempt ? found : { ...found, solutionMd: null }
  }
  return apiRequest(`${API_BASE}/routines/${routineId}`)
}

/**
 * Crea un nuevo intento para un reto.
 * En MOCK: añade el attempt al state y retorna el attempt creado.
 *
 * F15-T1: el endpoint real `POST /routines/:id/attempts` liga
 * `CreateRoutineAttemptDto`, que SOLO admite `status`. El texto del alumno
 * (`userResponseText`) NO pertenece a este paso — va al endpoint
 * `POST /routine-attempts/:id/evaluate` (ver `evaluateAttempt`).
 *
 * @param {string} routineId
 * @param {{ status?: 'pending'|'in_progress'|'completed'|'abandoned' }} body
 * @returns {Promise<object>}
 */
export async function submitAttempt(routineId, body = {}) {
  if (_isMockMode()) {
    await _delay()
    const state = _loadMockState()
    const idx = state.findIndex((r) => r.id === routineId)
    if (idx < 0) {
      const err = new Error('Routine not found')
      err.status = 404
      throw err
    }
    const routine = state[idx]
    const attempt = {
      id: `a-${routineId}-${Date.now()}`,
      routineId,
      userId: routine.userId,
      status: 'in_progress',
      score: null,
      feedbackJson: null,
      userResponseText: body.userResponseText ?? null,
      reflectionJson: null,
      evaluatedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    }
    routine.attempts = [...(routine.attempts || []), attempt]
    state[idx] = routine
    _persistMockState(state)
    return attempt
  }
  // F15-T1: whitelist defensivo — solo `status` (lo único que acepta
  // CreateRoutineAttemptDto). Un `userResponseText` accidental de cualquier
  // caller dispararía 400 forbidNonWhitelisted contra el backend real.
  const safeBody = {}
  if (body && body.status !== undefined) safeBody.status = body.status
  return apiRequest(`${API_BASE}/routines/${routineId}/attempts`, {
    method: 'POST',
    body: JSON.stringify(safeBody),
  })
}

/**
 * Evalúa un intento: genera feedback determinista contra la rúbrica del reto
 * y opcionalmente persiste la reflexión metacognitiva.
 *
 * @param {string} attemptId
 * @param {{
 *   userResponseText?: string,
 *   reflection?: { difficultPart: string, wouldDoDifferently: string }
 * }} body
 * @returns {Promise<object>}  El attempt actualizado.
 */
export async function evaluateAttempt(attemptId, body = {}) {
  if (_isMockMode()) {
    await _delay()
    const state = _loadMockState()
    let parentRoutine = null
    let attempt = null
    for (const r of state) {
      const a = (r.attempts || []).find((x) => x.id === attemptId)
      if (a) {
        parentRoutine = r
        attempt = a
        break
      }
    }
    if (!attempt) {
      const err = new Error('Attempt not found')
      err.status = 404
      throw err
    }
    if (body.userResponseText !== undefined && body.userResponseText !== null) {
      attempt.userResponseText = String(body.userResponseText)
    }
    if (!attempt.feedbackJson) {
      // Solo evaluamos la primera vez. Llamadas posteriores con reflection
      // reusan el feedback previo (idempotencia).
      const feedback = _generateMockFeedback(attempt.id, parentRoutine?.rubricJson || [])
      attempt.feedbackJson = feedback
      attempt.score = feedback.score.toFixed(2)
      attempt.evaluatedAt = new Date().toISOString()
      attempt.status = 'in_progress'
    }
    if (body.reflection && typeof body.reflection === 'object') {
      attempt.reflectionJson = {
        difficultPart: String(body.reflection.difficultPart || ''),
        wouldDoDifferently: String(body.reflection.wouldDoDifferently || ''),
      }
      attempt.status = 'completed'
      attempt.completedAt = new Date().toISOString()
    }
    _persistMockState(state)
    return attempt
  }
  return apiRequest(`${API_BASE}/routine-attempts/${attemptId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/* ============================================================
   Re-exports
============================================================ */

export { FIXTURE_USER_ID }
