import { createContext, useContext, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserPreference } from '../hooks/useUserPreference'

/**
 * PreferencesContext — F13-T1
 *
 * Provider único de las preferencias de comunicación del usuario
 * (explanationStyle + verbosity). Espejo estructural de ModeContext.
 *
 * Centraliza `useUserPreference` para que el chat (useChatManager) y el
 * perfil (ProfileView) compartan UNA sola fuente de verdad: guardar desde
 * el perfil se refleja de inmediato en lo que el chat envía a /message,
 * sin necesidad de iniciar una sesión nueva.
 *
 * Debe montarse bajo <AuthProvider> (usa useAuth para el userId).
 *
 * Nota: `usePreferences` degrada de forma segura fuera del provider
 * (devuelve preferencia vacía + no-ops) en vez de lanzar — mismo criterio
 * que FeaturesContext, porque vistas como ProfileView se renderizan
 * standalone en tests. En producción el provider siempre está montado.
 */
const PreferencesContext = createContext(null)

const _SAFE_FALLBACK = {
  preference: { explanationStyle: null, verbosity: null },
  isLoading: false,
  error: null,
  reload: () => {},
  save: async () => {},
}

export function PreferencesProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null
  const { preference, isLoading, error, load, save } = useUserPreference(userId)

  useEffect(() => {
    if (userId) load()
  }, [userId, load])

  return (
    <PreferencesContext.Provider
      value={{ preference, isLoading, error, reload: load, save }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  return ctx || _SAFE_FALLBACK
}
