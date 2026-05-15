/**
 * Tests F12-T8: RubricCard
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RubricCard from './RubricCard'

const RUBRIC = [
  { concept: 'LRU', description: 'Implementa evicción por uso reciente.', weight: 5 },
  { concept: 'Capacidad', description: 'Respeta la capacidad configurada.', weight: 4 },
  { concept: 'Concurrencia', description: 'Es seguro bajo accesos concurrentes.', weight: 3 },
]

const RESULTS = [
  { concept: 'LRU', status: 'met', comment: 'Bien implementado con OrderedDict.' },
  { concept: 'Capacidad', status: 'partial', comment: 'Falta validar el upper bound.' },
  { concept: 'Concurrencia', status: 'missing', comment: 'No hay locks.' },
]

describe('RubricCard', () => {
  it('renderiza todos los criterios en modo pre-evaluación (sin results)', () => {
    render(<RubricCard rubric={RUBRIC} />)
    const rows = screen.getAllByTestId('rubric-criterion')
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(row.getAttribute('data-status')).toBe('pending')
    }
    expect(screen.getByText('LRU')).toBeInTheDocument()
    expect(screen.getByText(/Peso · 5/)).toBeInTheDocument()
  })

  it('renderiza status y comment cuando viene results', () => {
    render(<RubricCard rubric={RUBRIC} results={RESULTS} />)
    const rows = screen.getAllByTestId('rubric-criterion')
    const statuses = rows.map((r) => r.getAttribute('data-status'))
    expect(statuses).toEqual(['met', 'partial', 'missing'])

    const comments = screen.getAllByTestId('rubric-comment').map((c) => c.textContent)
    expect(comments).toEqual([
      'Bien implementado con OrderedDict.',
      'Falta validar el upper bound.',
      'No hay locks.',
    ])
  })

  it('cuando results trae menos criterios que rubric, los faltantes quedan pending', () => {
    render(<RubricCard rubric={RUBRIC} results={[RESULTS[0]]} />)
    const rows = screen.getAllByTestId('rubric-criterion')
    expect(rows[0].getAttribute('data-status')).toBe('met')
    expect(rows[1].getAttribute('data-status')).toBe('pending')
    expect(rows[2].getAttribute('data-status')).toBe('pending')
  })

  it('retorna null con rúbrica vacía o inválida', () => {
    const { container } = render(<RubricCard rubric={[]} />)
    expect(container.firstChild).toBeNull()
    const { container: c2 } = render(<RubricCard rubric={null} />)
    expect(c2.firstChild).toBeNull()
  })
})
