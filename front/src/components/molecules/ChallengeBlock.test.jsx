/**
 * Tests F9-T1: ChallengeBlock
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockSubmitAttempt = vi.fn()
vi.mock('../../services/profileService', () => ({
  submitAttempt: (...args) => mockSubmitAttempt(...args),
}))

import ChallengeBlock from './ChallengeBlock'
import { ModeProvider } from '../../contexts/ModeContext'

const sampleRoutine = {
  id: 'r-1',
  title: 'Refactorizar caching naïve',
  targetWeakness: 'Caching',
  expectedConcepts: ['lru', 'invalidation'],
  difficulty: 3,
  inverseRagSnippet: 'def get(k):\n    return cache.get(k)',
}

function renderBlock(props = {}) {
  return render(
    <ModeProvider>
      <ChallengeBlock routine={sampleRoutine} onClose={() => {}} {...props} />
    </ModeProvider>
  )
}

beforeEach(() => {
  mockSubmitAttempt.mockReset()
})

describe('ChallengeBlock', () => {
  it('renderiza título, dificultad y conceptos esperados', () => {
    renderBlock()
    expect(screen.getByTestId('challenge-block')).toBeInTheDocument()
    expect(screen.getByText('Refactorizar caching naïve')).toBeInTheDocument()
    expect(screen.getByTestId('challenge-difficulty')).toHaveTextContent('Dificultad 3/5')
    expect(screen.getByText('lru')).toBeInTheDocument()
    expect(screen.getByText('invalidation')).toBeInTheDocument()
  })

  it('renderiza el snippet de RAG inverso si está presente', () => {
    renderBlock()
    expect(screen.getByTestId('challenge-snippet')).toBeInTheDocument()
    expect(screen.getByText(/def get\(k\)/)).toBeInTheDocument()
  })

  it('NO renderiza el snippet si la rutina no lo trae', () => {
    renderBlock({ routine: { ...sampleRoutine, inverseRagSnippet: undefined } })
    expect(screen.queryByTestId('challenge-snippet')).toBeNull()
  })

  it('retorna null si no hay routine.id', () => {
    const { container } = render(
      <ModeProvider>
        <ChallengeBlock routine={null} onClose={() => {}} />
      </ModeProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('envía el intento con submitAttempt(routineId, {status:"completed"}) y transiciona a scored', async () => {
    mockSubmitAttempt.mockResolvedValueOnce({ id: 'att-1', status: 'completed' })
    renderBlock()

    const textarea = screen.getByPlaceholderText('Escribe tu intento aquí…')
    fireEvent.change(textarea, { target: { value: 'Usaría un LRU con TTL.' } })

    // Simular Enter para enviar
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByTestId('challenge-scored')).toBeInTheDocument()
    })
    expect(mockSubmitAttempt).toHaveBeenCalledWith('r-1', { status: 'completed' })
    // Una vez scored, el wrapper del input desaparece
    expect(screen.queryByTestId('challenge-input-wrapper')).toBeNull()
  })

  it('en error: muestra alert + botón Reintentar que reusa el texto previo', async () => {
    mockSubmitAttempt.mockRejectedValueOnce(new Error('HTTP 500'))
    mockSubmitAttempt.mockResolvedValueOnce({ id: 'att-2', status: 'completed' })
    renderBlock()

    const textarea = screen.getByPlaceholderText('Escribe tu intento aquí…')
    fireEvent.change(textarea, { target: { value: 'Primer intento' } })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(screen.getByTestId('challenge-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument()

    // Reintentar usa el texto previo (no requiere reescribir)
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('challenge-scored')).toBeInTheDocument()
    })
    expect(mockSubmitAttempt).toHaveBeenCalledTimes(2)
  })

  it('progress bar refleja el step actual (attempt en idle)', () => {
    renderBlock()
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    // El label del step "Intento" vive fuera del <ol> pero dentro del bar wrapper.
    // En idle el step actual es 'attempt' → su segmento lleva aria-current="step".
    const currentSegment = bar.querySelector('[aria-current="step"]')
    expect(currentSegment).toBeInTheDocument()
    expect(currentSegment.getAttribute('data-step')).toBe('attempt')
  })

  it('botón Cerrar dispara onClose', () => {
    const onClose = vi.fn()
    renderBlock({ onClose })
    fireEvent.click(screen.getByRole('button', { name: /Cerrar reto/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
