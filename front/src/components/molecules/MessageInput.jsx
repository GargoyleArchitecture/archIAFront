/**
 * <MessageInput /> — Input principal del chat de IA
 *
 * Textarea de auto-resize con botón de envío integrado.
 * El estado del texto es interno (uncontrolled desde el exterior).
 *
 * Props:
 *   onSend      — function(string)   Llamado con el texto al enviar
 *   placeholder — string             Texto de placeholder
 *   hint        — string             Ayuda debajo del input
 *   disabled    — bool               Bloquea el campo y el botón
 *   maxRows     — number             Máximo de líneas antes de scroll (default 6)
 *   className   — string             Clases adicionales para el wrapper
 */

import { useState, useRef, useEffect } from 'react'
import SendIcon from '@mui/icons-material/Send'
import BoxAtom    from '../atoms/BoxAtom'
import ButtonAtom from '../atoms/ButtonAtom'
import TextAtom   from '../atoms/TextAtom'
import { FOCUS_INPUT_EVENT } from '../../hooks/useKeyboardShortcuts'

export default function MessageInput({
  onSend,
  placeholder    = 'Escribe un mensaje…',
  hint,
  disabled       = false,
  maxRows        = 6,
  leadingAction  = null,
  className      = '',
  ...props
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  /* ----------------------------------------------------------------
     Auto-resize del textarea según el contenido
     Se usa style inline para la altura máxima porque depende
     de una prop dinámica (maxRows) — no se puede hacer con clase.
  ---------------------------------------------------------------- */
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  /* ----------------------------------------------------------------
     F6-T5: escucha el atajo global Ctrl/Cmd+K para enfocar el input.
     El hook useKeyboardShortcuts dispara FOCUS_INPUT_EVENT en window;
     aquí lo escuchamos y enfocamos el textarea. Si hay múltiples
     instancias de MessageInput montadas, todas reaccionan — la última
     en el orden de montaje gana el foco (comportamiento aceptable).
  ---------------------------------------------------------------- */
  useEffect(() => {
    const handler = () => {
      textareaRef.current?.focus()
    }
    window.addEventListener(FOCUS_INPUT_EVENT, handler)
    return () => window.removeEventListener(FOCUS_INPUT_EVENT, handler)
  }, [])

  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend?.(value.trim())
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <BoxAtom display="flex" direction="col" className={['gap-1.5', className].filter(Boolean).join(' ')} {...props}>

      {/* F6-T3 / F6-T4: contenedor del input con tokens --mode-input-*.
          Focus ring se aplica vía onFocusCapture/onBlurCapture (color
          consistente con el modo activo, sin depender de Tailwind). */}
      <div
        className="theme-transition flex items-end gap-2 rounded-lg px-3 py-2 shadow-xs"
        style={{
          backgroundColor: 'var(--mode-input-bg)',
          border: '1px solid var(--mode-input-border)',
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--mode-input-border-focus)'
          e.currentTarget.style.boxShadow =
            '0 0 0 4px color-mix(in srgb, var(--mode-input-border-focus) 20%, transparent)'
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--mode-input-border)'
          e.currentTarget.style.boxShadow = ''
        }}
      >

        {/* Acción secundaria izquierda (ej: adjuntar archivo) */}
        {leadingAction && (
          <BoxAtom shrink="0" className="self-end">{leadingAction}</BoxAtom>
        )}

        {/* Textarea auto-resize — la tipografía sigue --mode-font-body */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            maxHeight: `${maxRows * 1.5}rem`,
            fontFamily: 'var(--mode-font-body)',
            fontSize: 'var(--mode-text-body)',
            lineHeight: 'var(--mode-leading-body)',
            color: 'var(--mode-on-surface)',
          }}
          className={[
            'flex-1 resize-none outline-none bg-transparent',
            'placeholder:text-gray-400',
            'disabled:text-gray-400',
            'overflow-y-auto py-0.5',
          ].join(' ')}
        />

        {/* Botón de envío */}
        <ButtonAtom
          variant="icon"
          intent="primary"
          size="xs"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Enviar mensaje"
          className="flex-shrink-0 self-end"
        >
          <SendIcon />
        </ButtonAtom>
      </div>

      {/* Hint — usa el color secundario del modo activo */}
      {hint ? (
        <TextAtom
          variant="text-xs"
          className="px-1"
          style={{ color: 'var(--mode-text-secondary)' }}
        >
          {hint}
        </TextAtom>
      ) : (
        <TextAtom
          variant="text-xs"
          className="px-1"
          style={{ color: 'var(--mode-text-secondary)' }}
        >
          Enter para enviar · Shift+Enter nueva línea
        </TextAtom>
      )}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Básico
   <MessageInput onSend={(msg) => sendToAI(msg)} />

   // Con hint personalizado y máximo de líneas
   <MessageInput
     onSend={handleSend}
     placeholder="Describe tu diagrama de arquitectura…"
     hint="Sé específico sobre los componentes y sus relaciones."
     maxRows={4}
   />

   // Deshabilitado mientras la IA procesa
   <MessageInput
     onSend={handleSend}
     disabled={isLoading}
     placeholder="La IA está respondiendo…"
   />
---------------------------------------------------------------- */
