/**
 * F10-T2: MonoTagAtom — Etiqueta tipográfica monoespaciada
 *
 * Pieza pequeña para nombrar identificadores técnicos: nodos del grafo,
 * nombres de herramientas, IDs de sesión, slugs. Comparte la semántica
 * "esto es un literal técnico" en cualquier punto del UI.
 *
 * Distinto de ConceptPillAtom (que nombra ideas arquitectónicas con
 * tipografía sans) y de SeverityBadgeAtom (que comunica nivel/prioridad).
 *
 * Props:
 *   children  — ReactNode (texto literal)  (requerido)
 *   tone      — 'neutral' | 'brand' | 'success' | 'warning'  (default: 'neutral')
 *   size      — 'sm' | 'md'                                   (default: 'sm')
 *   className — clases extra
 *
 * Accesibilidad:
 *   - role="status" + aria-label compuesto en español.
 *   - El borde + fondo aseguran contraste WCAG AA en cualquier modo.
 */

const SIZE_CLASS = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
}

const TONE_CONFIG = {
  neutral: {
    bg:     'var(--color-gray-100)',
    fg:     'var(--color-gray-800)',
    border: 'var(--color-gray-300)',
  },
  brand: {
    bg:     'var(--color-brand-100)',
    fg:     'var(--color-brand-800)',
    border: 'var(--color-brand-300)',
  },
  success: {
    bg:     'var(--color-success-100)',
    fg:     'var(--color-success-800)',
    border: 'var(--color-success-300)',
  },
  warning: {
    bg:     'var(--color-warning-100)',
    fg:     'var(--color-warning-800)',
    border: 'var(--color-warning-300)',
  },
}

export default function MonoTagAtom({
  children,
  tone = 'neutral',
  size = 'sm',
  className = '',
  ...rest
}) {
  if (children === undefined || children === null || children === '') return null

  const config = TONE_CONFIG[tone] ?? TONE_CONFIG.neutral
  const sizeCls = SIZE_CLASS[size] ?? SIZE_CLASS.sm
  const label = typeof children === 'string' ? children : String(children)

  return (
    <span
      role="status"
      aria-label={`Identificador técnico ${label}`}
      style={{
        backgroundColor: config.bg,
        color:           config.fg,
        borderColor:     config.border,
        borderWidth:     '1px',
        borderStyle:     'solid',
      }}
      className={[
        'inline-flex items-center rounded-md font-mono whitespace-nowrap',
        sizeCls,
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}

/* ----------------------------------------------------------------
   Ejemplos:

   <MonoTagAtom>unifier</MonoTagAtom>
   <MonoTagAtom size="md" tone="brand">RoutineGen</MonoTagAtom>
   <MonoTagAtom tone="success">200 OK</MonoTagAtom>
---------------------------------------------------------------- */
