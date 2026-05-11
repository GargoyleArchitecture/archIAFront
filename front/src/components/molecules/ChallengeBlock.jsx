/**
 * F9-T1: ChallengeBlock — Reto pedagógico renderizado en el chat
 *
 * Se monta cuando hay un reto activo en `location.state.pendingRoutine`
 * (entregado por F8-T4 WeaknessActionCard). Renderiza:
 *
 *   - Badge "Reto" + dificultad N/5.
 *   - Título de la rutina.
 *   - RoutineProgressBar reflejando el step actual.
 *   - Snippet de RAG inverso resaltado como "código a mejorar"
 *     (si la rutina lo trae).
 *   - Área de trabajo (MessageInput multilinea reusado).
 *   - Botón "Enviar intento" que llama submitAttempt(routineId).
 *
 * Estados internos:
 *   idle       — descripción visible, input vacío, botón habilitado.
 *   submitting — botón deshabilitado, microcopy "Enviando…".
 *   scored     — recap inline; el feedback automático llegará cuando
 *                el subgrafo de scoring exista (out of scope F9).
 *   error      — alert inline + botón Reintentar.
 *
 * Props:
 *   routine     — objeto con { id, title, targetWeakness, expectedConcepts,
 *                              difficulty, inverseRagSnippet? }
 *   onClose     — function() — limpia la rutina activa (consumido por
 *                 MainView para limpiar location.state).
 *
 * Forward-compat:
 *   El scoring automático (motor IA) NO existe aún. El attempt se
 *   persiste en Negocio con status='completed' y mostramos un mensaje
 *   "Intento registrado. El feedback automático llegará pronto."
 *   Cuando el motor de scoring entre, basta con escuchar el feedback
 *   vía polling o WebSocket en esta misma molécula.
 */

import { useState } from 'react'
import CloseIcon          from '@mui/icons-material/Close'
import SendIcon           from '@mui/icons-material/Send'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RefreshIcon        from '@mui/icons-material/Refresh'

import TextAtom           from '../atoms/TextAtom'
import ButtonAtom         from '../atoms/ButtonAtom'
import MessageInput       from './MessageInput'
import RoutineProgressBar from './RoutineProgressBar'
import { submitAttempt }  from '../../services/profileService'

const STATUS = {
  IDLE:       'idle',
  SUBMITTING: 'submitting',
  SCORED:     'scored',
  ERROR:      'error',
}

function clampDifficulty(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  return Math.max(1, Math.min(5, Math.round(n)))
}

