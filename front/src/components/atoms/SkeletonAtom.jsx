/**
 * <SkeletonAtom /> — Placeholder visual para estados de carga
 *
 * Bloque rectangular con animación de pulso que ocupa el espacio del
 * contenido real mientras se está cargando. Reduce el CLS percibido y
 * comunica progreso sin necesidad de spinners.
 *
 * Props:
 *   width     — número (px) o string CSS  (default: '100%')
 *   height    — número (px) o string CSS  (default: 16)
 *   rounded   — 'none' | 'sm' | 'md' | 'lg' | 'full'  (default: 'md')
 *   className — clases extra
 *
 * Accesibilidad:
 *   - aria-hidden="true" + role="presentation" (no aporta semántica;
 *     los lectores de pantalla deben anunciar el estado de carga via
 *     un live region a nivel de la vista contenedora).
 *   - Animación deshabilitada bajo `prefers-reduced-motion: reduce`
 *     gracias al variant `motion-reduce:animate-none` de Tailwind.
 */

const ROUNDED_CLASS = {
  none: 'rounded-none',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  full: 'rounded-full',
}

function toCssSize(value) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return `${value}px`
  return value
}

export default function SkeletonAtom({
  width = '100%',
  height = 16,
  rounded = 'md',
  className = '',
  style: styleProp,
  ...rest
}) {
  const style = {
    width: toCssSize(width),
    height: toCssSize(height),
    ...styleProp,
  }

  const classes = [
    'block bg-gray-200 animate-pulse motion-reduce:animate-none',
    ROUNDED_CLASS[rounded] ?? ROUNDED_CLASS.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={classes}
      style={style}
      {...rest}
    />
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   <SkeletonAtom width="60%" height={20} />
   <SkeletonAtom width={120} height={120} rounded="full" />
   <SkeletonAtom height={80} className="my-2" />
---------------------------------------------------------------- */
