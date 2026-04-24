const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1'

async function request(url, { headers, ...rest } = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...headers },
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
 * POST /auth/register
 * @param {{ name: string, email: string, password: string, tenantName: string }} params
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export async function register({ name, email, password, tenantName }) {
  return request(`${BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, tenantName }),
  })
}

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
export async function login({ email, password }) {
  return request(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * POST /auth/refresh
 * @param {string} token - The refresh token
 * @returns {Promise<{ accessToken: string }>}
 */
export async function refreshToken(token) {
  return request(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

/**
 * POST /auth/logout
 * @param {string} accessToken
 * @returns {Promise<void>}
 */
export async function logout(accessToken) {
  return request(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

/**
 * GET /auth/me
 * @param {string} accessToken
 * @returns {Promise<object>} User object
 */
export async function getMe(accessToken) {
  return request(`${BASE}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
