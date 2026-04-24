/**
 * preferenceService.js — Capa de red: preferencias del usuario
 *
 * Gestiona el endpoint UserPreference del Backend API.
 * El token se lee de localStorage (mismo patrón que authService).
 */

const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1'

function getToken() {
  return localStorage.getItem('archia.accessToken') || ''
}

async function request(url, { headers = {}, ...rest } = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...headers,
    },
    ...rest,
  })
  const json = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null
  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`)
  }
  return json?.data ?? json
}

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
