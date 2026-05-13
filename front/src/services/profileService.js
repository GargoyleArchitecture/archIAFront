/**
 * profileService.js — Capa de red: perfil técnico y rutinas de usuario
 *
 * Endpoints consumidos (Backend Negocio — NestJS/PostgreSQL):
 *
 *   GET  /users/:userId/profile                → perfil técnico paginado
 *   POST /routines/generate                    → genera y persiste un reto via IA
 *   GET  /users/:userId/routines               → lista retos del usuario (paginado)
 *   GET  /routines/:routineId                  → detalle de un reto
 *   POST /routines/:routineId/attempts         → registra un intento
 *   PATCH /routine-attempts/:attemptId         → actualiza un intento (score, status)
 *
 * Patrón idéntico al de chatService.js / userService.js:
 *   - Token JWT desde localStorage['archia.accessToken']
 *   - Respuestas normalizadas: json?.data ?? json
 *   - Errores como Error con mensaje legible
 */

import { API_BASE, apiRequest as request } from './http'

/* ================================================================
   PERFIL TÉCNICO
================================================================ */

/**
 * Devuelve el perfil técnico del usuario con sus conceptos evaluados.
 * La paginación aplica sobre `evaluatedConcepts` cuando supera pageSize.
 *
 * @param {string} userId
 * @param {{ page?: number, pageSize?: number }} options
 * @returns {Promise<{
 *   userId:            string,
 *   strengths:         string[],
 *   weaknesses:        string[],
 *   evaluatedConcepts: Array<{ name: string, mastery: number, decayRate: number, lastSeenAt: string }>,
 *   evaluatedConceptsMeta?: { total: number, page: number, pageSize: number, totalPages: number },
 *   updatedAt:         string,
 * }>}
 */
export async function getUserProfile(userId, { page = 1, pageSize = 50 } = {}) {
  const query = new URLSearchParams({ page, pageSize })
  return request(`${API_BASE}/users/${userId}/profile?${query.toString()}`)
}

/* ================================================================
   RUTINAS (RETOS PERSONALIZADOS)
================================================================ */

/**
 * Solicita la generación de un reto al Backend IA y lo persiste en Negocio.
 * Si `targetWeakness` se omite, Negocio elige la debilidad de menor mastery.
 *
 * @param {{ userId: string, targetWeakness?: string }} params
 * @returns {Promise<{
 *   id:               string,
 *   userId:           string,
 *   title:            string,
 *   targetWeakness:   string,
 *   inverseRagSnippet: string,
 *   expectedConcepts: string[],
 *   difficulty:       number,
 *   status:           'pending' | 'in_progress' | 'completed' | 'abandoned',
 *   createdAt:        string,
 * }>}
 */
export async function generateRoutine({ userId, targetWeakness } = {}) {
  const body = { userId }
  if (targetWeakness) body.targetWeakness = targetWeakness
  return request(`${API_BASE}/routines/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Lista los retos de un usuario con paginación.
 *
 * @param {string} userId
 * @param {{ page?: number, limit?: number }} options
 * @returns {Promise<Array<object>>}
 */
export async function listRoutines(userId, { page = 1, limit = 20 } = {}) {
  const query = new URLSearchParams({ page, limit })
  const result = await request(`${API_BASE}/users/${userId}/routines?${query.toString()}`)
  return Array.isArray(result) ? result : (result?.data ?? [])
}

/**
 * Devuelve el detalle de un reto por su ID.
 *
 * @param {string} routineId
 * @returns {Promise<object>}
 */
export async function getRoutine(routineId) {
  return request(`${API_BASE}/routines/${routineId}`)
}

/* ================================================================
   INTENTOS DE RUTINA
================================================================ */

/**
 * Registra un nuevo intento para un reto.
 * `status` por defecto es `in_progress` (el usuario comenzó).
 *
 * @param {string} routineId
 * @param {{ status?: 'pending' | 'in_progress' | 'completed' | 'abandoned' }} params
 * @returns {Promise<object>} Intento creado
 */
export async function submitAttempt(routineId, { status = 'in_progress' } = {}) {
  return request(`${API_BASE}/routines/${routineId}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

/**
 * Actualiza un intento existente (marca como completado, añade score/feedback).
 * `completedAt` se rellena automáticamente en Negocio cuando status pasa a 'completed'.
 *
 * @param {string} attemptId
 * @param {{
 *   status?:   'pending' | 'in_progress' | 'completed' | 'abandoned',
 *   score?:    number,
 *   feedback?: object,
 * }} params
 * @returns {Promise<object>} Intento actualizado
 */
export async function updateAttempt(attemptId, { status, score, feedback } = {}) {
  const body = {}
  if (status   !== undefined) body.status   = status
  if (score    !== undefined) body.score    = score
  if (feedback !== undefined) body.feedback = feedback
  return request(`${API_BASE}/routine-attempts/${attemptId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
