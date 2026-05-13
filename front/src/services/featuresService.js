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

import { API_BASE, apiRequest, getAccessToken } from './http'

export const DEFAULT_FEATURES = Object.freeze({
  enableTutorMode: true,
  enableProfileDashboard: true,
  enableRoutines: true,
})

/**
 * Obtiene las features del tenant del usuario autenticado.
 * Nunca lanza al caller — fallbacks al set optimista en cualquier error.
 * Se beneficia del retry-on-401 automático de `apiRequest`.
 *
 * @returns {Promise<{enableTutorMode: boolean, enableProfileDashboard: boolean, enableRoutines: boolean}>}
 */
export async function getMyFeatures() {
  if (!getAccessToken()) {
    return { ...DEFAULT_FEATURES }
  }
  try {
    const data = await apiRequest(`${API_BASE}/tenants/me/features`)
    return {
      enableTutorMode:        data?.enableTutorMode        !== false,
      enableProfileDashboard: data?.enableProfileDashboard !== false,
      enableRoutines:         data?.enableRoutines         !== false,
    }
  } catch {
    return { ...DEFAULT_FEATURES }
  }
}
