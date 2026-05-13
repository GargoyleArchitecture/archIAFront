/**
 * userService.js — Capa de red: preferencias del usuario
 *
 * Servicio canónico para las preferencias de comunicación del usuario
 * (explanationStyle + verbosity). Sigue el mismo patrón de request helper
 * que projectService.js — el token se lee de localStorage.
 */

import { authJson } from './authFetch'

const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1'

const request = (url, opts) => authJson(url, opts)

/* ================================================================
   PREFERENCIAS DEL USUARIO
================================================================ */

/**
 * GET /users/:userId/preferences
 * @param {string} userId
 * @returns {Promise<{ explanationStyle: string|null, verbosity: string|null }>}
 */
export async function getPreferences(userId) {
  return request(`${BASE}/users/${userId}/preferences`)
}

/**
 * PUT /users/:userId/preferences  (crea o actualiza)
 * @param {string} userId
 * @param {{ explanationStyle?: string|null, verbosity?: string|null }} params
 * @returns {Promise<object>}
 */
export async function upsertPreferences(userId, { explanationStyle, verbosity }) {
  return request(`${BASE}/users/${userId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify({ explanationStyle, verbosity }),
  })
}
