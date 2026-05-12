/**
 * F10-T2: ConceptPillAtom — Pill semántico para conceptos arquitectónicos
 *
 * Tipo pill con tipografía sans (a diferencia de MonoTagAtom). Usado para
 * nombrar ideas, patrones, principios, atributos de calidad. Ligero,
 * sin metadata adicional (a diferencia de StrengthChip).
 *
 * Si se proporciona `onClick`, se renderiza como <button> con foco
 * accesible; sin onClick, como <span role="status">.
 *
 * Props:
 *   children  — ReactNode (requerido)
 *   intent    — 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
 *               (default: 'neutral')
 *   size      — 'sm' | 'md' | 'lg'  (default: 'md')
 *   onClick   — function?  Si presente, renderiza como botón.
 *   selected  — bool       Para variantes interactivas (aria-pressed).
 *   className — string
 */

const SIZE_CLASS = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-md px-3 py-1.5 gap-2',
}

const INTENT_STYLE = {
  neutral: {
    bg:     'var(--color-gray-100)',
    fg:     'var(--color-gray-800)',
    border: 'var(--color-gray-300)',
  },
  primary: {
    bg:     'var(--mode-primary-container, var(--color-brand-100))',
    fg:     'var(--mode-on-primary-container, var(--color-brand-900))',
    border: 'var(--mode-outline, var(--color-brand-300))',
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
  danger: {
    bg:     'var(--color-error-100)',
    fg:     'var(--color-error-800)',
    border: 'var(--color-error-300)',
  },
}

export default function ConceptPillAtom({
  children,
  intent = 'neutral',
  size = 'md',
  onClick,
  selected = false,
  className = '',
  ...rest
}) {
  if (children === undefined || children === null || children === '') return null

  const style = INTENT_STYLE[intent] ?? INTENT_STYLE.neutral
  const sizeCls = SIZE_CLASS[size] ?? SIZE_CLASS.md
  const label = typeof children === 'string' ? children : String(children)

  const baseStyle = {
    backgroundColor: style.bg,
    color:           style.fg,
    borderColor:     style.border,
    borderWidth:     '1px',
    borderStyle:     'solid',
  }

  const baseClass = [
    'inline-flex items-center rounded-full font-medium font-sans whitespace-nowrap',
    'theme-transition',
    sizeCls,
    className,
  ].filter(Boolean).join(' ')

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`Concepto ${label}`}
        style={{
          ...baseStyle,
          cursor: 'pointer',
          opacity: selected ? 1 : 0.92,
        }}
        className={[baseClass, 'hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-1'].join(' ')}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <span
      role="status"
      aria-label={`Concepto ${label}`}
      style={baseStyle}
      className={baseClass}
      {...rest}
    >
      {children}
    </span>
  )
}

/* ----------------------------------------------------------------
   Ejemplos:

   <ConceptPillAtom>SOLID</ConceptPillAtom>
   <ConceptPillAtom intent="primary" size="lg">Microservices</ConceptPillAtom>
   <ConceptPillAtom intent="warning" onClick={() => filter('cache')}>
     Cache
   </ConceptPillAtom>
---------------------------------------------------------------- */
