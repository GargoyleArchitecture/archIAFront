/**
 * <ModeSuggestionSnackbar /> — Molécula: notificación de sugerencia de cambio de modo
 *
 * Aparece (fija, centrada en la parte inferior) cuando el Backend IA sugiere
 * cambiar de modo activo. Cumple criterios F7-T2:
 *
 *   - Auto-dismiss en 8 s si el usuario no actúa.
 *   - Acción "Cambiar" llama onAccept(suggestedMode).
 *   - No se muestra si el modo sugerido coincide con el actual (se filtra upstream).
 *   - Persistencia del "Ignorar" por 24 h en localStorage bajo 'arquia.modeSuggestionDismissed'.
 *   - Solo aparece cuando suggestion es 'tutor' | 'professional' (no null).
 *
 * Theming: consume tokens --mode-* del modo ACTUAL (no del sugerido) para
 * integrarse visualmente en la UI. El icono y el badge preview usan los
 * colores del modo sugerido (primary del modo si se pudiera; aquí se usan
 * colores semánticos estáticos para no necesitar un segundo contexto).
 *
 * Props:
 *   suggestion  — 'tutor' | 'professional' | null   Modo sugerido por el backend
 *   onAccept    — function(mode)                     Llamado al pulsar "Cambiar"
 *   onDismiss   — function()                         Llamado al cerrar o auto-dismiss
 */

import { useEffect, useRef } from 'react'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CodeOutlinedIcon   from '@mui/icons-material/CodeOutlined'
import CloseIcon          from '@mui/icons-material/Close'
import ButtonAtom         from '../atoms/ButtonAtom'
import TextAtom           from '../atoms/TextAtom'
import { emit as emitTelemetry } from '../../services/telemetryService'

/* ----------------------------------------------------------------
   Constantes
---------------------------------------------------------------- */
const DISMISS_KEY    = 'arquia.modeSuggestionDismissed'
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000   // 24 h
const AUTO_DISMISS   = 8000                   // 8 s

const MODE_META = {
  tutor:        { label: 'Modo Tutor',        Icon: SchoolOutlinedIcon },
  professional: { label: 'Modo Profesional',  Icon: CodeOutlinedIcon  },
}

/* ----------------------------------------------------------------
   Helpers de localStorage para el cooldown de 24 h
---------------------------------------------------------------- */
function isDismissedRecently(suggestedMode) {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const { mode, timestamp } = JSON.parse(raw)
    return mode === suggestedMode && (Date.now() - timestamp) < DISMISS_TTL_MS
  } catch {
    return false
  }
}

function persistDismiss(suggestedMode) {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      JSON.stringify({ mode: suggestedMode, timestamp: Date.now() }),
    )
  } catch { /* localStorage no disponible en contextos restringidos */ }
}

/* ================================================================
   COMPONENTE PRINCIPAL
================================================================ */
export default function ModeSuggestionSnackbar({ suggestion, onAccept, onDismiss }) {
  const timerRef = useRef(null)

  // Validar: solo mostrar cuando hay sugerencia válida y no fue descartada recientemente.
  const meta    = MODE_META[suggestion]
  const visible = !!meta && !isDismissedRecently(suggestion)

  /* Auto-dismiss a los 8 s */
  useEffect(() => {
    if (!visible) return
    timerRef.current = setTimeout(() => {
      onDismiss?.()
    }, AUTO_DISMISS)
    return () => clearTimeout(timerRef.current)
  }, [visible, suggestion, onDismiss])

  if (!visible) return null

  const { label, Icon } = meta

  const handleDismiss = () => {
    clearTimeout(timerRef.current)
    persistDismiss(suggestion)
    onDismiss?.()
  }

  const handleAccept = () => {
    clearTimeout(timerRef.current)
    // F11-T6: usuario aceptó la sugerencia de modo desde el snackbar.
    emitTelemetry('mode_suggestion_accepted', { payload: { suggestion, source: 'snackbar' } })
    onAccept?.(suggestion)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg theme-transition"
      style={{
        backgroundColor: 'var(--mode-surface-container)',
        border:          '1px solid var(--mode-outline)',
        color:           'var(--mode-on-surface)',
        minWidth:        '280px',
        maxWidth:        '480px',
      }}
    >
      {/* Icono del modo sugerido */}
      <span
        aria-hidden
        style={{ color: 'var(--mode-primary)', flexShrink: 0 }}
      >
        <Icon style={{ fontSize: 18 }} />
      </span>

      {/* Texto descriptivo */}
      <TextAtom variant="text-sm" className="flex-1 leading-snug">
        {'¿Cambiar a '}
        <strong style={{ color: 'var(--mode-primary)' }}>{label}</strong>
        {'?'}
      </TextAtom>

      {/* CTA — Cambiar */}
      <ButtonAtom
        intent="primary"
        size="xs"
        onClick={handleAccept}
        aria-label={`Cambiar a ${label}`}
      >
        Cambiar
      </ButtonAtom>

      {/* Cerrar / Ignorar */}
      <ButtonAtom
        variant="icon"
        intent="ghost"
        size="xs"
        onClick={handleDismiss}
        aria-label="Ignorar sugerencia de modo"
      >
        <CloseIcon style={{ fontSize: 14 }} />
      </ButtonAtom>
    </div>
  )
}

/* ----------------------------------------------------------------
   Ejemplo de uso (en ChatView):

   const [snackSuggestion, setSnackSuggestion] = useState(null)
   const { setMode } = useMode()

   // Al recibir nuevo mensaje con modeSuggestion long (>500 chars):
   setSnackSuggestion('tutor')

   <ModeSuggestionSnackbar
     suggestion={snackSuggestion}
     onAccept={(mode) => { setMode(mode); setSnackSuggestion(null) }}
     onDismiss={() => setSnackSuggestion(null)}
   />
---------------------------------------------------------------- */
