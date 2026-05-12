/**
 * <ModeSuggestionChipAtom /> — Átomo: chip inline de sugerencia de cambio de modo
 *
 * Se muestra dentro de la burbuja de respuesta del asistente cuando la respuesta
 * es corta (≤ MODE_CHIP_MAX_TEXT_LENGTH chars) y el Backend IA sugiere un modo
 * diferente al actual. Criterio F7-T3.
 *
 * Comportamiento:
 *   - Muestra icono + texto "Cambiar a [Tutor|Profesional]".
 *   - onClick → upstream llama setMode(suggestedMode).
 *   - Desaparece automáticamente al cambiar el modo (condición `suggestion !== mode`).
 *   - Fallback al Snackbar (F7-T2) cuando la respuesta es larga.
 *
 * Theming: usa tokens --mode-primary-container / --mode-on-primary-container /
 * --mode-primary del modo ACTUAL para integrarse con la paleta vigente.
 *
 * Props:
 *   suggestedMode — 'tutor' | 'professional'   Modo que se propone al usuario
 *   onClick       — function()                  Llamado al pulsar el chip
 */

import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CodeOutlinedIcon   from '@mui/icons-material/CodeOutlined'
import { emit as emitTelemetry } from '../../services/telemetryService'

const MODE_CONFIG = {
  tutor:        { label: 'Cambiar a Tutor',       Icon: SchoolOutlinedIcon },
  professional: { label: 'Cambiar a Profesional', Icon: CodeOutlinedIcon  },
}

export default function ModeSuggestionChipAtom({ suggestedMode, onClick }) {
  const config = MODE_CONFIG[suggestedMode]
  if (!config) return null

  const { label, Icon } = config

  const handleClick = (e) => {
    // F11-T6: usuario aceptó la sugerencia de modo desde el chip inline.
    emitTelemetry('mode_suggestion_accepted', { payload: { suggestion: suggestedMode, source: 'chip' } })
    onClick?.(e)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 rounded-full',
        'text-body-xs font-medium font-sans',
        'border transition-colors duration-150 theme-transition',
        'focus-visible:outline-none focus-visible:ring-2',
      ].join(' ')}
      style={{
        backgroundColor: 'var(--mode-primary-container)',
        borderColor:     'var(--mode-primary)',
        color:           'var(--mode-on-primary-container)',
      }}
      aria-label={label}
    >
      <Icon style={{ fontSize: 14 }} aria-hidden />
      <span>{label}</span>
    </button>
  )
}

/* ----------------------------------------------------------------
   Ejemplo de uso (en ChatView, dentro del bloque AI):

   import ModeSuggestionChipAtom from '../components/atoms/ModeSuggestionChipAtom'

   {!msg.pending
     && msg.modeSuggestion
     && msg.modeSuggestion !== mode
     && cleanedText.length <= MODE_CHIP_MAX_TEXT_LENGTH
     && (
       <ModeSuggestionChipAtom
         suggestedMode={msg.modeSuggestion}
         onClick={() => setMode(msg.modeSuggestion)}
       />
     )
   }
---------------------------------------------------------------- */
