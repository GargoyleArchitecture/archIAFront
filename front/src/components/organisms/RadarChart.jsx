/**
 * F8-T2: RadarChart — Spider chart de dominio general
 *
 * SVG puro (sin librería pesada). Responsive vía `viewBox` + `width=100%`.
 * Renderiza hasta 6 vértices con los conceptos más recientes del usuario,
 * cada uno con `mastery` mapeada al radio normalizado [0..1].
 *
 * Props:
 *   concepts  — Array<{name, mastery, lastSeenAt?}>  (requerido)
 *   size      — number (default 320). Tamaño base del viewBox.
 *   animate   — bool   (default true). Aplica fade+scale al cargar.
 *
 * Accesibilidad:
 *   - role="img" + aria-labelledby (title + desc).
 *   - <title> y <desc> con resumen textual.
 *   - Tabla sr-only con los datos numéricos.
 *   - Vértices con tabIndex=0 para foco con teclado y tooltip sobre hover/focus.
 *
 * Decisiones:
 *   - Selección top 6 por lastSeenAt DESC (lo más reciente refleja el estado actual).
 *   - Mínimo 3 vértices para poder dibujar un polígono; si hay < 3 se muestra placeholder.
 *   - Labels truncados a 14 chars en el SVG; tooltip muestra el nombre completo.
 *   - Animación respeta `prefers-reduced-motion` via clase `motion-reduce:animate-none`.
 *   - Colores tomados de tokens `--mode-primary`/`--mode-on-primary-container` para
 *     integración con el theming dual.
 */

import { useId, useMemo, useState } from 'react'
import {
  buildAxes,
  buildPolygon,
  pickTop6ByLastSeen,
  buildLabelPosition,
} from '../../utils/radarMath'
import { humanizeDelta } from '../../utils/profileHydration'
import TextAtom from '../atoms/TextAtom'

const RINGS = [0.25, 0.5, 0.75, 1.0] // 25/50/75/100 %
const LABEL_MAX_CHARS = 14

function truncate(s, max = LABEL_MAX_CHARS) {
  if (typeof s !== 'string') return ''
  return s.length > max ? `${s.slice(0, max - 1).trim()}…` : s
}

function masteryPercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)} %`
}

function summarize(concepts) {
  if (concepts.length === 0) return 'Sin datos suficientes.'
  return concepts
    .map((c) => `${c.name}: ${masteryPercent(c.mastery)}`)
    .join(', ')
}

export default function RadarChart({
  concepts,
  size = 520,
  animate = true,
}) {
  const titleId = useId()
  const descId = useId()

  const topConcepts = useMemo(() => pickTop6ByLastSeen(concepts), [concepts])

  // Estado: vértice con foco/hover (para tooltip)
  const [activeIdx, setActiveIdx] = useState(null)

  if (topConcepts.length < 3) {
    return (
      <div className="flex flex-col gap-2 py-4" data-testid="radar-placeholder">
        <TextAtom variant="text-sm" className="text-gray-500">
          Necesitas al menos 3 conceptos evaluados para mostrar el radar.
        </TextAtom>
        <TextAtom variant="text-xs" className="text-gray-400">
          {topConcepts.length === 0
            ? 'Aún no hay conceptos evaluados.'
            : `Hay ${topConcepts.length} concepto(s) por ahora.`}
        </TextAtom>
      </div>
    )
  }

  const cx = size / 2
  const cy = size / 2
  const maxRadius = (size / 2) * 0.75

  const axes = buildAxes(topConcepts.length, cx, cy, maxRadius)
  const values = topConcepts.map((c) => c.mastery)
  const { points, polylinePoints } = buildPolygon(values, cx, cy, maxRadius)

  return (
    <div className="w-full flex justify-center" data-testid="radar-chart">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        style={{ width: '100%', maxWidth: size, height: 'auto', display: 'block' }}
      >
        <title id={titleId}>Dominio General — gráfico radar</title>
        <desc id={descId}>
          Mastery en escala 0 a 100 para los {topConcepts.length} conceptos más recientes:{' '}
          {summarize(topConcepts)}
        </desc>

        {/* Rejilla concéntrica */}
        <g aria-hidden="true">
          {RINGS.map((ratio) => {
            const ringPoints = axes
              .map((axis) => {
                const x = cx + (axis.x2 - cx) * ratio
                const y = cy + (axis.y2 - cy) * ratio
                return `${x.toFixed(2)},${y.toFixed(2)}`
              })
              .join(' ')
            return (
              <polygon
                key={`ring-${ratio}`}
                points={ringPoints}
                fill="none"
                stroke="var(--color-gray-200)"
                strokeWidth="1"
              />
            )
          })}
        </g>

        {/* Ejes */}
        <g aria-hidden="true">
          {axes.map((axis, i) => (
            <line
              key={`axis-${i}`}
              x1={axis.x1}
              y1={axis.y1}
              x2={axis.x2}
              y2={axis.y2}
              stroke="var(--color-gray-200)"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Polígono de datos */}
        <g
          className={animate ? 'radar-data-enter motion-reduce:animate-none' : undefined}
          style={animate ? { transformOrigin: `${cx}px ${cy}px` } : undefined}
        >
          <polygon
            points={polylinePoints}
            fill="var(--mode-primary, var(--color-brand-500))"
            fillOpacity="0.25"
            stroke="var(--mode-primary, var(--color-brand-500))"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Vértices interactivos */}
          {points.map((p, i) => {
            const concept = topConcepts[i]
            const isActive = activeIdx === i
            return (
              <circle
                key={`vertex-${i}`}
                cx={p.x}
                cy={p.y}
                r={isActive ? 7 : 5}
                fill="var(--mode-primary, var(--color-brand-600))"
                stroke="white"
                strokeWidth="2"
                /* F11-T3: tabIndex/role=button removidos del <circle> para
                   no chocar con role="img" del SVG raíz (axe: no-focusable-content).
                   La accesibilidad por teclado se sirve via la tabla sr-only
                   con los datos de los vértices. El hover sigue siendo
                   interactivo para mouse users (tooltip). */
                aria-hidden="true"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{ cursor: 'pointer', transition: 'r 120ms ease-out' }}
                data-testid={`radar-vertex-${i}`}
              />
            )
          })}
        </g>

        {/* Labels de cada eje */}
        <g aria-hidden="true">
          {axes.map((axis, i) => {
            const { x, y, anchor } = buildLabelPosition(axis, cx, cy, maxRadius)
            const concept = topConcepts[i]
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                fontSize="11"
                fill="var(--color-gray-700)"
                textAnchor={anchor}
                dominantBaseline="middle"
                style={{ fontFamily: 'inherit' }}
              >
                {truncate(concept.name)}
              </text>
            )
          })}
        </g>

        {/* Tooltip flotante (texto en SVG) */}
        {activeIdx !== null && points[activeIdx] && (
          <g
            transform={`translate(${points[activeIdx].x},${points[activeIdx].y - 14})`}
            data-testid="radar-tooltip"
            aria-hidden="true"
          >
            <rect
              x={-70}
              y={-30}
              width={140}
              height={28}
              rx={4}
              ry={4}
              fill="var(--color-gray-900)"
              opacity="0.92"
            />
            <text
              x={0}
              y={-12}
              fontSize="11"
              fill="white"
              textAnchor="middle"
              style={{ fontFamily: 'inherit' }}
            >
              {truncate(topConcepts[activeIdx].name, 18)} · {masteryPercent(topConcepts[activeIdx].mastery)}
            </text>
          </g>
        )}
      </svg>

      {/* Tabla sr-only para lectores de pantalla / teclado */}
      <table className="sr-only" aria-label="Datos del radar">
        <thead>
          <tr><th>Concepto</th><th>Mastery</th><th>Visto</th></tr>
        </thead>
        <tbody>
          {topConcepts.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>{masteryPercent(c.mastery)}</td>
              <td>{c.lastSeenAt ? humanizeDelta(c.lastSeenAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Keyframes de animación inline (Tailwind 4 no maneja keyframes custom directo) */}
      {animate && (
        <style>{`
          .radar-data-enter {
            animation: radar-data-fade 400ms ease-out both;
          }
          @keyframes radar-data-fade {
            0%   { opacity: 0; transform: scale(0.6); }
            100% { opacity: 1; transform: scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .radar-data-enter { animation: none; }
          }
        `}</style>
      )}
    </div>
  )
}
