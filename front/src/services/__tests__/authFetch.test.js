// @vitest-environment jsdom
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'

vi.mock('../authService', () => ({
  refreshToken: vi.fn(),
}))

import { authFetch, authJson, AuthExpiredError } from '../authFetch'
import * as authService from '../authService'

// Some environments don't auto-expose a working localStorage; provide a Map-backed shim.
function makeStorageShim() {
  const m = new Map()
  return {
    getItem:    (k) => (m.has(k) ? m.get(k) : null),
    setItem:    (k, v) => { m.set(k, String(v)) },
    removeItem: (k) => { m.delete(k) },
    clear:      ()  => { m.clear() },
    key:        (i) => Array.from(m.keys())[i] ?? null,
    get length()    { return m.size },
  }
}
const ls = makeStorageShim()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: ls })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: ls })
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('authFetch', () => {
  beforeEach(() => {
    ls.setItem('archia.accessToken', 'old-access')
    ls.setItem('archia.refreshToken', 'refresh-1')
    ls.setItem('archia.user', JSON.stringify({ id: 'u1' }))
    vi.spyOn(globalThis, 'fetch')
    authService.refreshToken.mockReset()
  })

  afterEach(() => {
    ls.clear()
    vi.restoreAllMocks()
  })

  it('refreshes the access token once on 401 and retries the original request', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { statusCode: 200, message: 'OK', data: { id: 42 } }))
    authService.refreshToken.mockResolvedValueOnce({ accessToken: 'new-access' })

    const result = await authJson('/api/v1/projects/42')

    expect(result).toEqual({ id: 42 })
    expect(authService.refreshToken).toHaveBeenCalledTimes(1)
    expect(authService.refreshToken).toHaveBeenCalledWith('refresh-1')
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)

    const firstCallHeaders = globalThis.fetch.mock.calls[0][1].headers
    expect(firstCallHeaders.Authorization).toBe('Bearer old-access')
    const retryHeaders = globalThis.fetch.mock.calls[1][1].headers
    expect(retryHeaders.Authorization).toBe('Bearer new-access')

    expect(localStorage.getItem('archia.accessToken')).toBe('new-access')
  })

  it('clears storage and throws AuthExpiredError when refresh fails', async () => {
    globalThis.fetch.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
    authService.refreshToken.mockRejectedValueOnce(new Error('refresh-bad'))
    const eventSpy = vi.fn()
    window.addEventListener('archia:auth-expired', eventSpy)

    await expect(authJson('/api/v1/projects')).rejects.toBeInstanceOf(AuthExpiredError)

    expect(localStorage.getItem('archia.accessToken')).toBeNull()
    expect(localStorage.getItem('archia.refreshToken')).toBeNull()
    expect(eventSpy).toHaveBeenCalledTimes(1)
    window.removeEventListener('archia:auth-expired', eventSpy)
  })

  it('clears storage and throws AuthExpiredError when retry returns 401 again', async () => {
    globalThis.fetch
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'still expired' }))
    authService.refreshToken.mockResolvedValueOnce({ accessToken: 'new-access' })

    await expect(authFetch('/api/v1/anything')).rejects.toBeInstanceOf(AuthExpiredError)
    expect(localStorage.getItem('archia.accessToken')).toBeNull()
  })

  it('preserves FormData bodies (no Content-Type override)', async () => {
    globalThis.fetch.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const fd = new FormData()
    fd.append('foo', 'bar')

    await authFetch('/upload', { method: 'POST', body: fd })

    const init = globalThis.fetch.mock.calls[0][1]
    expect(init.body).toBe(fd)
    expect(init.headers['Content-Type']).toBeUndefined()
    expect(init.headers.Authorization).toBe('Bearer old-access')
  })

  it('passes through non-401 responses without calling refresh', async () => {
    globalThis.fetch.mockResolvedValueOnce(jsonResponse(500, { message: 'server' }))

    const res = await authFetch('/api/v1/projects')

    expect(res.status).toBe(500)
    expect(authService.refreshToken).not.toHaveBeenCalled()
  })
})
