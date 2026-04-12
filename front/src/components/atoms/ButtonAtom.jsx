/**
 * <ButtonAtom /> — Botón polimórfico con 3 variantes de layout
 *
 * Props:
 *   variant      — 'text' | 'icon' | 'text-icon'
 *                  text      → solo texto
 *                  icon      → solo icono, forma cuadrada
 *                  text-icon → texto + icono (usa iconPosition)
 *   intent       — 'primary' | 'secondary' | 'ghost' | 'danger'
 *   size         — 'xs' | 'sm' | 'md' | 'lg'
 *   iconPosition — 'leading' | 'trailing'  (solo para variant='text-icon')
 *   icon         — Elemento React del icono, ej: <SendIcon />
 *   as           — Elemento HTML a renderizar: 'button' | 'a' | etc.
 *   disabled     — Deshabilita el botón
 *   className    — Clases Tailwind adicionales
 *   children     — Texto del botón (ignorado en variant='icon')
 */

/* ----------------------------------------------------------------
   Mapeo size → padding, tipografía y tamaño de icono SVG
   [&_svg] selecciona el SVG interno de los iconos MUI
   gap-* separa el icono del texto en variante text-icon
---------------------------------------------------------------- */
const SIZE_CLASS = {
  xs: 'px-2 py-1   text-body-xs gap-1   [&_svg]:w-3 [&_svg]:h-3',
  sm: 'px-3 py-2   text-body-sm gap-1.5 [&_svg]:w-4 [&_svg]:h-4',
  md: 'px-4 py-2.5 text-body-sm gap-2   [&_svg]:w-5 [&_svg]:h-5',
  lg: 'px-6 py-3   text-body-md gap-2   [&_svg]:w-5 [&_svg]:h-5',
}

/* ----------------------------------------------------------------
   Mapeo size para variante 'icon' (padding simétrico → cuadrado)
---------------------------------------------------------------- */
const ICON_SIZE_CLASS = {
  xs: 'p-1.5 [&_svg]:w-3.5 [&_svg]:h-3.5',
  sm: 'p-2   [&_svg]:w-4   [&_svg]:h-4',
  md: 'p-2.5 [&_svg]:w-5   [&_svg]:h-5',
  lg: 'p-3   [&_svg]:w-5   [&_svg]:h-5',
}

/* ----------------------------------------------------------------
   Mapeo intent → color, hover, active y focus ring
   secondary = outlined brand (no naranja — la paleta secondary
   es para acentos decorativos, no botones principales)
---------------------------------------------------------------- */
const INTENT_CLASS = {
  primary: [
    'bg-brand-600 text-white border-brand-600',
    'hover:bg-brand-700 hover:border-brand-700',
    'active:bg-brand-800',
    'focus:shadow-focus-primary',
  ].join(' '),

  secondary: [
    'bg-white text-brand-700 border-brand-300',
    'hover:bg-brand-50 hover:border-brand-400',
    'active:bg-brand-100',
    'focus:shadow-focus-primary',
  ].join(' '),

  ghost: [
    'bg-transparent text-gray-700 border-gray-300',
    'hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400',
    'active:bg-gray-200',
    'focus:shadow-focus-gray',
  ].join(' '),

  danger: [
    'bg-error-600 text-white border-error-600',
    'hover:bg-error-700 hover:border-error-700',
    'active:bg-error-800',
    'focus:shadow-focus-error',
  ].join(' '),
}

/* ----------------------------------------------------------------
   Clases base compartidas por todas las variantes e intents
---------------------------------------------------------------- */
const BASE_CLASSES = [
  'inline-flex items-center justify-center',
  'rounded-md',
  'border',
  'font-medium font-sans',
  'outline-none',
  'transition-colors transition-shadow duration-150',
  'cursor-pointer select-none',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
].join(' ')

export default function ButtonAtom({
  as           = 'button',
  variant      = 'text',
  intent       = 'primary',
  size         = 'md',
  iconPosition = 'leading',
  icon,
  disabled     = false,
  className    = '',
  children,
  ...props
}) {
  const Tag = as

  const sizeClasses = variant === 'icon'
    ? ICON_SIZE_CLASS[size]
    : SIZE_CLASS[size]

  const classes = [
    BASE_CLASSES,
    sizeClasses,
    INTENT_CLASS[intent],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Contenido interno según la variante
  const renderContent = () => {
    if (variant === 'icon') {
      return icon ?? children
    }
    if (variant === 'text') {
      return children
    }
    // variant === 'text-icon'
    return iconPosition === 'trailing'
      ? <>{children}{icon}</>
      : <>{icon}{children}</>
  }

  return (
    <Tag
      className={classes}
      disabled={as === 'button' ? disabled : undefined}
      aria-disabled={as !== 'button' && disabled ? true : undefined}
      {...props}
    >
      {renderContent()}
    </Tag>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Botón primario de texto
   <ButtonAtom intent="primary" size="md">
     Enviar
   </ButtonAtom>

   // Botón outlined (secondary)
   <ButtonAtom intent="secondary">
     Cancelar
   </ButtonAtom>

   // Botón con icono leading (text-icon)
   import SendIcon from '@mui/icons-material/Send'
   <ButtonAtom variant="text-icon" intent="primary" icon={<SendIcon />}>
     Enviar mensaje
   </ButtonAtom>

   // Botón con icono trailing
   import ChevronRightIcon from '@mui/icons-material/ChevronRight'
   <ButtonAtom variant="text-icon" intent="ghost" iconPosition="trailing" icon={<ChevronRightIcon />}>
     Ver más
   </ButtonAtom>

   // Botón solo icono (cuadrado, con aria-label para accesibilidad)
   import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
   <ButtonAtom variant="icon" intent="danger" size="sm" aria-label="Eliminar">
     <DeleteOutlineIcon />
   </ButtonAtom>

   // Botón como enlace
   <ButtonAtom as="a" href="/dashboard" intent="ghost">
     Ir al panel
   </ButtonAtom>

   // Botón deshabilitado
   <ButtonAtom disabled intent="primary">
     Procesando...
   </ButtonAtom>
---------------------------------------------------------------- */
