// @vitest-environment jsdom
/**
 * F16-T4: AttemptHistoryItem — historial de un intento con feedback completo.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import AttemptHistoryItem from './AttemptHistoryItem'

const RUBRIC = [
  { concept: 'LRU', description: 'Evicción por uso reciente.', weight: 5 },
  { concept: 'Capac.', description: 'Respeta capacidad.', weight: 4 },
]

const ATTEMPT = {
  id: 'a-1',
  createdAt: '2026-05-18T15:00:00Z',
  status: 'in_progress',
  userResponseText: 'def lru(): ...',
  feedbackJson: {
    score: 72,
    criteria: [
      { concept: 'LRU', status: 'met', comment: 'OK' },
      { concept: 'Capac.', status: 'partial', comment: 'Falta tope' },
    ],
    strengths: ['Estructura clara'],
    improvements: ['Añadir locks'],
    socratic_comment: '¿Y si concurre?',
  },
}

function renderItem(attempt = ATTEMPT, rubric = RUBRIC) {
  return render(
    <ul>
      <AttemptHistoryItem attempt={attempt} rubric={rubric} />
    </ul>,
  )
}

describe('AttemptHistoryItem (F16-T4)', () => {
  it('muestra fecha y score, colapsado por defecto', () => {
    renderItem()
    expect(screen.getByTestId('history-item')).toBeInTheDocument()
    expect(screen.getByTestId('history-item-score')).toHaveTextContent('72/100')
    // Colapsado: el feedback detallado no está montado aún.
    expect(screen.queryByTestId('feedback-panel')).toBeNull()
  })

  it('al expandir muestra rúbrica con resultados + feedback completo', () => {
    renderItem()
    fireEvent.click(screen.getByTestId('history-item-toggle'))
    expect(screen.getByTestId('rubric-card')).toBeInTheDocument()
    expect(screen.getByTestId('feedback-panel')).toBeInTheDocument()
    expect(screen.getByText('def lru(): ...')).toBeInTheDocument()
    // Un criterio por entrada de rúbrica.
    expect(screen.getAllByTestId('rubric-criterion')).toHaveLength(2)
  })

  it('intento sin feedback muestra aviso al expandir', () => {
    renderItem({ ...ATTEMPT, feedbackJson: null })
    expect(screen.getByTestId('history-item-score')).toHaveTextContent('in_progress')
    fireEvent.click(screen.getByTestId('history-item-toggle'))
    expect(screen.getByText(/aún no tiene feedback/i)).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-panel')).toBeNull()
  })
})
