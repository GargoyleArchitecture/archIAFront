/**
 * Tests F11-T5: FeaturesContext
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

const mockGetMyFeatures = vi.fn()
vi.mock('../services/featuresService', () => ({
  getMyFeatures: (...args) => mockGetMyFeatures(...args),
  DEFAULT_FEATURES: {
    enableTutorMode: true,
    enableProfileDashboard: true,
    enableRoutines: true,
  },
}))

import { FeaturesProvider, useFeatures } from './FeaturesContext'

function Reader() {
  const { features, loading } = useFeatures()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="tutor">{String(features.enableTutorMode)}</div>
      <div data-testid="dashboard">{String(features.enableProfileDashboard)}</div>
      <div data-testid="routines">{String(features.enableRoutines)}</div>
    </div>
  )
}

beforeEach(() => {
  mockGetMyFeatures.mockReset()
})

describe('FeaturesContext', () => {
  it('carga las features al mount y expone los flags via useFeatures', async () => {
    mockGetMyFeatures.mockResolvedValueOnce({
      enableTutorMode: false,
      enableProfileDashboard: true,
      enableRoutines: false,
    })
    render(
      <FeaturesProvider>
        <Reader />
      </FeaturesProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })
    expect(screen.getByTestId('tutor')).toHaveTextContent('false')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('true')
    expect(screen.getByTestId('routines')).toHaveTextContent('false')
  })

  it('aplica defaults optimistas si getMyFeatures retorna undefined', async () => {
    mockGetMyFeatures.mockResolvedValueOnce(undefined)
    render(
      <FeaturesProvider>
        <Reader />
      </FeaturesProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })
    expect(screen.getByTestId('tutor')).toHaveTextContent('true')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('true')
    expect(screen.getByTestId('routines')).toHaveTextContent('true')
  })

  it('refresh() vuelve a llamar al service', async () => {
    mockGetMyFeatures.mockResolvedValueOnce({
      enableTutorMode: true,
      enableProfileDashboard: true,
      enableRoutines: true,
    })
    let ctxRef
    function Capturer() {
      ctxRef = useFeatures()
      return null
    }
    render(
      <FeaturesProvider>
        <Capturer />
      </FeaturesProvider>,
    )
    await waitFor(() => expect(mockGetMyFeatures).toHaveBeenCalledTimes(1))

    mockGetMyFeatures.mockResolvedValueOnce({
      enableTutorMode: false,
      enableProfileDashboard: true,
      enableRoutines: true,
    })
    await act(async () => {
      await ctxRef.refresh()
    })
    expect(mockGetMyFeatures).toHaveBeenCalledTimes(2)
    expect(ctxRef.features.enableTutorMode).toBe(false)
  })

  it('useFeatures fuera del provider retorna defaults optimistas (no lanza)', () => {
    // Compatibilidad con tests legacy y components que se renderizan
    // standalone sin envolver con FeaturesProvider.
    render(<Reader />)
    expect(screen.getByTestId('tutor')).toHaveTextContent('true')
    expect(screen.getByTestId('dashboard')).toHaveTextContent('true')
    expect(screen.getByTestId('routines')).toHaveTextContent('true')
  })
})