export default function ChallengeBlock({ routine, onClose }) {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [errorMsg, setErrorMsg] = useState(null)
  const [attemptText, setAttemptText] = useState('')

  if (!routine || !routine.id) return null

  const difficulty = clampDifficulty(routine.difficulty)
  const expectedConcepts = Array.isArray(routine.expectedConcepts) ? routine.expectedConcepts : []

  // Mapeo de status interno → step canónico del progress bar.
  const stepByStatus = {
    [STATUS.IDLE]:       'attempt',
    [STATUS.SUBMITTING]: 'attempt',
    [STATUS.SCORED]:     'recap',
    [STATUS.ERROR]:      'attempt',
  }
  const completedByStatus = {
    [STATUS.IDLE]:       ['description'],
    [STATUS.SUBMITTING]: ['description'],
    [STATUS.SCORED]:     ['description', 'attempt', 'feedback'],
    [STATUS.ERROR]:      ['description'],
  }

  const handleSend = async (text) => {
    if (!text || !text.trim() || status === STATUS.SUBMITTING) return
    setAttemptText(text)
    setStatus(STATUS.SUBMITTING)
    setErrorMsg(null)
    try {
      await submitAttempt(routine.id, { status: 'completed' })
      setStatus(STATUS.SCORED)
    } catch (err) {
      setErrorMsg(err?.message || 'No se pudo registrar el intento. Intentá nuevamente.')
      setStatus(STATUS.ERROR)
    }
  }

  const handleRetry = () => {
    if (attemptText) {
      handleSend(attemptText)
    } else {
      setStatus(STATUS.IDLE)
      setErrorMsg(null)
    }
  }

  return (
    <article
      className="flex flex-col gap-4 p-5 rounded-xl border border-gray-200 bg-white theme-transition shadow-sm"
      aria-label={`Reto: ${routine.title || routine.targetWeakness || 'sin título'}`}
      data-testid="challenge-block"
    >
      {/* Header: badge + dificultad + close */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            role="status"
            aria-label="Bloque de reto"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'var(--mode-primary-container, var(--color-brand-100))',
              color:           'var(--mode-on-primary-container, var(--color-brand-900))',
            }}
          >
            <EmojiObjectsOutlinedIcon style={{ fontSize: 14 }} aria-hidden="true" />
            Reto
          </span>
          {difficulty !== null && (
            <span
              className="text-xs font-mono text-gray-600"
              aria-label={`Dificultad ${difficulty} de 5`}
              data-testid="challenge-difficulty"
            >
              Dificultad {difficulty}/5
            </span>
          )}
        </div>
        {typeof onClose === 'function' && (
          <ButtonAtom
            variant="icon"
            intent="ghost"
            size="xs"
            onClick={onClose}
            aria-label="Cerrar reto"
          >
            <CloseIcon style={{ fontSize: 16 }} />
          </ButtonAtom>
        )}
      </header>

      {/* Título */}
      <TextAtom variant="text-lg" weight="semibold" className="text-gray-800">
        {routine.title || `Reto sobre ${routine.targetWeakness}`}
      </TextAtom>

      {/* Progress bar */}
      <RoutineProgressBar
        currentStep={stepByStatus[status]}
        completedSteps={completedByStatus[status]}
      />

      {/* Snippet de RAG inverso (código a mejorar) — si la rutina lo trae */}
      {routine.inverseRagSnippet && (
        <div
          className="rounded-md overflow-x-auto"
          style={{
            backgroundColor: 'var(--mode-code-block-bg)',
            color:           'var(--mode-code-block-fg)',
          }}
          data-testid="challenge-snippet"
        >
          <div
            className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider opacity-70"
            style={{ backgroundColor: 'var(--mode-code-header-bg)' }}
          >
            Código a mejorar
          </div>
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {routine.inverseRagSnippet}
          </pre>
        </div>
      )}

      {/* Conceptos esperados (chips) */}
      {expectedConcepts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {expectedConcepts.map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 text-xs rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-mono"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Estado: scored */}
      {status === STATUS.SCORED && (
        <div
          role="status"
          className="flex items-start gap-2 px-3 py-3 rounded-md bg-success-50 border border-success-200 text-success-800"
          data-testid="challenge-scored"
        >
          <CheckCircleOutlineIcon style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <TextAtom variant="text-sm" weight="semibold" className="text-success-800">
              Intento registrado
            </TextAtom>
            <TextAtom variant="text-xs" className="text-success-700">
              Tu intento quedó guardado. El feedback automático llegará pronto.
            </TextAtom>
          </div>
        </div>
      )}

      {/* Estado: error */}
      {status === STATUS.ERROR && (
        <div
          role="alert"
          className="flex flex-col gap-2 px-3 py-2 rounded-md bg-error-50 border border-error-200"
          data-testid="challenge-error"
        >
          <TextAtom variant="text-xs" className="text-error-700">
            {errorMsg}
          </TextAtom>
          <div className="flex justify-end">
            <ButtonAtom
              variant="text-icon"
              intent="secondary"
              size="sm"
              icon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Reintentar
            </ButtonAtom>
          </div>
        </div>
      )}

      {/* Área de trabajo: input + envío.
          Cuando ya está scored, ocultamos el input para evitar reenvíos
          inadvertidos. El usuario puede cerrar el bloque con el botón X. */}
      {status !== STATUS.SCORED && (
        <div className="flex flex-col gap-2" data-testid="challenge-input-wrapper">
          <TextAtom variant="text-xs" className="text-gray-500">
            Escribí tu intento abajo y enviá cuando estés listo.
          </TextAtom>
          <MessageInput
            onSend={handleSend}
            placeholder="Escribí tu intento aquí…"
            hint={
              <span className="inline-flex items-center gap-1.5">
                <SendIcon style={{ fontSize: 12 }} aria-hidden="true" />
                {status === STATUS.SUBMITTING
                  ? 'Enviando intento…'
                  : 'Enter para enviar · Shift+Enter para nueva línea'}
              </span>
            }
            disabled={status === STATUS.SUBMITTING}
          />
        </div>
      )}
    </article>
  )
}
