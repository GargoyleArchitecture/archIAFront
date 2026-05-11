/**
 * F10-T3: ConceptCloud — Nube de conceptos con tamaño variable
 *
 * Renderiza una colección de conceptos como pills cuyo tamaño tipográfico
 * varía linealmente entre `minSize` y `maxSize` según un `weight` 0..1.
 * Sin transformaciones logarítmicas (cloud tradicional) para mantener
 * determinismo entre re-renders.
 *
 * Ordena por weight DESC para que los conceptos más relevantes queden
 * arriba/izquierda y los menos relevantes al final.
 *
 * Props:
 *   concepts  — Array<{name: string, weight?: number}>  (requerido)
 *   minSize   — number (px)   font-size mínimo (default 11)
 *   maxSize   — number (px)   font-size máximo (default 20)
 *   intent    — intent de los ConceptPills (default 'neutral')
 *   className — string
 */

import ConceptPillAtom from '../atoms/ConceptPillAtom'
import TextAtom from '../atoms/TextAtom'

function clamp01(v) {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

export default function ConceptCloud({
  concepts,
  minSize = 11,
  maxSize = 20,
  intent = 'neutral',
  className = '',
}) {
  if (!Array.isArray(concepts) || concepts.length === 0) {
    return (
      <TextAtom variant="text-sm" className="text-gray-400 italic">
        No hay conceptos para mostrar.
      </TextAtom>
    )
  }

  const items = concepts
    .filter((c) => c && typeof c.name === 'string' && c.name.trim().length > 0)
    .map((c) => ({
      name: c.name.trim(),
      weight: clamp01(c.weight),
    }))
    .sort((a, b) => b.weight - a.weight)

  if (items.length === 0) {
    return (
      <TextAtom variant="text-sm" className="text-gray-400 italic">
        No hay conceptos para mostrar.
      </TextAtom>
    )
  }

  const lo = Math.min(minSize, maxSize)
  const hi = Math.max(minSize, maxSize)
  const range = hi - lo

  return (
    <div
      className={['flex flex-wrap items-center gap-1.5', className].filter(Boolean).join(' ')}
      data-testid="concept-cloud"
    >
      {items.map((item) => {
        const size = lo + range * item.weight
        return (
          <span
            key={item.name}
            style={{ fontSize: `${size}px`, lineHeight: 1.3 }}
            data-weight={item.weight}
            data-testid="cloud-item"
          >
            <ConceptPillAtom intent={intent} size="sm">
              {item.name}
            </ConceptPillAtom>
          </span>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------
   Ejemplo:

   <ConceptCloud
     concepts={[
       { name: 'SOLID',   weight: 0.9 },
       { name: 'CQRS',    weight: 0.4 },
       { name: 'Caching', weight: 0.6 },
     ]}
   />
---------------------------------------------------------------- */
