/**
 * <MarkdownRenderer /> — Organismo: motor visual de respuestas IA
 *
 * Renderiza texto Markdown en tiempo real de forma segura y estilizada.
 * Usa react-markdown + remark-gfm (tablas, strikethrough, tasklists, URLs).
 * Cada etiqueta HTML está mapeada a los design tokens de ArchIA —
 * sin @tailwindcss/typography, control total sobre el estilizado.
 *
 * Mapeo de elementos:
 *   p                → font-sans, text-body-sm, gray-700, leading-relaxed
 *   h1–h3            → font-serif, escala display, gray-900
 *   h4–h6            → font-sans, text-body-lg/md/sm, gray-800
 *   a                → brand-600, hover:brand-700 + underline
 *   ul / ol / li     → list-disc/decimal, ml-6, space-y-1.5
 *   code (inline)    → bg-gray-100, text-gray-900, font-mono, rounded-md
 *   code (block)     → delega en <CodeBlock /> molecule
 *   blockquote       → border-l-4 brand-300, italic, gray-600
 *   table/thead/td   → bordered, bg-gray-50 para header, hover en rows
 *   strong / em      → semibold / italic nativos
 *   hr               → border-gray-200
 *
 * Props:
 *   content   — string   Texto Markdown en crudo (de la IA)
 *   className — string   Clases adicionales para el contenedor raíz
 */

import { useMemo }   from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm     from 'remark-gfm'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import CodeBlock     from '../molecules/CodeBlock'
import BoxAtom       from '../atoms/BoxAtom'
import TooltipAtom   from '../atoms/TooltipAtom'
import { useMode }   from '../../contexts/ModeContext'

/* ================================================================
   HELPERS F9-T4 — detección socrática y glosario
================================================================ */

/**
 * Detecta si el contenido (string | element | array) termina en `?` cuando se
 * aplana a texto. Cruza recursivamente arrays y elementos hijos.
 *
 * Cubre el caso "¿Qué pasaría si…?" como párrafo plano y también casos con
 * énfasis al final como "¿Por qué crees **eso**?". Falsos positivos posibles
 * sólo si el último carácter del último nodo textual es `?`, lo cual es
 * exactamente lo que queremos detectar.
 */
function endsWithQuestionMark(children) {
  if (children == null || children === false) return false
  if (typeof children === 'string') return /\?\s*$/.test(children)
  if (typeof children === 'number') return false
  if (Array.isArray(children)) {
    for (let i = children.length - 1; i >= 0; i--) {
      const c = children[i]
      if (c == null || c === '' || c === false) continue
      return endsWithQuestionMark(c)
    }
    return false
  }
  if (children?.props?.children !== undefined) {
    return endsWithQuestionMark(children.props.children)
  }
  return false
}

/* Convención del agente: enlaces a glosario se escriben como
   [Concepto](glossary:Concepto). Sólo en modo tutor se renderizan como
   tooltip definitorio; en profesional se neutralizan a texto plano con
   subrayado punteado para no romper el flujo. */
function isGlossaryHref(href) {
  return typeof href === 'string' && href.startsWith('glossary:')
}

function glossaryTerm(href) {
  return isGlossaryHref(href) ? href.slice('glossary:'.length).trim() : ''
}

/**
 * `react-markdown` por defecto sanitiza URLs con esquemas no estándar
 * (drops javascript:, data:, glossary:, etc.). Como F9-T4 usa
 * `glossary:Concepto` como protocolo convenido, hay que preservarlo.
 * Mantiene la sanitización para esquemas peligrosos (javascript:, data:)
 * delegando al comportamiento por defecto en esos casos.
 */
function urlTransformPreservingGlossary(url) {
  if (typeof url !== 'string') return url
  if (url.startsWith('glossary:')) return url
  // Bloqueos básicos (similar a defaultUrlTransform de react-markdown).
  const lower = url.toLowerCase().trim()
  if (lower.startsWith('javascript:')) return ''
  if (lower.startsWith('data:') && !lower.startsWith('data:image/')) return ''
  return url
}

/* ================================================================
   MAPEO DE COMPONENTES — prop `components` de react-markdown
   F9-T4: factorizado a `buildComponents(mode)` para inyectar
   diferenciación tutor/professional sin duplicar tags.
================================================================ */

