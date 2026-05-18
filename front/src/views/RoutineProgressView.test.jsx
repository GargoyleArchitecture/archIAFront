// @vitest-environment jsdom
/**
 * F18-T1 (routing) + F18-T2 (dashboard): RoutineProgressView.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { ModeProvider } from '../contexts/ModeContext'

/* ── Mocks ── */
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockGetUserProfile = vi.fn()
vi.mock('../services/profileService', () => ({
  getUserProfile: (...a) => mockGetUserProfile(...a),
  // WeaknessActionCard importa generateRoutine (no se invoca en estos tests).
  generateRoutine: vi.fn(),
}))

const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }))

let featuresValue = { enableProfileDashboard: true, enableRoutines: true }
vi.mock('../contexts/FeaturesContext', () => ({
  useFeatures: () => ({ features: featuresValue }),
}))

import RoutineProgressView from './RoutineProgressView'

const populated = {
  userId: 'u-1',
  strengths: ['SOLID'],
  weaknesses: ['Concurrency'],
  evaluatedConcepts: [
    { name: 'SOLID', mastery: 0.85, decayRate: 0.05, lastSeenAt: '2026-05-01T10:00:00Z' },
    { name: 'Concurrency', mastery: 0.3, decayRate: 0.05, lastSeenAt: '2026-04-15T10:00:00Z' },
  ],
  updatedAt: '2026-05-08T12:00:00Z',
}
const empty = { userId: 'u-1', strengths: [], weaknesses: [], evaluatedConcepts: [] }

function renderProgress() {
  return render(
    <MemoryRouter>
      <ModeProvider>
        <RoutineProgressView />
      </ModeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  featuresValue = { enableProfileDashboard: true, enableRoutines: true }
  mockUseAuth.mockReturnValue({ user: { id: 'u-1' } })
})

describe('routing /routines/progreso (F18-T1)', () => {
  it('la ruta estática resuelve a RoutineProgressView (no a la detalle)', () => {
    mockGetUserProfile.mockResolvedValue(empty)
    render(
      <MemoryRouter initialEntries={['/routines/progreso']}>
        <ModeProvider>
          <Routes>
            <Route path="/routines/progreso" element={<RoutineProgressView />} />
            <Route path="/routines/:id" element={<div data-testid="detail-stub" />} />
          </Routes>
        </ModeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('routine-progress-view')).toBeInTheDocument()
    expect(screen.queryByTestId('detail-stub')).toBeNull()
  })

  it('un id arbitrario sí resuelve a la vista detalle (sin colisión)', () => {
    render(
      <MemoryRouter initialEntries={['/routines/abc-123']}>
        <ModeProvider>
          <Routes>
            <Route path="/routines/progreso" element={<RoutineProgressView />} />
            <Route path="/routines/:id" element={<div data-testid="detail-stub" />} />
          </Routes>
        </ModeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('detail-stub')).toBeInTheDocument()
    expect(screen.queryByTestId('routine-progress-view')).toBeNull()
  })
})

describe('RoutineProgressView dashboard (F18-T2)', () => {
  it('loading muestra el skeleton', () => {
    mockGetUserProfile.mockReturnValue(new Promise(() => {})) // pendiente
    renderProgress()
    expect(screen.getByTestId('progress-skeleton')).toBeInTheDocument()
  })

  it('ready renderiza radar + fortalezas + debilidades (con CTA) + por repasar', async () => {
    mockGetUserProfile.mockResolvedValue(populated)
    renderProgress()
    expect(await screen.findByTestId('progress-ready')).toBeInTheDocument()
    expect(screen.getByText('Dominio General')).toBeInTheDocument()
    expect(screen.getByTestId('strengths-grid')).toBeInTheDocument()
    expect(screen.getByTestId('weaknesses-grid')).toBeInTheDocument()
    // Loop débil→reto: la debilidad usa WeaknessActionCard (CTA Generar reto).
    expect(screen.getByTestId('weakness-action-card')).toBeInTheDocument()
    expect(screen.getByText('Por repasar')).toBeInTheDocument()
  })

  it('empty muestra estado motivacional y CTA navega al chat', async () => {
    mockGetUserProfile.mockResolvedValue(empty)
    renderProgress()
    const cta = await screen.findByRole('button', { name: /Hablar con el agente/i })
    fireEvent.click(cta)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('error muestra panel y Reintentar vuelve a llamar al servicio', async () => {
    mockGetUserProfile.mockRejectedValueOnce(new Error('Error de red'))
    renderProgress()
    const retry = await screen.findByRole('button', { name: /Reintentar/i })
    mockGetUserProfile.mockResolvedValueOnce(empty)
    fireEvent.click(retry)
    await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalledTimes(2))
  })

  it('gate enableProfileDashboard=false muestra panel deshabilitado', async () => {
    featuresValue = { enableProfileDashboard: false, enableRoutines: true }
    mockGetUserProfile.mockResolvedValue(populated)
    renderProgress()
    const view = screen.getByTestId('routine-progress-view')
    expect(view).toHaveAttribute('data-state', 'disabled')
    fireEvent.click(screen.getByRole('button', { name: /Volver a mis retos/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/routines')
  })
})
