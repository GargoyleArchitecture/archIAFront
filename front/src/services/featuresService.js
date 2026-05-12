/**
 * F11-T5: featuresService — Consumo de feature flags del tenant
 *
 * Endpoint: GET /api/v1/tenants/me/features (Negocio).
 *
 * Política de fallback:
 *   - Si la red falla o el endpoint responde 4xx/5xx, retorna el set
 *     "optimista" (todos los flags en true) para no romper la UX.
 *   - El caller (FeaturesContext) cachea el resultado por sesión.
 */

const API_BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1'

export const DEFAULT_FEATURES = Object.freeze({
  enableTutorMode: true,
  enableProfileDashboard: true,
  enableRoutines: true,
})

function getToken() {
  try {
    return localStorage.getItem('archia.accessToken') || ''
  } catch {
    return ''
  }
}

/**
 * Obtiene las features del tenant del usuario autenticado.
 * Nunca lanza al caller — fallbacks al set optimista en cualquier error.
 *
 * @returns {Promise<{enableTutorMode: boolean, enableProfileDashboard: boolean, enableRoutines: boolean}>}
 */
export async function getMyFeatures() {
  const token = getToken()
  if (!token) {
    return { ...DEFAULT_FEATURES }
  }
  try {
    const res = await fetch(`${API_BASE}/tenants/me/features`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) return { ...DEFAULT_FEATURES }
    const json = await res.json()
    const data = json?.data ?? json
    return {
      enableTutorMode:        data?.enableTutorMode        !== false,
      enableProfileDashboard: data?.enableProfileDashboard !== false,
      enableRoutines:         data?.enableRoutines         !== false,
    }
  } catch {
    return { ...DEFAULT_FEATURES }
  }
}
