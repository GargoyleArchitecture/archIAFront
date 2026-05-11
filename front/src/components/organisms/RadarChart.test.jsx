/**
 * Tests F8-T2: RadarChart organism
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import RadarChart from './RadarChart'

const NOW = '2026-05-08T12:00:00Z'

function makeConcepts(n) {
  return Array.from({ length: n }, (_, i) => ({
    name: `Concept${i + 1}`,
    mastery: (i + 1) / 10,
    lastSeenAt: new Date(Date.parse(NOW) - i * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

describe('RadarChart', () => {
  it('renderiza un SVG accesible con título y descripción cuando hay >= 3 conceptos', () => {
    render(<RadarChart concepts={makeConcepts(6)} animate={false} />)
    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()
    // <title> y <desc>
    expect(svg.querySelector('title')).toHaveTextContent('Dominio General')
    const desc = svg.querySelector('desc')
    expect(desc.textContent).toMatch(/Mastery en escala 0 a 100/)
    expect(desc.textContent).toMatch(/Concept1/)
  })

  it('muestra placeholder cuando hay < 3 conceptos', () => {
    render(<RadarChart concepts={makeConcepts(2)} animate={false} />)
    expect(screen.getByTestId('radar-placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('radar-chart')).toBeNull()
  })

  it('muestra placeholder con array vacío', () => {
    render(<RadarChart concepts={[]} animate={false} />)
    expect(screen.getByTestId('radar-placeholder')).toBeInTheDocument()
    expect(screen.getByText(/Aún no hay conceptos evaluados/)).toBeInTheDocument()
  })

  it('renderiza un vértice clickable por concepto (truncado a top-6)', () => {
    render(<RadarChart concepts={makeConcepts(9)} animate={false} />)
    // Top 6 → 6 vértices renderizados
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`radar-vertex-${i}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('radar-vertex-6')).toBeNull()
  })

  it('cada vértice queda aria-hidden (F11-T3: la a11y se sirve por la tabla sr-only)', () => {
    render(<RadarChart concepts={makeConcepts(3)} animate={false} />)
    const v0 = screen.getByTestId('radar-vertex-0')
    expect(v0.getAttribute('aria-hidden')).toBe('true')
    // Ya no debe llevar aria-label (era violación aria-allowed-role sobre svg role=img).
    expect(v0.getAttribute('aria-label')).toBeNull()
  })

  it('hover en un vértice muestra el tooltip', () => {
    render(<RadarChart concepts={makeConcepts(4)} animate={false} />)
    const v0 = screen.getByTestId('radar-vertex-0')
    fireEvent.mouseEnter(v0)
    const tooltip = screen.getByTestId('radar-tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip.textContent).toMatch(/Concept1/)
    fireEvent.mouseLeave(v0)
    expect(screen.queryByTestId('radar-tooltip')).toBeNull()
  })

  it('incluye tabla sr-only con los datos para lectores', () => {
    const { container } = render(<RadarChart concepts={makeConcepts(3)} animate={false} />)
    const table = container.querySelector('table.sr-only')
    expect(table).toBeInTheDocument()
    expect(within(table).getByText('Concept1')).toBeInTheDocument()
    expect(within(table).getByText('Concept2')).toBeInTheDocument()
    expect(within(table).getByText('Concept3')).toBeInTheDocument()
  })

  it('SVG responsive: ancho 100% y viewBox configurado por size', () => {
    const { container } = render(<RadarChart concepts={makeConcepts(3)} size={400} animate={false} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('100%')
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 400')
  })
})
