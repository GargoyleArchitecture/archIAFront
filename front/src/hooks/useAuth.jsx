import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as authService from '../services/authService'

const KEYS = {
  ACCESS:  'archia.accessToken',
  REFRESH: 'archia.refreshToken',
  USER:    'archia.user',
}

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
  if (result.user) return result.user
  if (result.accessToken) return userFromToken(result.accessToken)
  return null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  function clearStorage() {
    localStorage.removeItem(KEYS.ACCESS)
    localStorage.removeItem(KEYS.REFRESH)
    localStorage.removeItem(KEYS.USER)
  }

  const clearAuthState = useCallback(() => {
    clearStorage()
    setUser(null)
    setError(null)
    setIsLoading(false)
  }, [])

  /* ── Initialization: verify stored token on mount ── */
  useEffect(() => {
    let cancelled = false

    async function init() {
      const storedAccess  = localStorage.getItem(KEYS.ACCESS)
      const storedRefresh = localStorage.getItem(KEYS.REFRESH)

      if (!storedAccess) {
        setIsLoading(false)
        return
      }

      try {
        const me = await authService.getMe(storedAccess)
        if (!cancelled) {
          const resolved = me?.id ? me : (me?.user ?? userFromToken(storedAccess))
          setUser(resolved)
          localStorage.setItem(KEYS.USER, JSON.stringify(resolved))
        }
      } catch {
        if (storedRefresh) {
          try {
            const refreshResult = await authService.refreshToken(storedRefresh)
            const newAccess = refreshResult.accessToken
            localStorage.setItem(KEYS.ACCESS, newAccess)

            try {
              const me = await authService.getMe(newAccess)
              const resolved = me?.id ? me : (me?.user ?? userFromToken(newAccess))
              if (!cancelled) {
                setUser(resolved)
                localStorage.setItem(KEYS.USER, JSON.stringify(resolved))
              }
            } catch {
              const fromToken = userFromToken(newAccess)
              if (!cancelled && fromToken) {
                setUser(fromToken)
                localStorage.setItem(KEYS.USER, JSON.stringify(fromToken))
              } else {
                clearStorage()
                if (!cancelled) setUser(null)
              }
            }
          } catch {
            clearStorage()
            if (!cancelled) setUser(null)
          }
        } else {
          clearStorage()
          if (!cancelled) setUser(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleAuthExpired = () => clearAuthState()
    window.addEventListener('archia-auth-expired', handleAuthExpired)
    return () => window.removeEventListener('archia-auth-expired', handleAuthExpired)
  }, [clearAuthState])

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    const result = await authService.login({ email, password })
    localStorage.setItem(KEYS.ACCESS, result.accessToken)
    localStorage.setItem(KEYS.REFRESH, result.refreshToken)

    const me = resolveUser(result)
    setUser(me)
    localStorage.setItem(KEYS.USER, JSON.stringify(me))
  }, [])

  const register = useCallback(async ({ name, email, password, tenantName }) => {
    setError(null)
    const result = await authService.register({ name, email, password, tenantName })
    localStorage.setItem(KEYS.ACCESS, result.accessToken)
    localStorage.setItem(KEYS.REFRESH, result.refreshToken)

    const me = resolveUser(result)
    setUser(me)
    localStorage.setItem(KEYS.USER, JSON.stringify(me))
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem(KEYS.ACCESS)
    if (token) {
      authService.logout(token).catch(() => {})
    }
    clearAuthState()
  }, [clearAuthState])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
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

AuthProvider.propTypes = {
  children: PropTypes.node,
}
