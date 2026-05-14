/**
 * profileService.js — Capa de red: perfil técnico (y delegación a routinesService).
 *
 * Endpoints consumidos (Backend Negocio — NestJS/PostgreSQL):
 *
 *   GET  /users/:userId/profile                → perfil técnico paginado
 *
 * **Migración F12-T6 (2026-05-14):** las funciones de rutinas y attempts se
 * extrajeron a `routinesService.js` (con doble rama MOCK/real). Los re-exports
 * de abajo mantienen back-compat con `WeaknessActionCard` y `ChallengeBlock`,
 * que pueden seguir importando desde `profileService`. Nuevos componentes
 * deberían importar directamente desde `./routinesService`.
 *
 * Patrón idéntico al de chatService.js / userService.js:
 *   - Token JWT desde localStorage['archia.accessToken']
 *   - Respuestas normalizadas: json?.data ?? json
 *   - Errores como Error con mensaje legible
 */

import { API_BASE, apiRequest as request } from './http'
import {
  listRoutines       as _listRoutines,
  getRoutine         as _getRoutine,
  submitAttempt      as _submitAttempt,
  evaluateAttempt    as _evaluateAttempt,
} from './routinesService'

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

function _isMockMode() {
  try { return import.meta.env.VITE_USE_MOCKS === 'true' } catch { return true }
}

/**
 * Solicita la generación de un reto. En modalidad MOCK (F12-T6) devuelve un
 * reto pendiente existente de los fixtures cuyo `targetWeakness` coincida
 * (o el primero disponible). En modo real (F12-T5 pendiente) llama al
 * endpoint `POST /routines/generate`.
 *
 * @param {{ userId: string, targetWeakness?: string }} params
 * @returns {Promise<object | null>}
 */
export async function generateRoutine({ userId, targetWeakness } = {}) {
  if (_isMockMode()) {
    const list = await _listRoutines(userId, { limit: 50 })
    if (targetWeakness) {
      const exact = list.find(
        (r) => r.targetWeakness === targetWeakness && (!r.attempts || r.attempts.length === 0),
      )
      if (exact) return exact
    }
    const pending = list.find((r) => !r.attempts || r.attempts.length === 0)
    return pending || list[0] || null
  }
  const body = { userId }
  if (targetWeakness) body.targetWeakness = targetWeakness
  return request(`${API_BASE}/routines/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/* ================================================================
   Delegación a routinesService.js (F12-T6)

   Los componentes existentes (`WeaknessActionCard`, `ChallengeBlock`) siguen
   funcionando sin cambios de import. Nuevos componentes deberían importar
   directamente desde `./routinesService`.
================================================================ */

/** @deprecated Importá desde `./routinesService` directamente en código nuevo. */
export const listRoutines    = _listRoutines

/** @deprecated Importá desde `./routinesService` directamente en código nuevo. */
export const getRoutine      = _getRoutine

/**
 * Registra un intento para un reto.
 *
 * Pre-F12: `submitAttempt(routineId, { status })` enviaba SOLO el status
 * y descartaba el texto del usuario — el bucle pedagógico quedaba abierto.
 * Post-F12: el segundo parámetro acepta `userResponseText`. Mantenemos
 * `status` ignorado por compatibilidad con callsites legacy (será undef).
 */
export async function submitAttempt(routineId, body = {}) {
  // Compatibilidad: el callsite legacy de ChallengeBlock manda { status: 'completed' }.
  // El nuevo flujo manda { userResponseText: '...' }. Ambos shapes son aceptados.
  return _submitAttempt(routineId, body)
}

/** @deprecated Importá `evaluateAttempt` desde `./routinesService` directamente. */
export const updateAttempt   = _evaluateAttempt
