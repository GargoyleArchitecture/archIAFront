/**
 * Tests F11-T6: telemetryService
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
  emit,
  flushNow,
  _resetForTests,
  _peekQueueForTests,
} from './telemetryService'

beforeEach(() => {
  _resetForTests()
  vi.useFakeTimers()
  // Mock global.fetch para que no haga red real
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
})

afterEach(() => {
  vi.useRealTimers()
  _resetForTests()
})

describe('telemetryService.emit', () => {
  it('encola con event, userId y timestamp ISO', () => {
    emit('mode_changed', { userId: 'u-1', payload: { from: 'tutor', to: 'professional' } })
    const q = _peekQueueForTests()
    expect(q).toHaveLength(1)
    expect(q[0].event).toBe('mode_changed')
    expect(q[0].userId).toBe('u-1')
    expect(q[0].payload).toEqual({ from: 'tutor', to: 'professional' })
    expect(typeof q[0].timestamp).toBe('string')
    expect(q[0].timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('userId null cuando no se pasa', () => {
    emit('profile_viewed')
    expect(_peekQueueForTests()[0].userId).toBeNull()
  })

  it('omite el payload si no se pasa', () => {
    emit('profile_viewed', { userId: 'u-1' })
    const rec = _peekQueueForTests()[0]
    expect('payload' in rec).toBe(false)
  })

  it('ignora event vacío o no-string (no encola, no lanza)', () => {
    emit('')
    emit('   ')
    emit(null)
    emit(undefined)
    emit(42)
    expect(_peekQueueForTests()).toHaveLength(0)
  })

  it('dispara flush automático al llegar al threshold (5 eventos)', async () => {
    for (let i = 0; i < 5; i++) emit(`event_${i}`)
    // Después del 5to evento se debería disparar flushNow inmediatamente
    await vi.runAllTimersAsync()
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const callBody = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(callBody.events).toHaveLength(5)
  })

  it('flushNow envía batch y vacía la cola', async () => {
    emit('e1')
    emit('e2')
    expect(_peekQueueForTests()).toHaveLength(2)
    await flushNow()
    expect(_peekQueueForTests()).toHaveLength(0)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('flushNow con cola vacía no llama fetch', async () => {
    await flushNow()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('si fetch lanza, NO propaga el error', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('network'))
    emit('e1')
    await expect(flushNow()).resolves.toBeUndefined()
  })

  it('debounce: emit < threshold programa flush diferido', async () => {
    emit('e1')
    emit('e2')
    expect(globalThis.fetch).not.toHaveBeenCalled()
    // Avanzamos el timer del debounce
    await vi.advanceTimersByTimeAsync(1500)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
})
