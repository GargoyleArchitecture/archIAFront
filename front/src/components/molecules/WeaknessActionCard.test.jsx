/**
 * Tests F8-T4: WeaknessActionCard
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/* ───────── Mocks ───────── */
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockGenerateRoutine = vi.fn()
vi.mock('../../services/profileService', () => ({
  generateRoutine: (...args) => mockGenerateRoutine(...args),
}))

import WeaknessActionCard from './WeaknessActionCard'

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <WeaknessActionCard
        userId="u-1"
        name="Concurrency"
        mastery={0.30}
        lastSeenAt="2026-04-15T10:00:00Z"
        {...props}
      />
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockNavigate.mockReset()
  mockGenerateRoutine.mockReset()
  try { localStorage.clear() } catch { /* noop */ }
})

describe('WeaknessActionCard', () => {
  it('renderiza nombre + severidad + microtexto', () => {
    renderCard()
    expect(screen.getByTestId('weakness-action-card')).toBeInTheDocument()
    expect(screen.getByText('Concurrency')).toBeInTheDocument()
    // mastery=0.30 → severidad Media (boundary: 0.30 cae en medium)
    expect(screen.getByRole('status')).toHaveTextContent('Media')
    expect(screen.getByText(/Último visto/i)).toBeInTheDocument()
  })

  it('mapea severidad alta para mastery < 0.3', () => {
    renderCard({ mastery: 0.10 })
    expect(screen.getByRole('status')).toHaveTextContent('Alta')
  })

  it('deshabilita el botón cuando no hay userId', () => {
    renderCard({ userId: '' })
    const btn = screen.getByRole('button', { name: /Generar reto/i })
    expect(btn).toBeDisabled()
  })

  it('F12-T9: en éxito navega a /routines/:id y persiste el id en localStorage', async () => {
    vi.useFakeTimers()
    try {
      mockGenerateRoutine.mockResolvedValueOnce({
        id: 'r-1',
        title: 'Resolver race condition',
        targetWeakness: 'Concurrency',
        expectedConcepts: ['locks', 'channels'],
        difficulty: 3,
      })
      renderCard()
      fireEvent.click(screen.getByRole('button', { name: /Generar reto/i }))

      // Loading antes de resolver
      expect(screen.getByRole('button', { name: /Generando reto/i })).toBeDisabled()

      // Resolver la promise primero (process microtasks)
      await act(async () => {
        await Promise.resolve()
      })
      expect(screen.getByTestId('weakness-success')).toBeInTheDocument()

      // Avanzar el timer del navigate (act envuelve el setState dentro del setTimeout)
      await act(async () => {
        vi.advanceTimersByTime(1300)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/routines/r-1')
      expect(mockGenerateRoutine).toHaveBeenCalledWith({
        userId: 'u-1',
        targetWeakness: 'Concurrency',
      })
      // F12-T9: el id queda persistido para deep-link.
      expect(localStorage.getItem('archia.routines.lastGeneratedId')).toBe('r-1')
    } finally {
      vi.useRealTimers()
    }
  })

  it('en error: muestra alert inline + botón Reintentar que vuelve a llamar al service', async () => {
    mockGenerateRoutine.mockRejectedValueOnce(new Error('HTTP 500'))
    mockGenerateRoutine.mockResolvedValueOnce({
      id: 'r-2',
      title: 'OK',
      targetWeakness: 'Concurrency',
    })
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /Generar reto/i }))

    await waitFor(() => {
      expect(screen.getByTestId('weakness-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('weakness-success')).toBeInTheDocument()
    })
    expect(mockGenerateRoutine).toHaveBeenCalledTimes(2)
  })

  it('mensaje friendly en timeout/404', async () => {
    mockGenerateRoutine.mockRejectedValueOnce(new Error('HTTP 404 timeout'))
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /Generar reto/i }))
    await waitFor(() => {
      expect(screen.getByTestId('weakness-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/tardó más de lo esperado/i)).toBeInTheDocument()
  })

  it('no llama al service si name está vacío', () => {
    renderCard({ name: '   ' })
    const btn = screen.getByRole('button', { name: /Generar reto/i })
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(mockGenerateRoutine).not.toHaveBeenCalled()
  })
})
