/**
 * radarMath.js — Funciones puras para construir el gráfico radar SVG
 *
 * Sin React, sin DOM — 100% testeable en aislamiento.
 *
 * Sistema de coordenadas:
 *   - Origen en la esquina superior izquierda del SVG.
 *   - Eje 0 (primer concepto) apuntando hacia ARRIBA (norte).
 *   - Los ejes se distribuyen equiespaciados en sentido horario.
 *
 * Por eso aplicamos un offset de -90° (Math.PI / -2) sobre el ángulo
 * teórico del cálculo polar estándar.
 */

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2

/**
 * Convierte coordenadas polares (ángulo en radianes desde el norte,
 * sentido horario) a cartesianas SVG.
 *
 * @param {number} cx     — centro X
 * @param {number} cy     — centro Y
 * @param {number} r      — radio (distancia desde el centro)
 * @param {number} angle  — ángulo en radianes (0 = norte; π/2 = este)
 * @returns {{x:number, y:number}}
 */
export function polarToCartesian(cx, cy, r, angle) {
  // Sin -π/2 estándar: queremos que 0 → norte, así que rotamos el plano
  // restando π/2 al ángulo. En SVG, Y crece hacia abajo, por eso el
  // cos/sin parecen invertidos respecto a un eje matemático tradicional.
  const a = angle - HALF_PI
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }
}

/**
 * Construye N ejes equiespaciados desde el centro al borde.
 *
 * @param {number} n        — cantidad de ejes (≥ 3)
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius   — radio máximo
 * @returns {Array<{x1:number, y1:number, x2:number, y2:number, angle:number}>}
 */
export function buildAxes(n, cx, cy, radius) {
  if (!Number.isFinite(n) || n < 3) return []
  const axes = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * TWO_PI
    const end = polarToCartesian(cx, cy, radius, angle)
    axes.push({
      x1: cx,
      y1: cy,
      x2: end.x,
      y2: end.y,
      angle,
    })
  }
  return axes
}

/**
 * Construye el polígono de datos. Cada valor en `values` se interpreta
 * como una fracción 0..1 del radio máximo (mastery está en [0,1]).
 *
 * @param {number[]} values  — array de fracciones 0..1
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @returns {{points: Array<{x:number, y:number, angle:number, value:number}>, polylinePoints: string}}
 *   `polylinePoints` ya viene en formato listo para el atributo `points` de `<polygon>`.
 */
export function buildPolygon(values, cx, cy, radius) {
  if (!Array.isArray(values) || values.length === 0) {
    return { points: [], polylinePoints: '' }
  }
  const n = values.length
  const points = values.map((v, i) => {
    const clamped = clamp01(v)
    const angle = (i / n) * TWO_PI
    const { x, y } = polarToCartesian(cx, cy, radius * clamped, angle)
    return { x, y, angle, value: clamped }
  })
  const polylinePoints = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  return { points, polylinePoints }
}

function clamp01(v) {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

/**
 * Selecciona los top 6 conceptos del usuario ordenados por `lastSeenAt` DESC
 * (los vistos más recientemente). Empate por `mastery` DESC. Empate residual
 * por `name` ASC para determinismo.
 *
 * Si hay menos de 6 conceptos disponibles, retorna lo que haya (incluso < 3,
 * el caller decide si renderizar el chart o un placeholder).
 *
 * @param {Array<{name:string, mastery?:number, lastSeenAt?:string}>} concepts
 * @returns {Array<{name:string, mastery:number, lastSeenAt?:string}>}
 */
export function pickTop6ByLastSeen(concepts) {
  if (!Array.isArray(concepts)) return []
  const filtered = concepts
    .filter((c) => c && typeof c.name === 'string' && c.name.trim().length > 0)
    .map((c) => ({
      name: c.name.trim(),
      mastery: clamp01(c.mastery),
      lastSeenAt: typeof c.lastSeenAt === 'string' ? c.lastSeenAt : undefined,
    }))

  filtered.sort((a, b) => {
    const ta = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : -Infinity
    const tb = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : -Infinity
    if (tb !== ta) return tb - ta
    if (b.mastery !== a.mastery) return b.mastery - a.mastery
    return a.name.localeCompare(b.name)
  })

  return filtered.slice(0, 6)
}

/**
 * Calcula la posición del label de cada eje, ligeramente afuera del borde
 * del polígono máximo. Devuelve también `text-anchor` adecuado al cuadrante.
 *
 * @param {{angle:number, x2:number, y2:number}} axis
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} [offset=14]  — distancia adicional del label respecto al borde
 * @returns {{x:number, y:number, anchor:'start'|'middle'|'end'}}
 */
export function buildLabelPosition(axis, cx, cy, radius, offset = 14) {
  const { x, y } = polarToCartesian(cx, cy, radius + offset, axis.angle)
  let anchor = 'middle'
  const dx = x - cx
  if (dx > 1) anchor = 'start'
  else if (dx < -1) anchor = 'end'
  return { x, y, anchor }
}
