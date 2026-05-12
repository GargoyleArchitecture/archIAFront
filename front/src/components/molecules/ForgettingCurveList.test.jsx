/**
 * Tests F8-T5: ForgettingCurveList
 */
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ForgettingCurveList, { computeOpacity } from './ForgettingCurveList'

const NOW = Date.parse('2026-05-08T12:00:00Z')
const DAY = 24 * 60 * 60 * 1000

describe('computeOpacity (pure)', () => {
  it('retorna 1 cuando deltaDays = 0', () => {
    const iso = new Date(NOW).toISOString()
    expect(computeOpacity({
      lastSeenAt: iso, decayRate: 0.05, defaultDecayRate: 0.05, minOpacity: 0.25, now: NOW,
    })).toBeCloseTo(1, 4)
  })

  it('aplica clamp al minOpacity (delta grande)', () => {
    const iso = new Date(NOW - 365 * DAY).toISOString()  // 1 año
    const op = computeOpacity({
      lastSeenAt: iso, decayRate: 0.05, defaultDecayRate: 0.05, minOpacity: 0.25, now: NOW,
    })
    expect(op).toBe(0.25)
  })

  it('decae según exp(-decayRate * deltaDays) entre extremos', () => {
    const iso = new Date(NOW - 10 * DAY).toISOString()
    const op = computeOpacity({
      lastSeenAt: iso, decayRate: 0.05, defaultDecayRate: 0.05, minOpacity: 0.0, now: NOW,
    })
    // exp(-0.05 * 10) ≈ 0.6065
    expect(op).toBeCloseTo(0.6065, 3)
  })

  it('usa defaultDecayRate cuando decayRate no es finito', () => {
    const iso = new Date(NOW - 10 * DAY).toISOString()
    const op = computeOpacity({
      lastSeenAt: iso, decayRate: NaN, defaultDecayRate: 0.10, minOpacity: 0.0, now: NOW,
    })
    expect(op).toBeCloseTo(Math.exp(-0.10 * 10), 3)
  })

  it('retorna 1 si lastSeenAt es inválido/ausente', () => {
    expect(computeOpacity({
      lastSeenAt: null, decayRate: 0.05, defaultDecayRate: 0.05, minOpacity: 0.25, now: NOW,
    })).toBe(1)
    expect(computeOpacity({
      lastSeenAt: 'not-a-date', decayRate: 0.05, defaultDecayRate: 0.05, minOpacity: 0.25, now: NOW,
    })).toBe(1)
  })
})

describe('ForgettingCurveList', () => {
  it('renderiza items ordenados por opacidad desc (más frescos arriba)', () => {
    const concepts = [
      { name: 'Stale',  mastery: 0.5, decayRate: 0.05, lastSeenAt: new Date(NOW - 100 * DAY).toISOString() },
      { name: 'Fresh',  mastery: 0.8, decayRate: 0.05, lastSeenAt: new Date(NOW - 1   * DAY).toISOString() },
      { name: 'Medium', mastery: 0.6, decayRate: 0.05, lastSeenAt: new Date(NOW - 20  * DAY).toISOString() },
    ]
    render(<ForgettingCurveList concepts={concepts} now={NOW} />)
    const list = screen.getByTestId('forgetting-list')
    const items = within(list).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Fresh')
    expect(items[1]).toHaveTextContent('Medium')
    expect(items[2]).toHaveTextContent('Stale')
  })

  it('respeta el minOpacity (texto sigue legible)', () => {
    const concepts = [
      { name: 'VeryOld', decayRate: 0.05, lastSeenAt: new Date(NOW - 400 * DAY).toISOString() },
    ]
    render(<ForgettingCurveList concepts={concepts} now={NOW} minOpacity={0.25} />)
    const item = screen.getByRole('listitem')
    expect(parseFloat(item.style.opacity)).toBeCloseTo(0.25, 2)
  })

  it('muestra placeholder con array vacío', () => {
    render(<ForgettingCurveList concepts={[]} now={NOW} />)
    expect(screen.getByText(/No hay conceptos para mostrar/)).toBeInTheDocument()
  })

  it('muestra placeholder con concepts no-array', () => {
    render(<ForgettingCurveList concepts={null} now={NOW} />)
    expect(screen.getByText(/No hay conceptos para mostrar/)).toBeInTheDocument()
  })

  it('renderiza opacidad 1.0 cuando lastSeenAt está ausente', () => {
    const concepts = [{ name: 'Unknown', mastery: 0.5 }]
    render(<ForgettingCurveList concepts={concepts} now={NOW} />)
    const item = screen.getByRole('listitem')
    expect(parseFloat(item.style.opacity)).toBeCloseTo(1, 2)
    expect(item).toHaveTextContent('sin registro')
  })

  it('muestra el tooltip pedagógico en el icono de ayuda', () => {
    const concepts = [{ name: 'A', decayRate: 0.05, lastSeenAt: new Date(NOW).toISOString() }]
    render(<ForgettingCurveList concepts={concepts} now={NOW} />)
    const help = screen.getByLabelText(/Explicación de la curva de olvido/i)
    expect(help).toBeInTheDocument()
  })
})
