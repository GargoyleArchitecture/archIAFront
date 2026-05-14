/**
 * F12-T8: SolutionPanel — Panel colapsable con la solución de referencia.
 *
 * Política anti-spoiler: el panel solo recibe `solution` cuando el alumno
 * ya tiene al menos un attempt evaluado (lo controla el padre). Aquí
 * sólo nos encargamos de la presentación + colapso para no abrumar visualmente.
 *
 * Props:
 *   solution     — string (Markdown). Si vacío/null, no renderiza.
 *   defaultOpen? — bool. Por defecto false (el alumno decide cuándo verla).
 *   className?   — string
 */

import { useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import VisibilityIcon from '@mui/icons-material/Visibility'

import TextAtom         from '../atoms/TextAtom'
import MarkdownRenderer from '../organisms/MarkdownRenderer'

export default function SolutionPanel({ solution, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  if (typeof solution !== 'string' || solution.trim().length === 0) return null

  const Toggle = open ? ExpandLessIcon : ExpandMoreIcon

  return (
    <section
      className={['flex flex-col rounded-xl border border-gray-200 bg-white theme-transition', className]
        .filter(Boolean).join(' ')}
      aria-label="Solución de referencia"
      data-testid="solution-panel"
    >
      <button
        type="button"
        className="flex items-center justify-between gap-3 px-5 py-3 w-full text-left hover:bg-gray-50 theme-transition"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="solution-panel-body"
        data-testid="solution-toggle"
      >
        <div className="flex items-center gap-2">
          <VisibilityIcon
            style={{ fontSize: 18, color: 'var(--mode-primary, var(--color-brand-500))' }}
            aria-hidden="true"
          />
          <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
            Solución de referencia
          </TextAtom>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <TextAtom variant="text-xs" className="text-gray-500">
            {open ? 'Ocultar' : 'Mostrar'}
          </TextAtom>
          <Toggle style={{ fontSize: 18 }} aria-hidden="true" />
        </div>
      </button>
      {open && (
        <div
          id="solution-panel-body"
          className="px-5 pb-5 pt-0 border-t border-gray-100"
          data-testid="solution-body"
        >
          <MarkdownRenderer content={solution} />
        </div>
      )}
    </section>
  )
}
