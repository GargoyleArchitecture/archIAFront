/**
 * <Chips /> — Etiqueta interactiva o de estado
 *
 * Versátil: funciona como tag de estado (no interactivo), como
 * chip seleccionable (onClick) o como chip removible (removable).
 *
 * Props:
 *   label     — string    Texto visible del chip (obligatorio)
 *   variant   — 'default' | 'brand' | 'success' | 'warning' | 'error' | 'secondary'
 *   size      — 'sm' | 'md'
 *   removable — bool      Muestra botón × para eliminar
 *   onRemove  — function  Llamado al hacer click en ×
 *   onClick   — function  Hace el chip interactivo/seleccionable
 *   selected  — bool      Estado visual seleccionado (fondo más oscuro)
 *   icon      — ReactNode Icono líder
 *   disabled  — bool      Sin interacción, opacidad reducida
 *   className — string    Clases adicionales
 */

/* ----------------------------------------------------------------
   Mapeo variant → clases de color en estado normal y seleccionado
---------------------------------------------------------------- */
const VARIANT_CLASS = {
  default:   'bg-gray-100   text-gray-700   border-gray-200',
  brand:     'bg-brand-50   text-brand-700  border-brand-200',
  success:   'bg-success-50 text-success-700 border-success-200',
  warning:   'bg-warning-50 text-warning-700 border-warning-200',
  error:     'bg-error-50   text-error-700  border-error-200',
  secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200',
}

const SELECTED_VARIANT_CLASS = {
  default:   'bg-gray-200   border-gray-400',
  brand:     'bg-brand-100  border-brand-400',
  success:   'bg-success-100 border-success-400',
  warning:   'bg-warning-100 border-warning-400',
  error:     'bg-error-100  border-error-400',
  secondary: 'bg-secondary-100 border-secondary-400',
}

/* ----------------------------------------------------------------
   Mapeo size → padding, tipografía y tamaño del icono SVG
---------------------------------------------------------------- */
const SIZE_CLASS = {
  sm: 'px-2 py-0.5 text-body-xs gap-1 [&_svg]:w-3 [&_svg]:h-3',
  md: 'px-2.5 py-1 text-body-sm gap-1.5 [&_svg]:w-4 [&_svg]:h-4',
}

const BASE_CLASSES = [
  'inline-flex items-center rounded-full border',
  'font-medium font-sans',
  'transition-colors duration-150 select-none',
].join(' ')

export default function Chips({
  label,
  variant   = 'default',
  size      = 'md',
  removable = false,
  onRemove,
  onClick,
  selected  = false,
  icon,
  disabled  = false,
  className = '',
  ...props
}) {
  const isInteractive = Boolean(onClick)
  const Tag = isInteractive ? 'button' : 'span'

  const colorClasses = selected
    ? SELECTED_VARIANT_CLASS[variant]
    : VARIANT_CLASS[variant]

  const classes = [
    BASE_CLASSES,
    SIZE_CLASS[size],
    colorClasses,
    isInteractive ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:shadow-focus-primary' : '',
    disabled      ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag
      className={classes}
      onClick={isInteractive ? onClick : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {label}

      {removable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className="ml-0.5 -mr-0.5 rounded-full leading-none hover:opacity-60 transition-opacity focus:outline-none"
          aria-label={`Eliminar ${label}`}
          tabIndex={0}
        >
          ×
        </button>
      )}
    </Tag>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Chip de estado (no interactivo)
   <Chips label="Activo"    variant="success" />
   <Chips label="Pendiente" variant="warning" />
   <Chips label="Error"     variant="error"   />

   // Chip de tecnología (brand)
   <Chips label="React"  variant="brand" size="sm" />
   <Chips label="Docker" variant="brand" size="sm" />

   // Chip seleccionable (filtro)
   <Chips
     label="Microservicios"
     variant="brand"
     onClick={() => setSelected(!selected)}
     selected={selected}
   />

   // Chip removible (tag añadido)
   <Chips
     label="arquia-v2"
     variant="secondary"
     removable
     onRemove={() => removeTag('arquia-v2')}
   />

   // Chip con icono líder
   import StarIcon from '@mui/icons-material/Star'
   <Chips label="Favorito" variant="warning" icon={<StarIcon />} />
---------------------------------------------------------------- */
