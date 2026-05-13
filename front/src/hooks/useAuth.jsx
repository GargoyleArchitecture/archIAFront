import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import * as authService from '../services/authService'
import {
  STORAGE_KEYS as KEYS,
  AUTH_EXPIRED_EVENT,
  getAccessToken,
  clearTokens,
} from '../services/http'

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function userFromToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload) return null
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    name: payload.name || payload.email?.split('@')[0] || 'User',
  }
}

function resolveUser(result) {
  if (result?.user) return result.user
  if (result?.accessToken) return userFromToken(result.accessToken)
  return null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  /* ── Initialization: verify stored token on mount ──
     authorizedFetch (vía apiRequest en getMe) maneja internamente el caso
     401 → refresh → retry, así que aquí solo necesitamos un try/catch. */
  useEffect(() => {
    let cancelled = false

    async function init() {
      const storedAccess = getAccessToken()
      if (!storedAccess) {
        if (!cancelled) setIsLoading(false)
        return
      }

      try {
        const me = await authService.getMe()
        if (cancelled) return
        const resolved = me?.id ? me : (me?.user ?? userFromToken(getAccessToken() || storedAccess))
        setUser(resolved)
        if (resolved) {
          try { localStorage.setItem(KEYS.USER, JSON.stringify(resolved)) } catch { /* noop */ }
        }
      } catch {
        if (cancelled) return
        clearTokens()
        setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  /* ── Auto-logout cuando el refresh falla a mitad de sesión ──
     `http.js` dispara `archia:auth:expired` cuando refreshAccessToken()
     no puede renovar (token rotado/expirado/revocado). */
  useEffect(() => {
    function handleExpired() {
      clearTokens()
      setUser(null)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    const result = await authService.login({ email, password })
    const me = resolveUser(result)
    setUser(me)
    if (me) {
      try { localStorage.setItem(KEYS.USER, JSON.stringify(me)) } catch { /* noop */ }
    }
  }, [])

  const register = useCallback(async ({ name, email, password, tenantName }) => {
    setError(null)
    const result = await authService.register({ name, email, password, tenantName })
    const me = resolveUser(result)
    setUser(me)
    if (me) {
      try { localStorage.setItem(KEYS.USER, JSON.stringify(me)) } catch { /* noop */ }
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* noop */ }
    setUser(null)
  }, [])

  /**
   * Refetch /auth/me y actualiza el user state (incluye `tenant` cargado).
   * Útil después de login (donde el user inicial viene del JWT decode y no
   * incluye relaciones) o cuando se necesita info fresca del backend.
   */
  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe()
      if (me?.id) {
        setUser(me)
        try { localStorage.setItem(KEYS.USER, JSON.stringify(me)) } catch { /* noop */ }
        return me
      }
    } catch { /* el caller decide qué hacer si falla */ }
    return null
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
