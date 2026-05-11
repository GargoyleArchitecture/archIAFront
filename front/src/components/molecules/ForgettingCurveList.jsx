/**
 * F8-T5: ForgettingCurveList — Lista con semaforización de opacidad
 *
 * Visualiza la curva de olvido del usuario. Cada concepto recibe una
 * opacidad calculada client-side a partir de su `lastSeenAt` y `decayRate`:
 *
 *   opacity = max(minOpacity, exp(-decayRate * deltaDays))
 *
 * Los conceptos frescos (recién vistos) se muestran con opacidad 1.0;
 * los que llevan tiempo sin reforzarse se desvanecen progresivamente.
 *
 * Props:
 *   concepts          — Array<{name, mastery?, decayRate?, lastSeenAt?}>
 *   minOpacity        — number (default 0.25). Mínimo para legibilidad WCAG.
 *   defaultDecayRate  — number (default 0.05). Usado si concept.decayRate falta.
 *   now               — number (timestamp ms) — para testing determinístico.
 *
 * Accesibilidad:
 *   - El título de la sección lleva un tooltip pedagógico (aria-describedby).
 *   - Texto siempre legible (opacity ≥ minOpacity) y color con buen contraste.
 *   - role="list" + role="listitem" por compatibilidad con readers.
 */

import { useMemo } from 'react'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import TooltipAtom from '../atoms/TooltipAtom'
import TextAtom from '../atoms/TextAtom'
import { humanizeDelta, formatDateShort } from '../../utils/profileHydration'

const TOOLTIP_HELP =
  'Los conceptos se desvanecen mientras menos los repasas. ' +
  'Cuanto más opaco, más fresco está. Mínimo 25 % para mantener la legibilidad.'

/**
 * Calcula la opacidad de un concepto dado el momento actual.
 * Función pura — exportada para tests.
 */
export function computeOpacity({ lastSeenAt, decayRate, defaultDecayRate, minOpacity, now }) {
  if (!lastSeenAt) return 1
  const t = new Date(lastSeenAt).getTime()
  if (!Number.isFinite(t)) return 1
  const deltaMs = Math.max(0, now - t)
  const deltaDays = deltaMs / (24 * 60 * 60 * 1000)
  const dr = Number.isFinite(decayRate) ? decayRate : defaultDecayRate
  const raw = Math.exp(-dr * deltaDays)
  return Math.max(minOpacity, Math.min(1, raw))
}

export default function ForgettingCurveList({
  concepts,
  minOpacity = 0.25,
  defaultDecayRate = 0.05,
  now,
}) {
  const safeNow = typeof now === 'number' ? now : Date.now()

  const items = useMemo(() => {
    if (!Array.isArray(concepts)) return []
    return concepts
      .filter((c) => c && typeof c.name === 'string' && c.name.trim().length > 0)
      .map((c) => {
        const decayRate = typeof c.decayRate === 'number'
          ? c.decayRate
          : Number(c.decayRate)
        const opacity = computeOpacity({
          lastSeenAt: c.lastSeenAt,
          decayRate,
          defaultDecayRate,
          minOpacity,
          now: safeNow,
        })
        return {
          name: c.name.trim(),
          mastery: typeof c.mastery === 'number' ? c.mastery : Number(c.mastery),
          lastSeenAt: c.lastSeenAt,
          opacity,
        }
      })
      .sort((a, b) => b.opacity - a.opacity)
  }, [concepts, minOpacity, defaultDecayRate, safeNow])

  if (items.length === 0) {
    return (
      <TextAtom variant="text-sm" className="text-gray-400 italic">
        No hay conceptos para mostrar todavía.
      </TextAtom>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <TextAtom variant="text-xs" weight="medium" className="text-gray-600 uppercase tracking-wide">
          Conceptos por re-encontrar
        </TextAtom>
        <TooltipAtom content={TOOLTIP_HELP} position="right">
          {/* F11-T3: usamos <button> en lugar de <span tabIndex>+aria-label
              para cumplir aria-prohibited-attr. El botón es semánticamente
              correcto (control de revelación de ayuda) y permite foco. */}
          <button
            type="button"
            className="inline-flex items-center text-gray-400 hover:text-gray-600 cursor-help bg-transparent border-0 p-0"
            aria-label="Explicación de la curva de olvido"
          >
            <HelpOutlineIcon style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
        </TooltipAtom>
      </div>

      <ul
        className="flex flex-col gap-1.5 list-none p-0 m-0"
        data-testid="forgetting-list"
      >
        {items.map((item) => (
          <li
            key={item.name}
            style={{ opacity: item.opacity }}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 theme-transition"
          >
            <span className="text-sm font-medium text-gray-800 truncate">
              {item.name}
            </span>
            <div className="flex items-center gap-3 flex-shrink-0">
              {Number.isFinite(item.mastery) && (
                <span
                  className="text-xs font-mono text-gray-600"
                  data-testid="forgetting-mastery"
                >
                  {Math.round(item.mastery * 100)} %
                </span>
              )}
              <span className="text-xs text-gray-500">
                {item.lastSeenAt
                  ? `${humanizeDelta(item.lastSeenAt, safeNow)} · ${formatDateShort(item.lastSeenAt)}`
                  : 'sin registro'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------------------------------------------
   Ejemplo de uso:

   <ForgettingCurveList
     concepts={profile.evaluatedConcepts}
   />
---------------------------------------------------------------- */
