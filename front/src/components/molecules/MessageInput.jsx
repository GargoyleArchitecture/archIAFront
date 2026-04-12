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

      {/* Contenedor del input con focus ring compuesto */}
      <BoxAtom display="flex" align="end" gap="2" bg="white" border="gray-300" rounded="lg" px="3" py="2" shadow="xs" className="focus-within:border-brand-500 focus-within:shadow-focus-primary transition-shadow transition-colors duration-150">

        {/* Acción secundaria izquierda (ej: adjuntar archivo) */}
        {leadingAction && (
          <BoxAtom shrink="0" className="self-end">{leadingAction}</BoxAtom>
        )}

        {/* Textarea auto-resize */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{ maxHeight: `${maxRows * 1.5}rem` }}
          className={[
            'flex-1 resize-none outline-none bg-transparent',
            'text-body-sm font-sans text-gray-900',
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
      </BoxAtom>

      {/* Hint */}
      {hint ? (
        <TextAtom variant="text-xs" className="text-gray-400 px-1">
          {hint}
        </TextAtom>
      ) : (
        <TextAtom variant="text-xs" className="text-gray-400 px-1">
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
