/**
 * http.js — Capa HTTP centralizada para el Backend de Negocio (NestJS).
 *
 * Responsabilidades:
 *   1. Una única fuente de `API_BASE`.
 *   2. Lectura/escritura/limpieza de tokens en localStorage.
 *   3. `refreshAccessToken()` con singleton in-flight: múltiples llamadas
 *      concurrentes comparten la misma petición a `/auth/refresh`.
 *   4. `authorizedFetch()` que reintenta una vez tras refrescar si recibió 401.
 *   5. `apiRequest()` — wrapper JSON que devuelve `json?.data ?? json` y lanza
 *      Error con `.status` en respuestas no-OK.
 *
 * Cuando el refresh falla, se limpia el storage y se dispara el evento
 * `archia:auth:expired` en `window` para que la capa de UI reaccione (logout).
 */

const API_BASE_ENV = import.meta.env.VITE_API_BASE
export const API_BASE = API_BASE_ENV ? `${API_BASE_ENV}/api/v1` : '/api/v1'

export const STORAGE_KEYS = Object.freeze({
  ACCESS:  'archia.accessToken',
  REFRESH: 'archia.refreshToken',
  USER:    'archia.user',
})

export const AUTH_EXPIRED_EVENT = 'archia:auth:expired'

/* ─────────────────────────── Token storage ─────────────────────────── */

export function getAccessToken() {
  try { return localStorage.getItem(STORAGE_KEYS.ACCESS) || '' } catch { return '' }
}

export function getRefreshToken() {
  try { return localStorage.getItem(STORAGE_KEYS.REFRESH) || '' } catch { return '' }
}

export function setTokens({ accessToken, refreshToken } = {}) {
  try {
    if (accessToken)  localStorage.setItem(STORAGE_KEYS.ACCESS,  accessToken)
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken)
  } catch { /* storage unavailable */ }
}

export function clearTokens() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS)
    localStorage.removeItem(STORAGE_KEYS.REFRESH)
    localStorage.removeItem(STORAGE_KEYS.USER)
  } catch { /* storage unavailable */ }
}

/* ────────────────────── Refresh con singleton in-flight ────────────────────── */

let refreshInFlight = null

export function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight

  const stored = getRefreshToken()
  if (!stored) {
    return Promise.reject(new Error('No refresh token available'))
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${stored}`,
        },
      })
      const json = res.headers?.get?.('content-type')?.includes('application/json')
        ? await res.json()
        : null

      if (!res.ok) {
        const err = new Error(json?.message || `HTTP ${res.status}`)
        err.status = res.status
        throw err
      }

      const data = json?.data ?? json
      if (!data?.accessToken) {
        throw new Error('Refresh response missing accessToken')
      }

      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
      return data.accessToken
    } catch (err) {
      clearTokens()
      try {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: { reason: 'refresh-failed', status: err?.status },
        }))
      } catch { /* SSR / jsdom */ }
      throw err
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

/* ─────────────────────────── authorizedFetch ─────────────────────────── */

/**
 * Fetch con Bearer token automático y retry transparente ante 401.
 * NO añade `Content-Type` por defecto: respeta el body que envíe el caller
 * (útil para FormData / streaming). Use `apiRequest` cuando necesite JSON.
 */
export async function authorizedFetch(url, { headers = {}, _retry = false, ...rest } = {}) {
  const token = getAccessToken()
  const finalHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const res = await fetch(url, { headers: finalHeaders, ...rest })

  if (res.status === 401 && !_retry && getRefreshToken()) {
    try {
      await refreshAccessToken()
    } catch {
      return res
    }
    return authorizedFetch(url, { headers, _retry: true, ...rest })
  }

  return res
}

/* ────────────────────────────── apiRequest ────────────────────────────── */

/**
 * JSON request: añade `Content-Type: application/json`, parsea la respuesta y
 * desempaqueta `json?.data ?? json`. Lanza Error con `.status` si !res.ok.
 */
export async function apiRequest(url, { headers = {}, ...rest } = {}) {
  const res = await authorizedFetch(url, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  })

  // Intenta JSON: si el endpoint declara application/json (producción) o
  // si los mocks de test no exponen `headers` pero sí `.json()`.
  let json = null
  const contentType = res.headers?.get?.('content-type')
  const isJson = contentType ? contentType.includes('application/json') : (typeof res.json === 'function')
  if (isJson) {
    try { json = await res.json() } catch { json = null }
  }

  if (!res.ok) {
    const err = new Error(json?.message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  return json?.data ?? json
}
