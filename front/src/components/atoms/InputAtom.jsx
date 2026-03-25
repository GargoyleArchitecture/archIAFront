/**
 * <InputAtom /> — Campo de texto base
 *
 * Props:
 *   size      — 'sm' | 'md' | 'lg'  (altura y padding del input)
 *   state     — 'default' | 'error' | 'disabled'
 *   fullWidth — Si es true, el input ocupa el 100% del contenedor
 *   id        — ID para vinculación con LabelAtom via htmlFor
 *   placeholder — Texto de placeholder
 *   className — Clases Tailwind adicionales
 *   disabled  — Prop HTML nativo; sobrescribe state a 'disabled' automáticamente
 */

/* ----------------------------------------------------------------
   Mapeo size → clases de padding y font-size
   sm: padding vertical 8px,  texto body-sm (14px)
   md: padding vertical 10px, texto body-md (16px)  ← default
   lg: padding vertical 14px, texto body-lg (18px)
---------------------------------------------------------------- */
const SIZE_CLASS = {
  sm: 'py-2   px-3 text-body-sm',
  md: 'py-2.5 px-3 text-body-md',
  lg: 'py-3.5 px-3 text-body-lg',
}

/* ----------------------------------------------------------------
   Mapeo state → clases de borde, fondo, color y focus ring
---------------------------------------------------------------- */
const STATE_CLASS = {
  default: [
    'border border-gray-300',
    'bg-white',
    'text-gray-900 placeholder:text-gray-400',
    'focus:border-brand-500 focus:shadow-focus-primary',
  ].join(' '),

  error: [
    'border border-error-500',
    'bg-white',
    'text-gray-900 placeholder:text-gray-400',
    'focus:border-error-500 focus:shadow-focus-error',
  ].join(' '),

  disabled: [
    'border border-gray-200',
    'bg-gray-50',
    'text-gray-400 placeholder:text-gray-300',
    'cursor-not-allowed opacity-60',
  ].join(' '),
}

/* ----------------------------------------------------------------
   Clases base compartidas por todos los estados
---------------------------------------------------------------- */
const BASE_CLASSES = [
  'rounded-md',
  'shadow-xs',
  'outline-none',
  'transition-shadow transition-colors duration-150',
  'font-sans',
].join(' ')

export default function InputAtom({
  size      = 'md',
  state     = 'default',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  // Si el prop `disabled` nativo está presente, fuerza estado disabled
  const resolvedState = disabled ? 'disabled' : state

  const classes = [
    BASE_CLASSES,
    SIZE_CLASS[size],
    STATE_CLASS[resolvedState],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <input
      className={classes}
      disabled={resolvedState === 'disabled'}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Input básico con label
   <LabelAtom htmlFor="email" required>Correo</LabelAtom>
   <InputAtom id="email" type="email" placeholder="tu@email.com" fullWidth />

   // Input con error
   <InputAtom state="error" placeholder="Campo requerido" fullWidth />

   // Input deshabilitado (via prop nativo)
   <InputAtom disabled placeholder="No editable" size="lg" />

   // Input pequeño en línea
   <InputAtom size="sm" placeholder="Buscar..." />
---------------------------------------------------------------- */
