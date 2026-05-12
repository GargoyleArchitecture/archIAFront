/**
 * F8-T4 (también consumido en F10-T2): SeverityBadgeAtom
 *
 * Badge compacto que comunica severidad/prioridad con tres niveles
 * semánticos: high (rojo), medium (amarillo), low (verde). Adicional
 * `unknown` (gris) para datos faltantes.
 *
 * Props:
 *   level     — 'high' | 'medium' | 'low' | 'unknown'   (requerido)
 *   size      — 'sm' | 'md'                              (default: 'sm')
 *   className — string                                   clases extra
 *
 * Accesibilidad:
 *   - role="status" + aria-label en español.
 *   - El color no es la única señal: el label textual también lo indica.
 */

const SIZE_CLASS = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

const LEVEL_CONFIG = {
  high: {
    label: 'Alta',
    style: {
      backgroundColor: 'var(--color-error-100)',
      color:           'var(--color-error-800)',
      borderColor:     'var(--color-error-300)',
    },
  },
  medium: {
    label: 'Media',
    style: {
      backgroundColor: 'var(--color-warning-100)',
      color:           'var(--color-warning-800)',
      borderColor:     'var(--color-warning-300)',
    },
  },
  low: {
    label: 'Baja',
    style: {
      backgroundColor: 'var(--color-success-100)',
      color:           'var(--color-success-800)',
      borderColor:     'var(--color-success-300)',
    },
  },
  unknown: {
    label: '—',
    style: {
      backgroundColor: 'var(--color-gray-100)',
      color:           'var(--color-gray-700)',
      borderColor:     'var(--color-gray-300)',
    },
  },
}

export default function SeverityBadgeAtom({
  level,
  size = 'sm',
  className = '',
  ...rest
}) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown
  return (
    <span
      role="status"
      aria-label={`Severidad ${config.label}`}
      style={{ ...config.style, borderWidth: '1px', borderStyle: 'solid' }}
      className={[
        'inline-flex items-center rounded-full font-medium font-sans whitespace-nowrap',
        SIZE_CLASS[size] ?? SIZE_CLASS.sm,
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {config.label}
    </span>
  )
}

/**
 * Helper público para derivar el nivel desde un valor de mastery [0..1].
 * Documentado y exportado por separado para no obligar al consumidor a
 * duplicar las constantes.
 */
export function severityFromMastery(mastery) {
  if (typeof mastery !== 'number' || !Number.isFinite(mastery)) return 'unknown'
  if (mastery < 0.3) return 'high'
  if (mastery < 0.6) return 'medium'
  return 'low'
}
