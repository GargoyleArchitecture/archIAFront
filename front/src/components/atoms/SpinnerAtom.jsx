/**
 * <SpinnerAtom /> — Indicador de carga circular animado
 *
 * Anillo rotativo para procesos asíncronos cortos (segundos a pocos minutos).
 * Para esperas largas con contexto visual del contenido faltante usa
 * <SkeletonAtom /> en su lugar.
 *
 * Props:
 *   size      — 'sm' | 'md' | 'lg'                       (default: 'md')
 *   intent    — 'primary' | 'neutral' | 'on-dark'        (default: 'primary')
 *   label     — string anunciado por lectores de pantalla (default: 'Cargando')
 *   className — clases extra
 *
 * Accesibilidad:
 *   - role="status" + aria-live="polite": anuncia el estado de carga.
 *   - El `label` se renderiza como texto visualmente oculto (sr-only) para que
 *     los lectores de pantalla tengan contenido que leer. Si necesitas texto
 *     visible "Generando…" ponlo junto al spinner en el componente padre.
 *   - Bajo `prefers-reduced-motion: reduce` el spin se detiene
 *     (`motion-reduce:animate-none`).
 *
 * Theming:
 *   El color de la corona viene de los tokens `--color-brand-*` (intent
 *   primary) o `--color-gray-*` (neutral); en `on-dark` la corona pasa a
 *   blanco sobre fondos oscuros.
 */

const SIZE_CONFIG = {
  sm: { box: 'w-4 h-4', border: 'border-2' },
  md: { box: 'w-8 h-8', border: 'border-[3px]' },
  lg: { box: 'w-12 h-12', border: 'border-4' },
}

const INTENT_CLASS = {
  primary: 'border-brand-600 border-t-transparent',
  neutral: 'border-gray-400 border-t-transparent',
  'on-dark': 'border-white border-t-transparent',
}

export default function SpinnerAtom({
  size = 'md',
  intent = 'primary',
  label = 'Cargando',
  className = '',
  ...rest
}) {
  const sizeCfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.md
  const intentCls = INTENT_CLASS[intent] ?? INTENT_CLASS.primary

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={[
        'inline-block align-middle',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={[
          'block rounded-full animate-spin motion-reduce:animate-none',
          sizeCfg.box,
          sizeCfg.border,
          intentCls,
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   <SpinnerAtom />
   <SpinnerAtom size="sm" />
   <SpinnerAtom size="lg" intent="on-dark" label="Generando reto" />
---------------------------------------------------------------- */
