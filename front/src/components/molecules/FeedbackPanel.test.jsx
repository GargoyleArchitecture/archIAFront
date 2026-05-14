/**
 * Tests F12-T8: FeedbackPanel
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeedbackPanel from './FeedbackPanel'

const FEEDBACK = {
  score: 78,
  criteria: [],
  strengths: ['Estructura clara del decorador', 'Logging detallado'],
  improvements: ['Añadir jitter', 'Implementar circuit breaker'],
  socratic_comment: '¿Qué pasaría si tres réplicas reintentaran al mismo tiempo?',
}

describe('FeedbackPanel', () => {
  it('renderiza score, fortalezas, áreas de mejora y comentario socrático', () => {
    render(<FeedbackPanel feedback={FEEDBACK} />)
    const score = screen.getByTestId('feedback-score')
    expect(score.textContent).toContain('78')
    expect(screen.getByText('Fortalezas')).toBeInTheDocument()
    expect(screen.getByText('Áreas de mejora')).toBeInTheDocument()
    expect(screen.getByText(/jitter/i)).toBeInTheDocument()
    expect(screen.getByTestId('feedback-socratic')).toBeInTheDocument()
  })

  it('clamp del score entre 0 y 100', () => {
    render(<FeedbackPanel feedback={{ ...FEEDBACK, score: 150 }} />)
    expect(screen.getByTestId('feedback-score').textContent).toContain('100')
  })

  it('clamp inferior: score negativo → 0', () => {
    render(<FeedbackPanel feedback={{ ...FEEDBACK, score: -10 }} />)
    expect(screen.getByTestId('feedback-score').textContent).toContain('0')
  })

  it('omite la sección socratic si no viene', () => {
    render(<FeedbackPanel feedback={{ ...FEEDBACK, socratic_comment: '' }} />)
    expect(screen.queryByTestId('feedback-socratic')).toBeNull()
  })

  it('retorna null si feedback es null/no-objeto', () => {
    const { container } = render(<FeedbackPanel feedback={null} />)
    expect(container.firstChild).toBeNull()
  })
})
