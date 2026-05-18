/**
 * F13-T1: PreferencesContext — provider único compartido por chat y perfil.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockLoad = vi.fn()
const mockSave = vi.fn()
let mockPreference = { explanationStyle: null, verbosity: null }

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))
vi.mock('../hooks/useUserPreference', () => ({
  useUserPreference: (userId) => ({
    preference: mockPreference,
    isLoading: false,
    error: null,
    load: () => mockLoad(userId),
    save: mockSave,
  }),
}))

import { PreferencesProvider, usePreferences } from './PreferencesContext'

function Reader() {
  const { preference } = usePreferences()
  return (
    <div>
      <div data-testid="style">{String(preference.explanationStyle)}</div>
      <div data-testid="verbosity">{String(preference.verbosity)}</div>
    </div>
  )
}

beforeEach(() => {
  mockLoad.mockReset()
  mockSave.mockReset()
  mockPreference = { explanationStyle: null, verbosity: null }
})

describe('PreferencesContext', () => {
  it('carga la preferencia al mount (con el userId de useAuth) y la expone', async () => {
    mockPreference = { explanationStyle: 'FORMAL', verbosity: 'HIGH' }
    render(
      <PreferencesProvider>
        <Reader />
      </PreferencesProvider>,
    )
    await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('u1'))
    expect(screen.getByTestId('style')).toHaveTextContent('FORMAL')
    expect(screen.getByTestId('verbosity')).toHaveTextContent('HIGH')
  })

  it('expone reload y save desde el hook subyacente', async () => {
    let ctxRef
    function Capturer() {
      ctxRef = usePreferences()
      return null
    }
    render(
      <PreferencesProvider>
        <Capturer />
      </PreferencesProvider>,
    )
    await waitFor(() => expect(mockLoad).toHaveBeenCalledTimes(1))
    expect(typeof ctxRef.reload).toBe('function')
    expect(typeof ctxRef.save).toBe('function')
    ctxRef.save({ explanationStyle: 'CONCISE', verbosity: 'LOW' })
    expect(mockSave).toHaveBeenCalledWith({ explanationStyle: 'CONCISE', verbosity: 'LOW' })
  })

  it('usePreferences fuera del provider degrada seguro (no lanza)', () => {
    // Mismo criterio que FeaturesContext: vistas standalone en tests no
    // deben romperse. En producción el provider siempre está montado.
    render(<Reader />)
    expect(screen.getByTestId('style')).toHaveTextContent('null')
    expect(screen.getByTestId('verbosity')).toHaveTextContent('null')
  })
})
