/**
 * F11-T5: FeaturesContext — Feature flags por tenant para el Frontend
 *
 * Carga `GET /tenants/me/features` al mount y expone `useFeatures()`.
 * Política optimista: si Negocio está caído o el JWT no existe todavía
 * (usuario en /login), retorna los defaults (todos true) para no romper
 * UX. El refresh manual es posible vía `refresh()`.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_FEATURES, getMyFeatures } from '../services/featuresService'

const FeaturesContext = createContext(null)

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyFeatures()
      setFeatures(data || DEFAULT_FEATURES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <FeaturesContext.Provider value={{ features, loading, refresh }}>
      {children}
    </FeaturesContext.Provider>
  )
}

/**
 * Devuelve `{ features, loading, refresh }`. Si no hay provider montado
 * (e.g. en tests de componentes que no envuelven con FeaturesProvider),
 * retorna los defaults optimistas con un `refresh` no-op. Esto evita
 * fricciones en tests legacy sin sacrificar la garantía en runtime:
 * `App.jsx` siempre monta el provider.
 */
export function useFeatures() {
  const ctx = useContext(FeaturesContext)
  if (!ctx) {
    return {
      features: DEFAULT_FEATURES,
      loading: false,
      refresh: async () => {},
      _fallback: true,
    }
  }
  return ctx
}
