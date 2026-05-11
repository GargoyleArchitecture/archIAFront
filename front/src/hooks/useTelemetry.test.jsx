/**
 * Tests F11-T6: useTelemetry
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

/* Mocks */
const mockEmit = vi.fn()
vi.mock('../services/telemetryService', () => ({
  emit: (...args) => mockEmit(...args),
}))

const mockUseAuth = vi.fn()
vi.mock('./useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

import { useTelemetry } from './useTelemetry'

beforeEach(() => {
  mockEmit.mockReset()
  mockUseAuth.mockReset()
})

describe('useTelemetry', () => {
  it('emit incluye userId del usuario autenticado', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u-42' } })
    const { result } = renderHook(() => useTelemetry())
    result.current.emit('mode_changed', { from: 'tutor', to: 'professional' })
    expect(mockEmit).toHaveBeenCalledWith('mode_changed', {
      userId: 'u-42',
      payload: { from: 'tutor', to: 'professional' },
    })
  })

  it('emit con userId null cuando no hay usuario autenticado', () => {
    mockUseAuth.mockReturnValue({ user: null })
    const { result } = renderHook(() => useTelemetry())
    result.current.emit('profile_viewed')
    expect(mockEmit).toHaveBeenCalledWith('profile_viewed', {
      userId: null,
      payload: undefined,
    })
  })

  it('ignora event vacío o no-string', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u-1' } })
    const { result } = renderHook(() => useTelemetry())
    result.current.emit('')
    result.current.emit(null)
    result.current.emit(undefined)
    expect(mockEmit).not.toHaveBeenCalled()
  })

  it('tolera useAuth retornando undefined sin lanzar', () => {
    mockUseAuth.mockReturnValue(undefined)
    const { result } = renderHook(() => useTelemetry())
    result.current.emit('x')
    expect(mockEmit).toHaveBeenCalledWith('x', { userId: null, payload: undefined })
  })
})
