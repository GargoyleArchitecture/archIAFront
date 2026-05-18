// @vitest-environment jsdom
/**
 * F13-T1: chatService.sendMessage adjunta explanation_style/verbosity al
 * FormData (camelCase → snake_case) cuando se proveen, y los omite si no.
 */
import { describe, it, beforeEach, expect, vi } from 'vitest'

const mockAuthFetch = vi.fn()
vi.mock('./authFetch', () => ({
  authFetch: (...args) => mockAuthFetch(...args),
  authJson: vi.fn(),
}))

import { sendMessage } from './chatService'

function streamingResponseWithComplete() {
  const evt = 'data: {"type":"complete","endMessage":"ok","session_id":"s1"}\n\n'
  const chunk = new TextEncoder().encode(evt)
  let sent = false
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: async () =>
          sent ? { done: true } : ((sent = true), { value: chunk, done: false }),
        cancel: async () => {},
      }),
    },
  }
}

function lastFormData() {
  const [, opts] = mockAuthFetch.mock.calls[mockAuthFetch.mock.calls.length - 1]
  return opts.body
}

beforeEach(() => {
  mockAuthFetch.mockReset()
  mockAuthFetch.mockResolvedValue(streamingResponseWithComplete())
})

describe('chatService.sendMessage — preferencias por-turno (F13-T1)', () => {
  it('adjunta explanation_style y verbosity cuando se proveen', async () => {
    await sendMessage({
      text: 'hola',
      sessionId: 's1',
      userId: 'u1',
      explanationStyle: 'FORMAL',
      verbosity: 'HIGH',
    })
    const form = lastFormData()
    expect(form.get('explanation_style')).toBe('FORMAL')
    expect(form.get('verbosity')).toBe('HIGH')
  })

  it('omite ambos campos si no se proveen (fallback a Negocio)', async () => {
    await sendMessage({ text: 'hola', sessionId: 's1', userId: 'u1' })
    const form = lastFormData()
    expect(form.has('explanation_style')).toBe(false)
    expect(form.has('verbosity')).toBe(false)
  })

  it('omite el campo faltante y adjunta el presente', async () => {
    await sendMessage({
      text: 'hola',
      sessionId: 's1',
      userId: 'u1',
      verbosity: 'LOW',
    })
    const form = lastFormData()
    expect(form.has('explanation_style')).toBe(false)
    expect(form.get('verbosity')).toBe('LOW')
  })
})
