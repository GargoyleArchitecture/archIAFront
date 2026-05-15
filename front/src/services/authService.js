import { API_BASE, apiRequest, setTokens, clearTokens, getAccessToken } from './http'

/**
 * POST /auth/register
 * Persiste ambos tokens en storage tras éxito.
 * @param {{ name: string, email: string, password: string, tenantName: string }} params
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export async function register({ name, email, password, tenantName }) {
  const result = await apiRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, tenantName }),
  })
  setTokens({ accessToken: result?.accessToken, refreshToken: result?.refreshToken })
  return result
}

/**
 * POST /auth/login
 * Persiste ambos tokens en storage tras éxito.
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export async function login({ email, password }) {
  const result = await apiRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setTokens({ accessToken: result?.accessToken, refreshToken: result?.refreshToken })
  return result
}

/**
 * POST /auth/logout
 * Limpia el storage local incluso si el backend responde error
 * (el access ya pudo haber expirado).
 */
export async function logout() {
  const token = getAccessToken()
  try {
    if (token) {
      await apiRequest(`${API_BASE}/auth/logout`, { method: 'POST' })
    }
  } catch { /* logout es best-effort */ }
  finally {
    clearTokens()
  }
}

/**
 * GET /auth/me
 * El token se inyecta automáticamente desde storage por `apiRequest`.
 * Si la respuesta es 401, `authorizedFetch` intenta refrescar y reintenta.
 * @returns {Promise<object>} User object
 */
export async function getMe() {
  return apiRequest(`${API_BASE}/auth/me`, { method: 'GET' })
}
