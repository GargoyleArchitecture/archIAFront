/**
 * F10-T3: CodeDiffBlock — Bloque before/after lado a lado
 *
 * Muestra dos paneles de código (CodeBlock) etiquetados como "Antes" y
 * "Después" para visualizar un refactor o transformación. En viewports
 * pequeños los paneles se apilan verticalmente (md:grid-cols-2 → 1 col).
 *
 * NO calcula el diff line-by-line — la fuente (agente IA o autor humano)
 * entrega los dos bloques ya identificados. Si más adelante necesitamos
 * resaltado per-line, podemos integrar `diff` o `diff2html` sin romper
 * esta API.
 *
 * Props:
 *   before    — string (uno de before/after debe estar presente)
 *   after     — string
 *   language  — string (default 'plaintext')
 *   caption?  — string (titular del bloque, ej. "Refactor de caching")
 *   className — string
 */

import CodeBlock from './CodeBlock'
import TextAtom  from '../atoms/TextAtom'

function PanelLabel({ tone, children }) {
  const style = tone === 'before'
    ? { backgroundColor: 'var(--color-error-100)',   color: 'var(--color-error-800)' }
    : { backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-800)' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide font-sans"
      style={style}
    >
      {children}
    </span>
  )
}

export default function CodeDiffBlock({
  before,
  after,
  language = 'plaintext',
  caption,
  className = '',
}) {
  const hasBefore = typeof before === 'string' && before.trim().length > 0
  const hasAfter  = typeof after  === 'string' && after.trim().length > 0
  if (!hasBefore && !hasAfter) return null

  return (
    <section
      className={[
        'flex flex-col gap-3 p-3 rounded-lg border border-gray-200 bg-white theme-transition',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={caption ? `Diff: ${caption}` : 'Comparación de código antes / después'}
      data-testid="code-diff-block"
    >
      {caption && (
        <TextAtom variant="text-sm" weight="semibold" className="text-gray-700">
          {caption}
        </TextAtom>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hasBefore && (
          <div className="flex flex-col gap-1.5" data-testid="diff-panel-before">
            <PanelLabel tone="before">Antes</PanelLabel>
            <CodeBlock code={before} language={language} className="w-full" />
          </div>
        )}
        {hasAfter && (
          <div className="flex flex-col gap-1.5" data-testid="diff-panel-after">
            <PanelLabel tone="after">Después</PanelLabel>
            <CodeBlock code={after} language={language} className="w-full" />
          </div>
        )}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   Ejemplo:

   <CodeDiffBlock
     language="python"
     caption="Refactor de caching naïve"
     before="cache.get(key)"
     after="cache.get_or_compute(key, lambda: heavy())"
   />
---------------------------------------------------------------- */
