/**
 * Tests F12-T7: RoutinesView con tabs Pendientes/Completados.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import RoutinesView from './RoutinesView'
import { FeaturesProvider } from '../contexts/FeaturesContext'

vi.mock('../services/routinesService', async () => {
  const actual = await vi.importActual('../services/routinesService')
  return {
    ...actual,
    listRoutines: vi.fn(),
  }
})

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-test', role: 'STUDENT' } }),
}))

const ROUTINES_FIXTURE = [
  {
    id: 'r-pending',
    userId: 'user-test',
    title: 'Reto pendiente',
    targetWeakness: 'Concurrency',
    expectedConcepts: ['locks', 'race'],
    difficulty: 3,
    attempts: [],
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'r-completed',
    userId: 'user-test',
    title: 'Reto completado',
    targetWeakness: 'Caching',
    expectedConcepts: ['LRU'],
    difficulty: 4,
    attempts: [
      {
        id: 'a-1',
        status: 'completed',
        score: '88.00',
        feedbackJson: { score: 88, criteria: [] },
        evaluatedAt: '2026-05-08T10:00:00Z',
        completedAt: '2026-05-08T11:00:00Z',
        createdAt: '2026-05-08T09:00:00Z',
      },
    ],
    createdAt: '2026-05-07T10:00:00Z',
  },
  {
    id: 'r-evaluated',
    userId: 'user-test',
    title: 'Reto con intento sin reflexión',
    targetWeakness: 'Resilience',
    expectedConcepts: ['retry'],
    difficulty: 2,
    attempts: [
      {
        id: 'a-2',
        status: 'in_progress',
        score: '60.00',
        feedbackJson: { score: 60, criteria: [] },
        evaluatedAt: '2026-05-09T10:00:00Z',
        completedAt: null,
        createdAt: '2026-05-09T09:00:00Z',
      },
    ],
    createdAt: '2026-05-09T08:00:00Z',
  },
]

function renderRoutinesView({ features = { enableRoutines: true } } = {}) {
  // FeaturesProvider tira fetch; lo capturamos para devolver features bajo control.
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ data: features }),
  })
  globalThis.fetch = mockFetch
  return render(
    <FeaturesProvider>
      <MemoryRouter initialEntries={['/routines']}>
        <Routes>
          <Route path="/routines" element={<RoutinesView />} />
          <Route path="/routines/:routineId" element={<div data-testid="detail-page" />} />
          <Route path="/" element={<div data-testid="home-page" />} />
        </Routes>
      </MemoryRouter>
    </FeaturesProvider>,
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  try { localStorage.clear() } catch { /* noop */ }
  localStorage.setItem('archia.accessToken', 'fake-tok')
  const mod = await import('../services/routinesService')
  mod.listRoutines.mockResolvedValue(ROUTINES_FIXTURE)
})

afterEach(() => {
  delete globalThis.fetch
})

describe('RoutinesView', () => {
  it('renderiza el header del panel y los dos tabs', async () => {
    renderRoutinesView()
    expect(await screen.findByRole('heading', { name: /Mis retos pedag/i })).toBeInTheDocument()
    expect(screen.getByTestId('tab-pending')).toBeInTheDocument()
    expect(screen.getByTestId('tab-completed')).toBeInTheDocument()
  })

  it('por defecto muestra los retos pendientes / en progreso', async () => {
    renderRoutinesView()
    // Esperamos a que carguen las cards (tab pending agrupa 'pending' + 'in_progress').
    const cards = await screen.findAllByTestId('routine-card')
    expect(cards.length).toBe(2)
    const statuses = cards.map((c) => c.getAttribute('data-status')).sort()
    expect(statuses).toEqual(['in_progress', 'pending'])
  })

  it('al click en tab Completados muestra sólo los completados/abandonados', async () => {
    renderRoutinesView()
    await screen.findAllByTestId('routine-card')

    const user = userEvent.setup()
    await user.click(screen.getByTestId('tab-completed'))

    await waitFor(() => {
      const cards = screen.getAllByTestId('routine-card')
      expect(cards.length).toBe(1)
      expect(cards[0].getAttribute('data-status')).toBe('completed')
    })
  })

  it('muestra microcopy de summary según estado', async () => {
    renderRoutinesView()
    const cards = await screen.findAllByTestId('routine-card')
    const summaries = cards
      .map((c) => c.querySelector('[data-testid="routine-card-summary"]')?.textContent)
      .filter(Boolean)
    // El pendiente sin attempts dice "Sin intentos"; el in_progress con feedback dice "Evaluado · 60/100".
    expect(summaries).toEqual(expect.arrayContaining(['Sin intentos', 'Evaluado · 60/100']))
  })

  it('al click en una card navega a /routines/:id', async () => {
    renderRoutinesView()
    const cards = await screen.findAllByTestId('routine-card')
    const user = userEvent.setup()
    await user.click(cards[0])
    await waitFor(() => {
      expect(screen.getByTestId('detail-page')).toBeInTheDocument()
    })
  })

  it('con enableRoutines=false muestra panel deshabilitado', async () => {
    renderRoutinesView({ features: { enableRoutines: false } })
    await waitFor(() => {
      expect(screen.getByText(/Retos pedag.gicos deshabilitados/i)).toBeInTheDocument()
    })
  })

  it('empty state cuando no hay retos en el tab activo', async () => {
    const mod = await import('../services/routinesService')
    mod.listRoutines.mockResolvedValue([])
    renderRoutinesView()
    // F21-T2: copy localizado a español colombiano neutro (tuteo).
    await waitFor(() => {
      expect(screen.getByText(/No tienes retos pendientes/i)).toBeInTheDocument()
    })
  })
})
