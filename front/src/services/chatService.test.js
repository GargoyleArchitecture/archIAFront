// @vitest-environment jsdom
/**
 * F13-T1: chatService.sendMessage adjunta explanation_style/verbosity al
 * FormData (camelCase → snake_case) cuando se proveen, y los omite si no.
 *
 * F19-T2: chatService.listChats adjunta `userId` al query string cuando se
 * provee, como defensa en profundidad (el backend ya acota por JWT en F19-T1).
 */
import { describe, it, beforeEach, expect, vi } from 'vitest'

const mockAuthFetch = vi.fn()
const mockAuthJson  = vi.fn()
vi.mock('./authFetch', () => ({
  authFetch: (...args) => mockAuthFetch(...args),
  authJson:  (...args) => mockAuthJson(...args),
}))

import { sendMessage, listChats } from './chatService'

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

/* ─────────────── F19-T2: listChats envía userId ─────────────── */

describe('chatService.listChats — userId en query (F19-T2)', () => {
  beforeEach(() => {
    mockAuthJson.mockReset()
    mockAuthJson.mockResolvedValue({ data: [] })
  })

  const lastUrl = () => mockAuthJson.mock.calls[mockAuthJson.mock.calls.length - 1][0]

  it('adjunta userId al query string cuando se provee', async () => {
    await listChats({ userId: 'u-123', limit: 50 })
    const url = lastUrl()
    const qs = new URL(url, 'http://x').searchParams
    expect(qs.get('userId')).toBe('u-123')
    expect(qs.get('limit')).toBe('50')
  })

  it('omite userId del query si no se provee (fallback al scoping por JWT)', async () => {
    await listChats({ limit: 50 })
    const url = lastUrl()
    const qs = new URL(url, 'http://x').searchParams
    expect(qs.has('userId')).toBe(false)
  })

  it('compone projectId y userId cuando ambos vienen', async () => {
    await listChats({ projectId: 'p-1', userId: 'u-1', limit: 100 })
    const url = lastUrl()
    const qs = new URL(url, 'http://x').searchParams
    expect(qs.get('projectId')).toBe('p-1')
    expect(qs.get('userId')).toBe('u-1')
  })
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
