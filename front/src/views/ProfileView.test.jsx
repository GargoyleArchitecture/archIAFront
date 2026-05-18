/**
 * Tests ProfileView (F18-T3): la vista quedó con SOLO Cuenta + Preferencias.
 * El dominio técnico (radar/fortalezas/debilidades/olvido) se movió a
 * `RoutineProgressView` ("Mi progreso", bajo /routines) — ver
 * RoutineProgressView.test.jsx.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ModeProvider } from '../contexts/ModeContext'

const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }))

import ProfileView from './ProfileView'

function renderView() {
  return render(
    <MemoryRouter>
      <ModeProvider>
        <ProfileView />
      </ModeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseAuth.mockReset()
  mockUseAuth.mockReturnValue({
    user: { id: 'u-1', name: 'Tester', email: 'tester@archia.dev' },
  })
})

describe('ProfileView — Cuenta + Preferencias (F18-T3)', () => {
  it('renderiza la sección Cuenta con los datos del usuario', () => {
    renderView()
    expect(screen.getByTestId('profile-account')).toBeInTheDocument()
    expect(screen.getByText('Tester')).toBeInTheDocument()
    expect(screen.getByText('tester@archia.dev')).toBeInTheDocument()
  })

  it('renderiza la sección Preferencias de comunicación', () => {
    renderView()
    expect(screen.getByTestId('profile-preferences')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /Explanation Style/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /Verbosity/i })).toBeInTheDocument()
  })

  it('ya NO muestra el dominio técnico (movido a Mi progreso)', () => {
    renderView()
    expect(screen.queryByTestId('profile-skeleton')).toBeNull()
    expect(screen.queryByTestId('profile-ready')).toBeNull()
    expect(screen.queryByTestId('profile-empty')).toBeNull()
    expect(screen.queryByText('Dominio General')).toBeNull()
    expect(screen.queryByText('Curva de Olvido')).toBeNull()
  })

  it('sin usuario muestra el aviso de Cuenta y no Preferencias', () => {
    mockUseAuth.mockReturnValue({ user: null })
    renderView()
    expect(screen.getByText(/Inicia sesión para ver tus datos/i)).toBeInTheDocument()
    expect(screen.queryByTestId('profile-preferences')).toBeNull()
  })
})
