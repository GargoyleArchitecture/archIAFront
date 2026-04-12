/**
 * <TooltipAtom /> — Contenedor flotante de información contextual
 *
 * Envuelve cualquier elemento hijo (trigger) y muestra una etiqueta
 * flotante al hacer hover o focus. Usa ReactDOM.createPortal para
 * renderizar el tooltip directamente en <body>, garantizando que siempre
 * quede encima de cualquier contenedor con overflow:hidden, z-index o
 * stacking context propio — nunca será recortado.
 *
 * Props:
 *   content   — string    Texto del tooltip (obligatorio)
 *   position  — 'top' | 'right' | 'bottom' | 'left'   (default: 'top')
 *   className — string    Clases adicionales para el wrapper inline
 *   children  — ReactNode Elemento trigger que activa el tooltip
 *
 * Notas de uso:
 *   - El trigger debe recibir foco o hover (button, a, input, etc.)
 *   - La posición se calcula con getBoundingClientRect() en cada hover,
 *     así funciona correctamente aunque el trigger sea scrolleable
 *   - `pointer-events-none` en el tooltip evita interferencias de hover
 */

import { useState, useRef } from 'react'
import { createPortal }     from 'react-dom'

/* ----------------------------------------------------------------
   Calcula el estilo `position: fixed` del tooltip según la posición
   deseada respecto al rectángulo del trigger (DOMRect).
   OFFSET — separación en px entre el borde del trigger y el tooltip.
---------------------------------------------------------------- */
const OFFSET = 6

function computeStyle(rect, position) {
  switch (position) {
    case 'top':
      return {
        top:       rect.top    - OFFSET,
        left:      rect.left   + rect.width  / 2,
        transform: 'translate(-50%, -100%)',
      }
    case 'bottom':
      return {
        top:       rect.bottom + OFFSET,
        left:      rect.left   + rect.width  / 2,
        transform: 'translate(-50%, 0)',
      }
    case 'right':
      return {
        top:       rect.top    + rect.height / 2,
        left:      rect.right  + OFFSET,
        transform: 'translate(0, -50%)',
      }
    case 'left':
      return {
        top:       rect.top    + rect.height / 2,
        left:      rect.left   - OFFSET,
        transform: 'translate(-100%, -50%)',
      }
    default:
      return {}
  }
}

/* Clases del globo de contenido */
const TOOLTIP_CLS = [
  'bg-gray-900 text-white',
  'text-body-xs font-medium font-sans',
  'rounded-md px-2 py-1',
  'shadow-sm whitespace-nowrap',
].join(' ')

/* ================================================================
   Componente principal
================================================================ */
export default function TooltipAtom({
  content,
  position  = 'top',
  className = '',
  children,
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const [style,   setStyle]   = useState({})
  const wrapperRef = useRef(null)

  const showTooltip = () => {
    if (!wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setStyle(computeStyle(rect, position))
    setVisible(true)
  }

  const hideTooltip = () => setVisible(false)

  return (
    <span
      ref={wrapperRef}
      className={['inline-flex', className].filter(Boolean).join(' ')}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}

      {visible && createPortal(
        <span
          role="tooltip"
          aria-hidden="true"
          style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none', ...style }}
          className={TOOLTIP_CLS}
        >
          {content}
        </span>,
        document.body,
      )}
    </span>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Tooltip sobre un botón (posición top — default)
   <TooltipAtom content="Enviar mensaje">
     <ButtonAtom variant="icon" intent="primary" aria-label="Enviar">
       <SendIcon />
     </ButtonAtom>
   </TooltipAtom>

   // Tooltip a la derecha — útil para sidebar colapsado
   <TooltipAtom content="Proyectos" position="right">
     <ButtonAtom variant="icon" intent="ghost" aria-label="Proyectos">
       <FolderOpenIcon />
     </ButtonAtom>
   </TooltipAtom>

   // Tooltip inferior sobre texto
   <TooltipAtom content="Última modificación: 12 feb 2026" position="bottom">
     <TextAtom variant="text-sm" className="cursor-help underline decoration-dotted">
       Hace 3 días
     </TextAtom>
   </TooltipAtom>

   // Tooltip a la izquierda
   <TooltipAtom content="Eliminar selección" position="left">
     <ButtonAtom variant="icon" intent="danger" size="sm" aria-label="Eliminar">
       <DeleteOutlineIcon />
     </ButtonAtom>
   </TooltipAtom>
---------------------------------------------------------------- */
