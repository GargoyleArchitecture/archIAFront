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

import ReactMarkdown from 'react-markdown'
import remarkGfm     from 'remark-gfm'
import CodeBlock     from '../molecules/CodeBlock'
import BoxAtom       from '../atoms/BoxAtom'

/* ================================================================
   MAPEO DE COMPONENTES — prop `components` de react-markdown
================================================================ */

const MD = {

  /* ── Párrafo ── */
  p: ({ children }) => (
    <p className="font-sans text-body-sm leading-relaxed text-gray-700 mb-3 last:mb-0">
      {children}
    </p>
  ),

  /* ── Títulos — font-serif + escala display ── */
  h1: ({ children }) => (
    <h1 className="font-serif text-display-md font-semibold text-gray-900 mt-8 mb-4 first:mt-0 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-display-sm font-semibold text-gray-900 mt-6 mb-3 first:mt-0 leading-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-display-xs font-semibold text-gray-900 mt-5 mb-2 first:mt-0 leading-snug">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-sans text-body-md font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="font-sans text-body-sm font-semibold text-gray-800 mt-3 mb-1 first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="font-sans text-body-sm font-semibold text-gray-700 mt-3 mb-1 first:mt-0">
      {children}
    </h6>
  ),

  /* ── Enlace ── */
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 font-medium hover:text-brand-700 hover:underline transition-colors duration-150"
    >
      {children}
    </a>
  ),

  /* ── Listas ── */
  ul: ({ children }) => (
    <ul className="list-disc ml-6 space-y-1.5 mb-3 font-sans text-body-sm text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-6 space-y-1.5 mb-3 font-sans text-body-sm text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed pl-1">
      {children}
    </li>
  ),

  /* ── Código ──
     react-markdown envía className="language-xxx" en bloques delimitados.
     Si hay coincidencia de lenguaje → CodeBlock molecule.
     Si no → inline code atom.                                       */
  code: ({ className: cls, children }) => {
    const match    = /language-(\w+)/.exec(cls || '')
    const language = match?.[1] ?? 'plaintext'

    if (match) {
      return (
        <CodeBlock
          language={language}
          code={String(children).replace(/\n$/, '')}
          className="my-4"
        />
      )
    }

    return (
      <code className="font-mono text-body-xs bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded-md align-middle">
        {children}
      </code>
    )
  },

  /* pre delega completamente al handler de code */
  pre: ({ children }) => <>{children}</>,

  /* ── Cita ── */
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-300 bg-brand-25 pl-4 pr-3 py-2 my-4 rounded-r-md italic text-gray-600 font-sans text-body-sm">
      {children}
    </blockquote>
  ),

  /* ── Regla horizontal ── */
  hr: () => <hr className="border-0 border-t border-gray-200 my-6" />,

  /* ── Énfasis ── */
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-600">{children}</em>
  ),

  /* ── Tachado (GFM strikethrough) ── */
  del: ({ children }) => (
    <del className="line-through text-gray-400">{children}</del>
  ),

  /* ── Tablas (GFM) ── */
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-xs">
      <table className="w-full text-body-sm font-sans text-left border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-100">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-gray-50 transition-colors duration-100">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="p-3 font-semibold text-gray-700 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-3 text-gray-600">
      {children}
    </td>
  ),
}

/* ================================================================
   COMPONENTE PRINCIPAL
================================================================ */
export default function MarkdownRenderer({ content = '', className = '' }) {
  return (
    <BoxAtom className={['leading-relaxed', className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
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
