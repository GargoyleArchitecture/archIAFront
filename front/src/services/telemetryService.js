/**
 * F11-T6: telemetryService — Cliente fire-and-forget de eventos
 *
 * Encola eventos en memoria y los entrega en batch (debounce 1.5s o
 * threshold 5 eventos) a `POST /api/v1/telemetry` del Backend Negocio.
 *
 * En desarrollo (`import.meta.env.DEV`), también los emite por console
 * para inspección rápida. En producción solo hace fetch.
 *
 * Nunca lanza al caller — los eventos son señales secundarias y no
 * deben romper UX si la red falla.
 *
 * Eventos esperados (forma genérica):
 *   {
 *     event:     string,            // p.ej. 'mode_changed'
 *     userId:    string | null,
 *     timestamp: string (ISO),
 *     payload?:  Record<string, any>,
 *   }
 */

import { API_BASE, getAccessToken } from './http'

const FLUSH_THRESHOLD = 5
const FLUSH_DEBOUNCE_MS = 1500

let queue = []
let flushTimer = null

// Telemetría es fire-and-forget: usa `fetch` plano (NO `authorizedFetch`)
// para evitar disparar un refresh-on-401 por un fallo silencioso de logging.
function getToken() {
  return getAccessToken()
}

function nowIso() {
  return new Date().toISOString()
}

async function sendBatch(batch) {
  if (!Array.isArray(batch) || batch.length === 0) return
  const token = getToken()
  try {
    await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: batch }),
      // No esperamos respuesta: si falla, ignoramos.
      keepalive: true,
    })
  } catch {
    /* fire-and-forget: el error se ignora intencionalmente */
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushNow()
  }, FLUSH_DEBOUNCE_MS)
}

/**
 * Vacía la cola actual y dispara el batch HTTP.
 * Retorna una Promise que resuelve cuando el fetch terminó (útil para
 * `beforeunload` o tests). Errores se silencian.
 */
export async function flushNow() {
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  await sendBatch(batch)
}

/**
 * Encola un evento de telemetría.
 *
 * @param {string} event
 * @param {{userId?: string|null, payload?: object}} options
 */
export function emit(event, { userId = null, payload } = {}) {
  if (typeof event !== 'string' || event.trim().length === 0) return

  const record = {
    event:     event.trim(),
    userId:    typeof userId === 'string' && userId ? userId : null,
    timestamp: nowIso(),
  }
  if (payload && typeof payload === 'object') {
    record.payload = payload
  }

  if (import.meta.env?.DEV) {
    /* eslint-disable-next-line no-console */
    console.debug('[telemetry]', record)
  }

  queue.push(record)
  if (queue.length >= FLUSH_THRESHOLD) {
    flushNow()
  } else {
    scheduleFlush()
  }
}

/**
 * Helper para tests: vacía la cola y resetea el timer SIN enviar.
 */
export function _resetForTests() {
  queue = []
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

/**
 * Helper para tests: inspecciona la cola actual sin mutarla.
 */
export function _peekQueueForTests() {
  return [...queue]
}
