/**
 * <BubbleMessage /> — Burbuja de mensaje de chat (con theming dual F6-T3 / F6-T4)
 *
 * Dos variantes según el emisor:
 *   user — Derecha, fondo `--mode-bubble-bg-user`, esquina inferior-derecha pequeña.
 *   ai   — Izquierda, fondo `--mode-bubble-bg-ai` con borde `--mode-bubble-border-ai`,
 *          esquina inferior-izquierda pequeña + slot opcional de avatar.
 *
 * Theming:
 *   - Padding, max-width, font-family, line-height y font-size se leen de
 *     tokens `--mode-*` que cambian con `data-mode` en <html>.
 *   - Tutor: padding 24px, serif, line-height generoso, max 75%.
 *   - Professional: padding 12px, monospace, line-height denso, max 85%.
 *   - Transición suave (200ms) vía clase `theme-transition` global.
 *
 * Props:
 *   variant    — 'user' | 'ai'
 *   children   — ReactNode
 *   isLoading  — bool        Indicador de escritura
 *   noTextWrap — bool        Si true, NO envuelve children en <div> tipográfico
 *                            (útil cuando children ya es <MarkdownRenderer />)
 *   avatar     — ReactNode   Solo aplicable a variante 'ai'
 *   timestamp  — string
 *   className  — string
 */

import BoxAtom  from '../atoms/BoxAtom'
import TextAtom from '../atoms/TextAtom'

/* ----------------------------------------------------------------
   Indicador "el agente está procesando" — dots en color de modo +
   etiqueta textual. Reemplaza el skeleton sutil anterior porque
   resultaba indistinguible de un bloque vacío.
---------------------------------------------------------------- */
function TypingIndicator() {
  return (
    <BoxAtom
      display="flex"
      align="center"
      gap="3"
      py="1"
      role="status"
      aria-live="polite"
      aria-label="El agente está generando una respuesta"
    >
      <BoxAtom display="flex" align="center" gap="1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce motion-reduce:animate-none"
            style={{
              backgroundColor: 'var(--mode-primary)',
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </BoxAtom>
      <span
        className="text-sm"
        style={{
          color: 'var(--mode-text-secondary)',
          fontFamily: 'var(--mode-font-body)',
        }}
      >
        Generando respuesta…
      </span>
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Mapeo variant → wrapper + estilos derivados de tokens --mode-*
---------------------------------------------------------------- */
const ROW_JUSTIFY = {
  user: 'end',
  ai:   'start',
}

const BUBBLE_RADIUS = {
  user: 'rounded-lg rounded-br-sm',
  ai:   'rounded-lg rounded-bl-sm',
}

const TIMESTAMP_CLASS = {
  user: 'text-right',
  ai:   'text-left',
}

/**
 * Construye el `style` inline de la burbuja desde tokens --mode-*.
 * Usar inline en lugar de clases Tailwind con arbitrary values nos asegura
 * reactividad 1:1 al cambio de `data-mode` sin escape-hatches.
 */
function bubbleStyle(variant) {
  const base = {
    backgroundColor:
      variant === 'user'
        ? 'var(--mode-bubble-bg-user)'
        : 'var(--mode-bubble-bg-ai)',
    color: 'var(--mode-on-surface)',
    padding: 'var(--mode-bubble-padding)',
    maxWidth: 'var(--mode-bubble-max-width)',
  }
  if (variant === 'ai') {
    base.border = '1px solid var(--mode-bubble-border-ai)'
  }
  return base
}

const TYPOGRAPHY_STYLE = {
  fontFamily: 'var(--mode-font-body)',
  lineHeight: 'var(--mode-leading-body)',
  fontSize: 'var(--mode-text-body)',
}

export default function BubbleMessage({
  variant    = 'ai',
  children,
  isLoading  = false,
  noTextWrap = false,
  avatar,
  timestamp,
  className  = '',
  ...props
}) {
  return (
    <BoxAtom
      display="flex"
      direction="col"
      w="full"
      gap="1"
      className={className}
      {...props}
    >

      {/* Fila con avatar (AI) + burbuja */}
      <BoxAtom display="flex" align="end" justify={ROW_JUSTIFY[variant]} gap="2" w="full">

        {/* Avatar — solo para variante AI */}
        {variant === 'ai' && avatar && (
          <BoxAtom rounded="full" overflow="hidden" shrink="0" bg="gray-200" className="w-8 h-8 self-end">
            {avatar}
          </BoxAtom>
        )}

        {/* Burbuja de mensaje — theme-transition para animación suave entre modos */}
        <div
          data-variant={variant}
          className={['theme-transition shadow-xs', BUBBLE_RADIUS[variant]].join(' ')}
          style={{
            ...bubbleStyle(variant),
            minHeight: isLoading ? 'var(--mode-skeleton-min-h)' : undefined,
          }}
        >
          {isLoading ? (
            <TypingIndicator />
          ) : noTextWrap ? (
            children
          ) : (
            <div style={TYPOGRAPHY_STYLE}>
              {children}
            </div>
          )}
        </div>
      </BoxAtom>

      {/* Timestamp debajo de la burbuja */}
      {timestamp && !isLoading && (
        <TextAtom
          variant="text-xs"
          as="span"
          className={['px-1', TIMESTAMP_CLASS[variant]].join(' ')}
          style={{ color: 'var(--mode-text-secondary)' }}
        >
          {timestamp}
        </TextAtom>
      )}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Mensaje del usuario
   <BubbleMessage variant="user" timestamp="14:23">
     Genera un diagrama de microservicios para un e-commerce.
   </BubbleMessage>

   // Respuesta de la IA
   <BubbleMessage variant="ai" timestamp="14:23">
     Aquí tienes una arquitectura de microservicios con API Gateway,
     servicio de autenticación y catálogo de productos.
   </BubbleMessage>

   // Indicador de escritura (IA procesando)
   <BubbleMessage variant="ai" isLoading />

   // Con avatar personalizado
   import SmartToyIcon from '@mui/icons-material/SmartToy'
   <BubbleMessage
     variant="ai"
     avatar={
       <div className="w-full h-full bg-brand-600 flex items-center justify-center">
         <SmartToyIcon style={{ fontSize: 16, color: 'white' }} />
       </div>
     }
   >
     Claro, voy a analizar la arquitectura actual...
   </BubbleMessage>

   // Conversación completa
   <div className="flex flex-col gap-4 p-4">
     <BubbleMessage variant="user">¿Qué es DDD?</BubbleMessage>
     <BubbleMessage variant="ai">
       Domain-Driven Design es una metodología de desarrollo de software...
     </BubbleMessage>
     <BubbleMessage variant="ai" isLoading />
   </div>
---------------------------------------------------------------- */
