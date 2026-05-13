/**
 * <SwitchAtom /> — Toggle MD3 con tokens de modo.
 *
 * Switch genérico con patrón Material Design 3: track (pista) + thumb (bola).
 * Mismo enfoque "overlay + peer" que `CheckboxAtom`: el `<input type="checkbox"
 * role="switch">` nativo es invisible pero interactivo y los hermanos visuales
 * reaccionan vía `peer-checked` / `peer-disabled` / `peer-focus`.
 *
 * Cuando está activo, usa `--mode-primary` (orange en tutor, brand en
 * profesional). Cuando está apagado, track gris. La transición de modo
 * recolorea el switch automáticamente al cambiar `data-mode`.
 *
 * Props:
 *   checked       — bool         estado controlado
 *   onChange      — (e) => void  handler de cambio
 *   disabled      — bool         deshabilita el control
 *   label         — string|node  label a la derecha (opcional)
 *   leadingLabel  — string|node  label a la izquierda (opcional)
 *   size          — 'sm' | 'md'  (default 'md')
 *   id            — string       id del input nativo
 *   className     — string       clases extra para el wrapper <label>
 *
 * A11y:
 *   - role="switch" implícito por el atributo HTML.
 *   - aria-checked + aria-disabled propagados desde el input nativo.
 *   - Space/Enter activan el toggle de forma nativa.
 */

import BoxAtom from './BoxAtom'

/* ── Tamaños: track (Tailwind) + thumb (px inline) + desplazamiento ──
 *
 * Dimensiones del thumb y desplazamiento van en px inline (no como utilities
 * Tailwind) por dos razones:
 *   1. Animación: `transform` nativo se interpola en todos los browsers;
 *      las utilities `translate-x-*` setean custom properties cuya
 *      interpolación CSS no está garantizada en Tailwind 4.
 *   2. Robustez: el JIT scanner de Tailwind 4 a veces omite clases poco
 *      usadas (`bg-white`, `w-3`...) que serían imprescindibles para que
 *      el thumb sea visible. Inline style sortea ese tree-shaking.
 */
const SIZE = {
  sm: { trackW: 'w-8',  trackH: 'h-4',  thumbPx: 12, translatePx: 16, edgePx: 2 },
  md: { trackW: 'w-10', trackH: 'h-5',  thumbPx: 16, translatePx: 20, edgePx: 2 },
}

/* ── Easing MD3 estándar y duración común para el thumb y el track ── */
const THUMB_TRANSITION = 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)'
const TRACK_TRANSITION = 'background-color 280ms cubic-bezier(0.4, 0, 0.2, 1)'

/* ── Sombras exteriores del thumb (dos capas para profundidad) ── */
const THUMB_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.10)'

const INPUT_CLASSES = [
  'peer',
  'absolute inset-0',
  'w-full h-full',
  'opacity-0',
  'z-10',
  'cursor-pointer',
  'disabled:cursor-not-allowed',
].join(' ')

export default function SwitchAtom({
  checked,
  onChange,
  disabled = false,
  label,
  leadingLabel,
  size = 'md',
  id,
  className = '',
  ...props
}) {
  const cfg = SIZE[size] || SIZE.md

  const trackClasses = [
    'absolute inset-0 rounded-full',
    'bg-gray-300',
    'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1',
    'peer-disabled:opacity-50',
  ].join(' ')

  // Wrapper del thumb: solo posicionamiento absoluto. Posición, tamaño y
  // animación van en inline style para no depender de utilities que el JIT
  // scanner pueda omitir.
  const thumbWrapperClasses = 'absolute motion-reduce:transition-none'

  // `translateY(-50%)` se mantiene constante; la X anima entre 0 y
  // `cfg.translatePx`. Ambos componentes en un único `transform` para que
  // el browser pueda interpolar la propiedad nativa.
  const thumbX = checked ? cfg.translatePx : 0
  // Sutil scale al activarse: refuerzo visual de feedback de toggle.
  const thumbScale = checked ? 1.05 : 1
  const thumbWrapperStyle = {
    top: '50%',
    left: `${cfg.edgePx}px`,
    transform: `translate(${thumbX}px, -50%) scale(${thumbScale})`,
    transition: THUMB_TRANSITION,
    willChange: 'transform',
    zIndex: 1,
  }

  const trackStyle = {
    transition: TRACK_TRANSITION,
    ...(checked ? { backgroundColor: 'var(--mode-primary)' } : {}),
  }

  // Thumb: TODAS las props visuales en inline para garantizar que el JIT
  // scanner de Tailwind no las pueda omitir.
  const thumbStyle = {
    width: `${cfg.thumbPx}px`,
    height: `${cfg.thumbPx}px`,
    backgroundColor: '#ffffff',
    borderRadius: '9999px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: THUMB_SHADOW,
    display: 'block',
  }

  return (
    <label
      className={[
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
    >
      {leadingLabel && (
        <span
          className={[
            'text-sm font-medium select-none transition-colors',
            checked ? 'text-gray-400' : 'text-gray-700',
          ].join(' ')}
          style={{ fontFamily: 'var(--mode-font-body)' }}
        >
          {leadingLabel}
        </span>
      )}

      <BoxAtom position="relative" shrink="0" className={[cfg.trackW, cfg.trackH].join(' ')}>
        <input
          type="checkbox"
          role="switch"
          id={id}
          checked={!!checked}
          onChange={onChange}
          disabled={disabled}
          aria-checked={!!checked}
          className={INPUT_CLASSES}
          {...props}
        />

        {/* Track */}
        <span
          aria-hidden="true"
          className={trackClasses}
          style={trackStyle}
        />

        {/* Thumb (animado con transform nativo en inline style) */}
        <span aria-hidden="true" className={thumbWrapperClasses} style={thumbWrapperStyle}>
          <span aria-hidden="true" style={thumbStyle} />
        </span>
      </BoxAtom>

      {label && (
        <span
          className={[
            'text-sm font-medium select-none transition-colors',
            checked ? 'text-gray-900' : 'text-gray-400',
          ].join(' ')}
          style={{ fontFamily: 'var(--mode-font-body)' }}
        >
          {label}
        </span>
      )}
    </label>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Toggle simple
   const [on, setOn] = useState(false)
   <SwitchAtom checked={on} onChange={(e) => setOn(e.target.checked)} />

   // Con labels a ambos lados (segmented-style)
   <SwitchAtom
     leadingLabel="Profesional"
     label="Tutor"
     checked={mode === 'tutor'}
     onChange={toggle}
   />

   // Tamaño compacto
   <SwitchAtom size="sm" checked={enabled} onChange={...} label="Notifications" />
---------------------------------------------------------------- */