function buildComponents(mode) {
  const isTutor = mode === 'tutor'

  return {

  /* ── Párrafo — color del modo activo.
     F9-T4: en tutor, párrafos que terminan en `?` se enfatizan como
     pregunta socrática (borde izquierdo + peso semibold) para guiar
     al alumno hacia la auto-reflexión. ── */
  p: ({ children }) => {
    const isSocratic = isTutor && endsWithQuestionMark(children)
    if (isSocratic) {
      return (
        <p
          className="text-body-sm leading-relaxed mb-3 last:mb-0 pl-3 border-l-4 font-semibold theme-transition"
          style={{
            color: 'var(--mode-on-surface)',
            borderColor: 'var(--mode-callout-border)',
          }}
          data-socratic="true"
        >
          {children}
        </p>
      )
    }
    return (
      <p
        className="text-body-sm leading-relaxed mb-3 last:mb-0"
        style={{ color: 'var(--mode-on-surface)' }}
      >
        {children}
      </p>
    )
  },

  /* ── Títulos — font-serif por convención de prosa larga ── */
  h1: ({ children }) => (
    <h1
      className="font-serif text-display-md font-semibold mt-8 mb-4 first:mt-0 leading-tight"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="font-serif text-display-sm font-semibold mt-6 mb-3 first:mt-0 leading-tight"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="font-serif text-display-xs font-semibold mt-5 mb-2 first:mt-0 leading-snug"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      className="font-sans text-body-md font-semibold mt-4 mb-2 first:mt-0"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5
      className="font-sans text-body-sm font-semibold mt-3 mb-1 first:mt-0"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      className="font-sans text-body-sm font-semibold mt-3 mb-1 first:mt-0"
      style={{ color: 'var(--mode-text-secondary)' }}
    >
      {children}
    </h6>
  ),

  /* ── Enlace — usa --mode-primary del modo activo.
     F9-T4: `href` con prefijo `glossary:` se intercepta:
       - En tutor: se envuelve en TooltipAtom con la definición (placeholder
         hasta que el corpus glossary se ingieste — F2-T5 backend).
       - En professional: se neutraliza a un <span> con subrayado punteado
         para no abrir un esquema URL inválido. ── */
  a: ({ href, children }) => {
    if (isGlossaryHref(href)) {
      const term = glossaryTerm(href)
      // TODO(F2-T5 backend): consultar definición real desde el corpus glossary.
      const definition = `Definición no disponible todavía para "${term}".`
      if (isTutor) {
        return (
          <TooltipAtom content={definition} position="top">
            <span
              className="font-medium underline decoration-dotted cursor-help theme-transition"
              style={{ color: 'var(--mode-primary)' }}
              data-glossary={term}
              tabIndex={0}
              aria-label={`Glosario: ${term}`}
            >
              {children}
            </span>
          </TooltipAtom>
        )
      }
      return (
        <span
          className="font-medium underline decoration-dotted theme-transition"
          style={{ color: 'var(--mode-text-secondary)' }}
          data-glossary={term}
        >
          {children}
        </span>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium hover:underline transition-colors duration-150"
        style={{ color: 'var(--mode-primary)' }}
      >
        {children}
      </a>
    )
  },

  /* ── Listas — densidad por --mode-list-spacing.
     F6-T3 (tutor): spacing-2 → respiración generosa.
     F6-T4 (professional): spacing-1 → densidad mayor. */
  ul: ({ children }) => (
    <ul
      className="list-disc ml-6 mb-3 text-body-sm flex flex-col"
      style={{
        gap: 'var(--mode-list-spacing)',
        color: 'var(--mode-on-surface)',
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="list-decimal ml-6 mb-3 text-body-sm flex flex-col"
      style={{
        gap: 'var(--mode-list-spacing)',
        color: 'var(--mode-on-surface)',
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed pl-1">
      {children}
    </li>
  ),

  /* ── Código —
     Bloque (language-xxx)        → CodeBlock molecule (ancho 100% en ambos modos).
     Inline code (sin language)   → fondo `--mode-code-bg`, texto `--mode-code-fg`.
  ── */
  code: ({ className: cls, children }) => {
    const match    = /language-(\w+)/.exec(cls || '')
    const language = match?.[1] ?? 'plaintext'

    if (match) {
      return (
        <CodeBlock
          language={language}
          code={String(children).replace(/\n$/, '')}
          className="my-4 w-full"
        />
      )
    }

    return (
      <code
        className="font-mono text-body-xs px-1.5 py-0.5 rounded-md align-middle"
        style={{
          backgroundColor: 'var(--mode-code-bg)',
          color: 'var(--mode-code-fg)',
        }}
      >
        {children}
      </code>
    )
  },

  /* pre delega completamente al handler de code */
  pre: ({ children }) => <>{children}</>,

  /* ── Cita / callout — usa --mode-blockquote-* y --mode-callout-border.
     F6-T3 (tutor):       fondo ámbar cálido (analogías y notas pedagógicas).
     F6-T4 (professional): fondo gris sobrio (notas técnicas).
     F9-T4: en tutor, el blockquote se enriquece como callout pedagógico
     con icono Lightbulb prefijado, sugiriendo "insight" o "pista".
  ── */
  blockquote: ({ children }) => (
    <blockquote
      className="border-l-4 pl-4 pr-3 py-2 my-4 rounded-r-md italic font-sans text-body-sm"
      style={{
        borderColor: 'var(--mode-callout-border)',
        backgroundColor: 'var(--mode-blockquote-bg)',
        color: 'var(--mode-blockquote-fg)',
      }}
    >
      {isTutor ? (
        <span className="flex items-start gap-2">
          <LightbulbOutlinedIcon
            style={{ fontSize: 18, marginTop: 2, flexShrink: 0 }}
            aria-hidden="true"
            data-testid="callout-icon"
          />
          <span className="flex-1">{children}</span>
        </span>
      ) : (
        children
      )}
    </blockquote>
  ),

  /* ── Regla horizontal ── */
  hr: () => (
    <hr
      className="border-0 border-t my-6"
      style={{ borderColor: 'var(--mode-outline)' }}
    />
  ),

  /* ── Énfasis ── */
  strong: ({ children }) => (
    <strong
      className="font-semibold"
      style={{ color: 'var(--mode-on-surface)' }}
    >
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic" style={{ color: 'var(--mode-text-secondary)' }}>
      {children}
    </em>
  ),

  /* ── Tachado (GFM strikethrough) — usa text-secondary del modo para WCAG AA ── */
  del: ({ children }) => (
    <del className="line-through" style={{ color: 'var(--mode-text-secondary)' }}>{children}</del>
  ),

  /* ── Tablas (GFM) — tokens --mode-table-* para diferenciación por modo.
     F6-T3 tutor:        tonos cálidos secondary (header ámbar suave, border naranja).
     F6-T4 professional: tonos fríos gray (high contrast, WCAG AA garantizado).
  ── */
  table: ({ children }) => (
    <div
      className="overflow-x-auto my-4 rounded-lg shadow-xs theme-transition"
      style={{ border: '1px solid var(--mode-table-border)' }}
    >
      <table className="w-full text-body-sm font-sans text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead
      className="theme-transition"
      style={{
        backgroundColor: 'var(--mode-table-header-bg)',
        borderBottom: '1px solid var(--mode-table-border)',
      }}
    >
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody style={{ '--table-divider': 'var(--mode-table-divider)' }}>
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr
      className="theme-transition"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--mode-table-hover-bg)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
    >
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th
      className="p-3 font-semibold whitespace-nowrap"
      style={{ color: 'var(--mode-table-text-header)' }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="p-3"
      style={{
        color: 'var(--mode-table-text)',
        borderTop: '1px solid var(--mode-table-divider)',
      }}
    >
      {children}
    </td>
  ),
  }
}

/* ================================================================
   COMPONENTE PRINCIPAL
================================================================ */
export default function MarkdownRenderer({ content = '', className = '' }) {
  const { mode } = useMode()
  const MD = useMemo(() => buildComponents(mode), [mode])
  return (
    <BoxAtom className={['leading-relaxed', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MD}
        urlTransform={urlTransformPreservingGlossary}
      >
        {content}
      </ReactMarkdown>
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Respuesta básica de la IA
   <MarkdownRenderer content={message.text} />

   // Con clase de ancho máximo
   <MarkdownRenderer
     content={message.text}
     className="max-w-2xl"
   />

   // Dentro de BubbleMessage — sustituye al <p> simple
   <BubbleMessage variant="ai" timestamp="14:20">
     <MarkdownRenderer content={aiText} />
   </BubbleMessage>
---------------------------------------------------------------- */
