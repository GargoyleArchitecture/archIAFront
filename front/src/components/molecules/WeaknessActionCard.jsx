/**
 * F8-T4: WeaknessActionCard — Tarjeta de debilidad con CTA "Generar reto"
 *
 * Presenta una debilidad técnica del usuario con su severidad derivada
 * de `mastery`, el último visto humanizado, y un botón que dispara la
 * generación de un reto personalizado vía `generateRoutine` (F4-T5).
 *
 * Estados internos:
 *   idle      → botón "Generar reto" habilitado
 *   loading   → botón deshabilitado + microcopy "Generando reto…"
 *   success   → toast inline "Reto creado · Abriendo chat…" durante 1.2s
 *                antes de navegar a `/` con state.pendingRoutine
 *   error     → mensaje inline + botón "Reintentar"
 *
 * Props:
 *   userId      — string (requerido). Si vacío, el botón queda deshabilitado.
 *   name        — string (requerido). Nombre del concepto a reforzar.
 *   mastery     — number 0..1 (opcional). Determina la severidad.
 *   lastSeenAt  — string ISO (opcional). Microtexto "último visto".
 *
 * Forward-compat con F9-T1:
 *   En éxito navegamos con `navigate('/', { state: { pendingRoutine } })`.
 *   F9-T1 leerá `location.state.pendingRoutine` para inyectar el
 *   ChallengeBlock en el chat. Mientras tanto, el reto SÍ queda
 *   persistido en Backend Negocio.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RefreshIcon          from '@mui/icons-material/Refresh'
import PlayArrowIcon        from '@mui/icons-material/PlayArrow'
import HourglassEmptyIcon   from '@mui/icons-material/HourglassEmpty'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import ButtonAtom        from '../atoms/ButtonAtom'
import TextAtom          from '../atoms/TextAtom'
import SeverityBadgeAtom, { severityFromMastery } from '../atoms/SeverityBadgeAtom'

import { generateRoutine } from '../../services/profileService'
import { humanizeDelta }   from '../../utils/profileHydration'
import { emit as emitTelemetry } from '../../services/telemetryService'

const NAVIGATE_DELAY_MS = 1200

export default function WeaknessActionCard({
  userId,
  name,
  mastery,
  lastSeenAt,
}) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')  // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null)
  const severity = severityFromMastery(mastery)

  const canGenerate = !!userId && typeof name === 'string' && name.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate || status === 'loading') return
    // F11-T6: el usuario disparó la generación; emitimos antes de la red
    // para tener la señal aunque el endpoint falle.
    emitTelemetry('weakness_action_clicked', {
      userId,
      payload: { targetWeakness: name, mastery },
    })
    setStatus('loading')
    setErrorMsg(null)
    try {
      const routine = await generateRoutine({ userId, targetWeakness: name })
      // F11-T6: routine generada con éxito desde el frontend (complemento al log IA/Negocio).
      emitTelemetry('routine_generated', {
        userId,
        payload: { routineId: routine?.id, targetWeakness: name, difficulty: routine?.difficulty },
      })
      setStatus('success')
      // Pequeña pausa antes del navigate para que el usuario vea el feedback
      setTimeout(() => {
        navigate('/', {
          state: {
            pendingRoutine: {
              id:               routine?.id,
              title:            routine?.title,
              targetWeakness:   routine?.targetWeakness ?? name,
              expectedConcepts: routine?.expectedConcepts ?? [],
              difficulty:       routine?.difficulty,
            },
          },
        })
      }, NAVIGATE_DELAY_MS)
    } catch (err) {
      const msg = err?.message || 'Error inesperado'
      // Mensaje contextual para el caso de timeout (Negocio responde 404 con
      // detail descriptivo cuando IA tarda demasiado).
      const friendly = /timeout|tard|unavailable|404/i.test(msg)
        ? 'El servicio tardó más de lo esperado. Intentá nuevamente.'
        : msg
      setErrorMsg(friendly)
      setStatus('error')
    }
  }

  const lastSeenLabel = lastSeenAt ? humanizeDelta(lastSeenAt) : null

  return (
    <article
      className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white theme-transition"
      aria-label={`Debilidad ${name}`}
      data-testid="weakness-action-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <TextAtom
            variant="text-md"
            weight="semibold"
            className="text-gray-800 truncate"
          >
            {name}
          </TextAtom>
          {lastSeenLabel && (
            <TextAtom variant="text-xs" className="text-gray-500">
              Último visto · {lastSeenLabel}
            </TextAtom>
          )}
        </div>
        <SeverityBadgeAtom level={severity} />
      </div>

      {/* Microcopy de mastery */}
      {typeof mastery === 'number' && Number.isFinite(mastery) && (
        <div className="flex items-center gap-2">
          <TextAtom variant="text-xs" className="text-gray-500">
            Dominio actual
          </TextAtom>
          <TextAtom
            variant="text-xs"
            family="mono"
            className="text-gray-700"
            data-testid="weakness-mastery"
          >
            {Math.round(mastery * 100)} %
          </TextAtom>
        </div>
      )}

      {/* Estado de éxito (inline) */}
      {status === 'success' && (
        <div
          role="status"
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-success-50 border border-success-200 text-success-800"
          data-testid="weakness-success"
        >
          <CheckCircleOutlineIcon style={{ fontSize: 16 }} aria-hidden="true" />
          <TextAtom variant="text-xs" className="text-success-800">
            Reto creado · Abriendo chat…
          </TextAtom>
        </div>
      )}

      {/* Estado de error (inline) */}
      {status === 'error' && (
        <div
          role="alert"
          className="flex flex-col gap-2 px-3 py-2 rounded-md bg-error-50 border border-error-200"
          data-testid="weakness-error"
        >
          <TextAtom variant="text-xs" className="text-error-700">
            {errorMsg}
          </TextAtom>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end">
        {status === 'error' ? (
          <ButtonAtom
            variant="text-icon"
            intent="secondary"
            size="sm"
            icon={<RefreshIcon />}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            Reintentar
          </ButtonAtom>
        ) : (
          <ButtonAtom
            variant="text-icon"
            intent="primary"
            size="sm"
            icon={status === 'loading' ? <HourglassEmptyIcon /> : <PlayArrowIcon />}
            onClick={handleGenerate}
            disabled={!canGenerate || status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? 'Generando reto…' : 'Generar reto'}
          </ButtonAtom>
        )}
      </div>
    </article>
  )
}

/* ----------------------------------------------------------------
   Ejemplo de uso:

   <WeaknessActionCard
     userId={user.id}
     name="Concurrency"
     mastery={0.30}
     lastSeenAt="2026-04-15T10:00:00Z"
   />
---------------------------------------------------------------- */
