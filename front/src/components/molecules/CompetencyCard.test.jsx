/**
 * Tests F10-T3: CompetencyCard
 */
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CompetencyCard from './CompetencyCard'

describe('CompetencyCard', () => {
  it('renderiza nombre + severidad + microtexto + conceptos', () => {
    render(
      <CompetencyCard
        name="Concurrency"
        mastery={0.65}
        concepts={['locks', 'channels']}
        lastSeenAt="2026-04-15T10:00:00Z"
      />
    )
    expect(screen.getByTestId('competency-card')).toBeInTheDocument()
    expect(screen.getByText('Concurrency')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /Severidad/ })).toHaveTextContent('Baja')
    expect(screen.getByTestId('competency-mastery')).toHaveTextContent('65 %')
    expect(screen.getByText(/Último visto/)).toBeInTheDocument()
  })

  it('mapea severidad alta cuando mastery < 0.3', () => {
    render(<CompetencyCard name="Caching" mastery={0.20} />)
    expect(screen.getByRole('status', { name: /Severidad/ })).toHaveTextContent('Alta')
  })

  it('mapea severidad media cuando 0.3 <= mastery < 0.6', () => {
    render(<CompetencyCard name="X" mastery={0.45} />)
    expect(screen.getByRole('status', { name: /Severidad/ })).toHaveTextContent('Media')
  })

  it('no renderiza microtexto si no hay mastery ni lastSeenAt', () => {
    render(<CompetencyCard name="X" />)
    expect(screen.queryByTestId('competency-mastery')).toBeNull()
    expect(screen.queryByText(/Último visto/)).toBeNull()
  })

  it('renderiza concept pills cuando se proveen', () => {
    render(<CompetencyCard name="X" concepts={['a', 'b', 'c']} />)
    const grid = screen.getByTestId('competency-concepts')
    expect(within(grid).getByText('a')).toBeInTheDocument()
    expect(within(grid).getByText('b')).toBeInTheDocument()
    expect(within(grid).getByText('c')).toBeInTheDocument()
  })

  it('filtra entradas no-string de concepts', () => {
    render(<CompetencyCard name="X" concepts={['ok', '', '   ', null, 42]} />)
    const grid = screen.getByTestId('competency-concepts')
    const pills = within(grid).getAllByRole('status', { name: /Concepto/ })
    expect(pills).toHaveLength(1)
    expect(pills[0]).toHaveTextContent('ok')
  })

  it('retorna null sin name válido', () => {
    const { container, rerender } = render(<CompetencyCard name="" />)
    expect(container.firstChild).toBeNull()
    rerender(<CompetencyCard name={null} />)
    expect(container.firstChild).toBeNull()
  })
})
