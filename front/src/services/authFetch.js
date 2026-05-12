/**
 * authFetch.js — Centralized fetch wrapper with transparent 401 → refresh → retry.
 *
 * Two flavors:
 *   - authFetch(url, opts)  → returns the raw Response after 401-handling.
 *                             Use for streaming or binary responses (sendMessage,
 *                             fetchDiagramSvg).
 *   - authJson(url, opts)   → wraps authFetch, parses JSON, and unwraps the
 *                             `{ data }` envelope used by the NestJS
 *                             TransformInterceptor.
 *
 * Behavior:
 *   1. Injects `Authorization: Bearer <accessToken>` from localStorage.
 *   2. Injects `Content-Type: application/json` only when the body is a string
 *      (preserves FormData uploads).
 *   3. On 401, performs a single-flight refresh via authService.refreshToken,
 *      stores the new access token, and retries the original request ONCE.
 *   4. If refresh fails (or the retried request also returns 401), clears
 *      auth storage, dispatches `archia:auth-expired`, shows a toast, and
 *      throws AuthExpiredError. The AuthProvider clears `user`, so
 *      ProtectedRoute redirects to /login.
 */

import * as authService from './authService'
import { toast } from './toast'

const STORAGE_KEYS = {
  ACCESS:  'archia.accessToken',
  REFRESH: 'archia.refreshToken',
  USER:    'archia.user',
}

const AUTH_EXPIRED_EVENT = 'archia:auth-expired'

export class AuthExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message)
    this.name = 'AuthExpiredError'
  }
}

let refreshInFlight = null

function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS) || ''
}

function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.REFRESH) || ''
}

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS)
  localStorage.removeItem(STORAGE_KEYS.REFRESH)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

function expiredMessage() {
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'es'
  return lang.toLowerCase().startsWith('es')
    ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
    : 'Your session has expired. Please log in again.'
}

function notifyAuthExpired() {
  clearAuthStorage()
  toast.error(expiredMessage())
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
  }
}

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight

  const refresh = getRefreshToken()
  if (!refresh) {
    throw new AuthExpiredError('No refresh token available')
  }

  refreshInFlight = authService
    .refreshToken(refresh)
    .then((result) => {
      const newAccess = result?.accessToken
      if (!newAccess) throw new AuthExpiredError('Refresh response missing accessToken')
      localStorage.setItem(STORAGE_KEYS.ACCESS, newAccess)
      return newAccess
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

function buildHeaders(headers, token, body) {
  const out = { ...(headers || {}) }
  const bodyIsString = typeof body === 'string'
  if (bodyIsString && !out['Content-Type'] && !out['content-type']) {
    out['Content-Type'] = 'application/json'
  }
  if (token && !out.Authorization && !out.authorization) {
    out.Authorization = `Bearer ${token}`
  }
  return out
}

/**
 * Fetch with 401 → refresh → retry. Returns the raw Response.
 *
 * @param {string} url
 * @param {RequestInit & { skipAuth?: boolean }} [opts]
 * @returns {Promise<Response>}
 */
export async function authFetch(url, { headers, body, skipAuth = false, ...rest } = {}) {
  const token = skipAuth ? '' : getAccessToken()
  const init = { headers: buildHeaders(headers, token, body), body, ...rest }

  let res = await fetch(url, init)
  if (res.status !== 401 || skipAuth) return res

  let newAccess
  try {
    newAccess = await refreshAccessToken()
  } catch {
    notifyAuthExpired()
    throw new AuthExpiredError()
  }

  const retryInit = { ...init, headers: buildHeaders(headers, newAccess, body) }
  res = await fetch(url, retryInit)
  if (res.status === 401) {
    notifyAuthExpired()
    throw new AuthExpiredError()
  }
  return res
}

/**
 * Fetch JSON with 401 → refresh → retry. Throws on non-2xx with the
 * server-provided `message` when available.
 *
 * @param {string} url
 * @param {RequestInit & { skipAuth?: boolean }} [opts]
 */
export async function authJson(url, opts = {}) {
  const res = await authFetch(url, opts)
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const json = isJson ? await res.json() : null

  if (!res.ok) {
    const message = json?.message || `HTTP ${res.status}`
    throw new Error(message)
  }
  // NestJS TransformInterceptor wraps responses as { statusCode, message, data }.
  return json?.data ?? json
}
