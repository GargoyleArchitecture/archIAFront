/**
 * Tests F8-T1: ProfileView
 *
 * Cobertura:
 *  - Estado loading muestra el skeleton.
 *  - Estado ready renderiza las 4 secciones.
 *  - Estado empty muestra el CTA y al hacer click navega a /.
 *  - Estado error muestra panel con botón Reintentar que vuelve a llamar al servicio.
 *  - Sin user.id no se llama al servicio (defensivo).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ModeProvider } from '../contexts/ModeContext'

/* ───────── Mocks ───────── */
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockGetUserProfile = vi.fn()
vi.mock('../services/profileService', () => ({
  getUserProfile: (...args) => mockGetUserProfile(...args),
}))

const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

/* Import DESPUÉS de los mocks. */
import ProfileView from './ProfileView'

/* ───────── Helpers ───────── */
function renderView() {
  return render(
    <MemoryRouter>
      <ModeProvider>
        <ProfileView />
      </ModeProvider>
    </MemoryRouter>
  )
}

const populatedProfile = {
  userId: 'u-1',
  strengths: ['SOLID', 'Caching'],
  weaknesses: ['Concurrency'],
  evaluatedConcepts: [
    { name: 'SOLID',       mastery: 0.85, decayRate: 0.05, lastSeenAt: '2026-05-01T10:00:00Z' },
    { name: 'Concurrency', mastery: 0.30, decayRate: 0.05, lastSeenAt: '2026-04-15T10:00:00Z' },
  ],
  updatedAt: '2026-05-08T12:00:00Z',
}

const emptyProfile = {
  userId: 'u-1',
  strengths: [],
  weaknesses: [],
  evaluatedConcepts: [],
  updatedAt: '2026-05-08T12:00:00Z',
}

beforeEach(() => {
  mockNavigate.mockReset()
  mockGetUserProfile.mockReset()
  mockUseAuth.mockReset()
  mockUseAuth.mockReturnValue({ user: { id: 'u-1', name: 'Tester' } })
})

/* ───────── Tests ───────── */
describe('ProfileView', () => {
  it('muestra el skeleton mientras carga', () => {
    // Promise pendiente → status="loading" persiste durante el render inicial.
    mockGetUserProfile.mockImplementation(() => new Promise(() => {}))
    renderView()
    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument()
  })

  it('renderiza las 4 secciones cuando el perfil tiene datos', async () => {
    mockGetUserProfile.mockResolvedValueOnce(populatedProfile)
    renderView()

    await waitFor(() => {
      expect(screen.getByTestId('profile-ready')).toBeInTheDocument()
    })

    expect(screen.getByText('Dominio General')).toBeInTheDocument()
    expect(screen.getByText('Fortalezas')).toBeInTheDocument()
    expect(screen.getByText('Debilidades')).toBeInTheDocument()
    expect(screen.getByText('Curva de Olvido')).toBeInTheDocument()
  })

  it('muestra el CTA en estado vacío y navega a / al pulsarlo', async () => {
    mockGetUserProfile.mockResolvedValueOnce(emptyProfile)
    renderView()

    await waitFor(() => {
      expect(screen.getByTestId('profile-empty')).toBeInTheDocument()
    })

    const cta = screen.getByRole('button', {
      name: /Hablar con el agente para construir tu perfil/i,
    })
    fireEvent.click(cta)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('muestra panel de error y reintenta al hacer click', async () => {
    mockGetUserProfile.mockRejectedValueOnce(new Error('HTTP 500'))
    mockGetUserProfile.mockResolvedValueOnce(populatedProfile)

    renderView()
    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('profile-ready')).toBeInTheDocument()
    })
    expect(mockGetUserProfile).toHaveBeenCalledTimes(2)
  })

  it('trata 404 como perfil vacío (no como error)', async () => {
    mockGetUserProfile.mockRejectedValueOnce(new Error('HTTP 404'))
    renderView()
    await waitFor(() => {
      expect(screen.getByTestId('profile-empty')).toBeInTheDocument()
    })
  })

  it('no llama al servicio si no hay user.id', () => {
    mockUseAuth.mockReturnValue({ user: null })
    renderView()
    expect(mockGetUserProfile).not.toHaveBeenCalled()
  })
})
