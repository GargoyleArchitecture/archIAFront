/**
 * F11-T6: useTelemetry — Hook ligero para emitir eventos
 *
 * Wraps `telemetryService.emit` agregando automáticamente el `userId`
 * del usuario autenticado vía `useAuth`. Diseñado para usarse en
 * cualquier componente sin tener que pasar `user.id` manualmente.
 *
 * Uso:
 *   const telemetry = useTelemetry()
 *   telemetry.emit('mode_changed', { from: 'tutor', to: 'professional' })
 */

import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { emit as serviceEmit } from '../services/telemetryService'

export function useTelemetry() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? null

  const emit = useCallback(
    (event, payload) => {
      if (typeof event !== 'string' || event.trim().length === 0) return
      serviceEmit(event, { userId, payload })
    },
    [userId],
  )

  return { emit }
}

export default useTelemetry
