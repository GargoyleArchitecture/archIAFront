/**
 * F8-T3: StrengthChip — Chip de fortaleza técnica
 *
 * Muestra una fortaleza del usuario (nombre del concepto) con un
 * micro-texto "vigente desde dd/mm" y, opcionalmente, una variante
 * `intensity` que ajusta la opacidad del chip según la `mastery`
 * (cuanto mayor el dominio, más opaco/brillante).
 *
 * En hover se despliega un tooltip con detalle (mastery % y tiempo
 * humanizado desde lastSeenAt).
 *
 * Props:
 *   name        — string         (requerido)
 *   mastery     — number 0..1    (opcional)
 *   lastSeenAt  — string ISO     (opcional)
 *   intensity   — bool           (default false). Si true, opacidad ~ mastery.
 *   className   — string         clases extra
 *
 * Diseño:
 *   - flex-wrap-friendly (inline-flex con shrink-0).
 *   - Tokens de paleta `--mode-primary-container` para consistencia con
 *     el modo activo (tutor/professional).
 *   - Tooltip reusa TooltipAtom existente.
 *
 * Accesibilidad:
 *   - El tooltip se anuncia con `role="tooltip"` (lo aporta TooltipAtom).
 *   - El chip lleva aria-label compuesto para screen readers.
 */

import TooltipAtom from '../atoms/TooltipAtom'
import { formatDateShort, humanizeDelta } from '../../utils/profileHydration'

/**
 * Calcula la opacidad final del chip.
 * - intensity=false → 1.0 siempre.
 * - intensity=true  → escala lineal entre 0.45 (mastery 0) y 1.0 (mastery 1).
 *                     Mínimo 0.45 garantiza WCAG AA con el fondo claro.
 *                     Si mastery es undefined, se asume 0.75 (no penalizar
 *                     fortalezas sin metadata).
 */
function resolveOpacity(intensity, mastery) {
  if (!intensity) return 1
  const m = typeof mastery === 'number' && Number.isFinite(mastery) ? mastery : 0.75
  const clamped = Math.max(0, Math.min(1, m))
  return Math.round((0.45 + 0.55 * clamped) * 100) / 100
}

function buildTooltipContent(name, mastery, lastSeenAt) {
  const parts = [name]
  if (typeof mastery === 'number') {
    parts.push(`Mastery ${Math.round(mastery * 100)} %`)
  }
  if (lastSeenAt) {
    parts.push(humanizeDelta(lastSeenAt))
  }
  return parts.join(' · ')
}

export default function StrengthChip({
  name,
  mastery,
  lastSeenAt,
  intensity = false,
  className = '',
}) {
  if (!name || typeof name !== 'string') return null

  const opacity = resolveOpacity(intensity, mastery)
  const dateShort = formatDateShort(lastSeenAt)
  const tooltip = buildTooltipContent(name, mastery, lastSeenAt)
  const ariaLabel = lastSeenAt
    ? `Fortaleza ${name}, vigente desde ${dateShort}`
    : `Fortaleza ${name}`

  const chipStyle = {
    backgroundColor: 'var(--mode-primary-container, var(--color-brand-100))',
    color:           'var(--mode-on-primary-container, var(--color-brand-900))',
    borderColor:     'var(--mode-outline, var(--color-brand-300))',
    opacity,
  }

  return (
    <TooltipAtom content={tooltip} position="top">
      <span
        role="status"
        aria-label={ariaLabel}
        style={chipStyle}
        className={[
          'inline-flex items-center gap-1.5 shrink-0',
          'px-3 py-1.5 rounded-full border text-sm font-medium font-sans whitespace-nowrap',
          'theme-transition',
          className,
        ].filter(Boolean).join(' ')}
      >
        <span>{name}</span>
        {dateShort && (
          <span
            className="text-xs font-normal opacity-75"
            data-testid="strength-chip-date"
          >
            vigente desde {dateShort}
          </span>
        )}
      </span>
    </TooltipAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   <StrengthChip name="SOLID" mastery={0.85} lastSeenAt="2026-05-01T10:00:00Z" />
   <StrengthChip name="Caching" mastery={0.6} intensity />
   <StrengthChip name="Patterns" />   // sin metadata, opacidad 1.0
---------------------------------------------------------------- */
