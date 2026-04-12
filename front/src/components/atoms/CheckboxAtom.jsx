/**
 * <CheckboxAtom /> — Checkbox personalizado con estilos del design system
 *
 * Técnica: overlay con modificador `peer` de Tailwind.
 * El input nativo es opacity-0 pero sigue siendo interactivo
 * (clicks, teclado, lectores de pantalla). Un <span> hermano
 * actúa como caja visual y reacciona vía peer-checked/peer-focus.
 *
 * Props:
 *   label         — Texto de etiqueta junto al checkbox (opcional)
 *   checked       — Estado controlado (recomendado: siempre controlado)
 *   onChange      — Handler de cambio (e) => void
 *   indeterminate — Estado intermedio "seleccionar algunos" (solo JS)
 *   disabled      — Deshabilita el checkbox
 *   id            — ID del input nativo para vínculos externos
 *   className     — Clases adicionales para el wrapper <label>
 *   children      — Alternativa a label prop para contenido rico
 *
 * Nota: El estado `indeterminate` no existe como atributo HTML,
 * se aplica solo vía la propiedad JS `.indeterminate` del input.
 * Por ello el icono visual del estado se controla con JS, no CSS.
 */

import { useRef, useEffect } from 'react'
import BoxAtom from './BoxAtom'

/* ----------------------------------------------------------------
   Input nativo: ocupa todo el div contenedor (absolute inset-0),
   es invisible (opacity-0) pero interactivo (z-10).
   La clase `peer` habilita peer-* en el span hermano.
---------------------------------------------------------------- */
const INPUT_CLASSES = [
  'peer',
  'absolute inset-0',
  'w-full h-full',
  'opacity-0',
  'z-10',
  'cursor-pointer',
  'disabled:cursor-not-allowed',
].join(' ')

/* ----------------------------------------------------------------
   Span overlay: la caja visual del checkbox.
   Responde al estado del peer (input nativo) via peer-* modifiers.
   Los iconos SVG se renderizan dentro con JS (no son siblings del
   peer, por lo que no pueden usar peer-checked directamente).
---------------------------------------------------------------- */
const OVERLAY_CLASSES = [
  'absolute inset-0',
  'rounded-sm',
  'border border-gray-300 bg-white',
  // Estado checked
  'peer-checked:bg-brand-600 peer-checked:border-brand-600',
  // Focus ring
  'peer-focus:shadow-focus-primary',
  // Disabled
  'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
  // Transición
  'transition-colors transition-shadow duration-150',
  // Centrado del icono interno
  'flex items-center justify-center',
].join(' ')

export default function CheckboxAtom({
  label,
  checked,
  onChange,
  indeterminate = false,
  disabled      = false,
  id,
  className     = '',
  children,
  ...props
}) {
  const inputRef = useRef(null)

  // El estado indeterminate solo se puede establecer via propiedad JS,
  // no existe un atributo HTML equivalente.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const wrapperClasses = [
    'inline-flex items-start gap-2',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // El estado visual del overlay cuando está indeterminate sobrescribe
  // el peer-checked para mostrar el color brand aunque checked sea false.
  const overlayClasses = [
    OVERLAY_CLASSES,
    indeterminate ? 'bg-brand-600 border-brand-600' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={wrapperClasses}>
      {/* Contenedor relativo: establece el contexto de posicionamiento */}
      <BoxAtom position="relative" shrink="0" className="w-4 h-4 mt-0.5">
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={INPUT_CLASSES}
          {...props}
        />

        {/* Caja visual: responde al peer (input) */}
        <span className={overlayClasses} aria-hidden="true">
          {/* Icono controlado por JS: check o guion según estado */}
          {indeterminate && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path
                d="M2 6h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {!indeterminate && checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </BoxAtom>

      {/* Texto de la etiqueta */}
      {(label || children) && (
        <span className="text-body-sm font-sans text-gray-700 select-none">
          {label ?? children}
        </span>
      )}
    </label>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Checkbox controlado básico
   const [agreed, setAgreed] = useState(false)
   <CheckboxAtom
     checked={agreed}
     onChange={(e) => setAgreed(e.target.checked)}
     label="Acepto los términos y condiciones"
   />

   // Estado indeterminate (seleccionar todos)
   const allSelected  = items.every(i => i.selected)
   const someSelected = items.some(i => i.selected)
   <CheckboxAtom
     checked={allSelected}
     indeterminate={someSelected && !allSelected}
     onChange={handleSelectAll}
     label="Seleccionar todos"
   />

   // Con contenido rico como children
   <CheckboxAtom checked={accepted} onChange={(e) => setAccepted(e.target.checked)}>
     Acepto los <a href="/terms" className="text-brand-600 underline">términos</a>
   </CheckboxAtom>

   // Deshabilitado
   <CheckboxAtom disabled checked={false} onChange={() => {}} label="Opción no disponible" />

   // Sin etiqueta (accesibilidad via aria-label externo)
   <CheckboxAtom
     checked={selected}
     onChange={handleChange}
     aria-label="Seleccionar fila"
   />
---------------------------------------------------------------- */
