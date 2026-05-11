/**
 * Tests F8-T2: radarMath utils (puros, sin DOM)
 */
import { describe, it, expect } from 'vitest'
import {
  polarToCartesian,
  buildAxes,
  buildPolygon,
  pickTop6ByLastSeen,
  buildLabelPosition,
} from './radarMath'

const CX = 160
const CY = 160
const R = 120

describe('polarToCartesian', () => {
  it('angle 0 → norte (mismo x, y menor)', () => {
    const { x, y } = polarToCartesian(CX, CY, R, 0)
    expect(x).toBeCloseTo(CX, 4)
    expect(y).toBeCloseTo(CY - R, 4)
  })

  it('angle π/2 → este (x mayor, mismo y)', () => {
    const { x, y } = polarToCartesian(CX, CY, R, Math.PI / 2)
    expect(x).toBeCloseTo(CX + R, 4)
    expect(y).toBeCloseTo(CY, 4)
  })

  it('angle π → sur (mismo x, y mayor)', () => {
    const { x, y } = polarToCartesian(CX, CY, R, Math.PI)
    expect(x).toBeCloseTo(CX, 4)
    expect(y).toBeCloseTo(CY + R, 4)
  })

  it('radio 0 → mismo centro siempre', () => {
    const { x, y } = polarToCartesian(CX, CY, 0, 1.234)
    expect(x).toBeCloseTo(CX, 4)
    expect(y).toBeCloseTo(CY, 4)
  })
})

describe('buildAxes', () => {
  it('6 ejes equiespaciados a 60° de separación', () => {
    const axes = buildAxes(6, CX, CY, R)
    expect(axes).toHaveLength(6)
    // El primer eje siempre apunta al norte
    expect(axes[0].x2).toBeCloseTo(CX, 4)
    expect(axes[0].y2).toBeCloseTo(CY - R, 4)
    // El segundo eje, a 60° (≈ noreste): x debería crecer
    expect(axes[1].x2).toBeGreaterThan(CX)
    expect(axes[1].y2).toBeLessThan(CY)
  })

  it('retorna [] si n < 3', () => {
    expect(buildAxes(2, CX, CY, R)).toEqual([])
    expect(buildAxes(0, CX, CY, R)).toEqual([])
    expect(buildAxes(NaN, CX, CY, R)).toEqual([])
  })
})

describe('buildPolygon', () => {
  it('mastery 1 → vértice en el borde del radio', () => {
    const { points, polylinePoints } = buildPolygon([1], CX, CY, R)
    expect(points).toHaveLength(1)
    expect(points[0].x).toBeCloseTo(CX, 4)
    expect(points[0].y).toBeCloseTo(CY - R, 4)
    expect(polylinePoints).toMatch(/\d+\.\d{2},\d+\.\d{2}/)
  })

  it('mastery 0 → todos los vértices en el centro', () => {
    const { points } = buildPolygon([0, 0, 0, 0, 0, 0], CX, CY, R)
    for (const p of points) {
      expect(p.x).toBeCloseTo(CX, 4)
      expect(p.y).toBeCloseTo(CY, 4)
    }
  })

  it('clamp de mastery fuera de [0,1]', () => {
    const { points } = buildPolygon([-0.5, 1.5], CX, CY, R)
    expect(points[0].value).toBe(0)
    expect(points[1].value).toBe(1)
  })

  it('coerce strings numéricos y valores no-finitos → 0', () => {
    const { points } = buildPolygon(['0.5', NaN, undefined], CX, CY, R)
    expect(points[0].value).toBe(0.5)
    expect(points[1].value).toBe(0)
    expect(points[2].value).toBe(0)
  })

  it('valores vacíos → polyline vacío', () => {
    expect(buildPolygon([], CX, CY, R).polylinePoints).toBe('')
    expect(buildPolygon(null, CX, CY, R).polylinePoints).toBe('')
  })
})

describe('pickTop6ByLastSeen', () => {
  const now = Date.parse('2026-05-08T12:00:00Z')
  const day = 24 * 60 * 60 * 1000

  it('ordena por lastSeenAt DESC y trunca a 6', () => {
    const concepts = Array.from({ length: 9 }, (_, i) => ({
      name: `c${i}`,
      mastery: 0.5,
      lastSeenAt: new Date(now - i * day).toISOString(),
    }))
    const out = pickTop6ByLastSeen(concepts)
    expect(out).toHaveLength(6)
    expect(out.map((c) => c.name)).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5'])
  })

  it('desempata por mastery DESC y luego name ASC', () => {
    const sameDate = new Date(now).toISOString()
    const concepts = [
      { name: 'Zeta',  mastery: 0.5, lastSeenAt: sameDate },
      { name: 'Alpha', mastery: 0.9, lastSeenAt: sameDate },
      { name: 'Beta',  mastery: 0.9, lastSeenAt: sameDate },
    ]
    const out = pickTop6ByLastSeen(concepts)
    expect(out.map((c) => c.name)).toEqual(['Alpha', 'Beta', 'Zeta'])
  })

  it('retorna [] para entrada inválida', () => {
    expect(pickTop6ByLastSeen(null)).toEqual([])
    expect(pickTop6ByLastSeen(undefined)).toEqual([])
    expect(pickTop6ByLastSeen('not-array')).toEqual([])
  })

  it('filtra entradas sin name válido', () => {
    const out = pickTop6ByLastSeen([
      { name: '', mastery: 1 },
      { name: '  ', mastery: 1 },
      { mastery: 1 },
      { name: 'OK', mastery: 0.5 },
    ])
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('OK')
  })
})

describe('buildLabelPosition', () => {
  it('anchor "middle" para eje vertical (norte/sur)', () => {
    const axes = buildAxes(4, CX, CY, R)
    const northLabel = buildLabelPosition(axes[0], CX, CY, R)
    const southLabel = buildLabelPosition(axes[2], CX, CY, R)
    expect(northLabel.anchor).toBe('middle')
    expect(southLabel.anchor).toBe('middle')
  })

  it('anchor "start" cuando label cae a la derecha del centro', () => {
    const axes = buildAxes(4, CX, CY, R)
    const eastLabel = buildLabelPosition(axes[1], CX, CY, R)
    expect(eastLabel.anchor).toBe('start')
  })

  it('anchor "end" cuando label cae a la izquierda del centro', () => {
    const axes = buildAxes(4, CX, CY, R)
    const westLabel = buildLabelPosition(axes[3], CX, CY, R)
    expect(westLabel.anchor).toBe('end')
  })
})
