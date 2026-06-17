/**
 * useUserPreference.js — Estado y operaciones de preferencias del usuario
 *
 * Carga y persiste las preferencias de comunicación del usuario
 * (explanationStyle + verbosity) desde el Backend API.
 *
 * F20-T4: el estado nunca es null. El estado inicial y los fallbacks ante
 * 404 / null devuelven `ANALOGY/MEDIUM`, alineados con el server que también
 * coerce a esos defaults en `UsersService.getPreferences`. Así el chat envía
 * preferencias válidas desde el primer turno, sin requerir que el usuario
 * pase por el perfil ni esperar al fetch.
 */

import { useState, useCallback } from 'react'
import * as preferenceService from '../services/preferenceService'

/** F20-T4: defaults globales del frontend (espejo del server). */
const DEFAULTS = Object.freeze({
  explanationStyle: 'ANALOGY',
  verbosity: 'MEDIUM',
})

/**
 * @param {string} userId — ID del usuario autenticado (desde useAuth)
 * @returns {{
 *   preference: { explanationStyle: string, verbosity: string },
 *   isLoading: boolean,
 *   error: string|null,
 *   load: () => Promise<void>,
 *   save: (params: { explanationStyle?: string, verbosity?: string }) => Promise<void>,
 * }}
 */
export function useUserPreference(userId) {
  const [preference, setPreference] = useState({ ...DEFAULTS })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await preferenceService.getPreferences(userId)
      setPreference({
        explanationStyle: data?.explanationStyle ?? DEFAULTS.explanationStyle,
        verbosity:        data?.verbosity        ?? DEFAULTS.verbosity,
      })
    } catch (err) {
      // 404 significa que aún no hay preferencias — caemos a los defaults
      // globales (F20-T4). No es un error real.
      if (!err.message?.includes('404')) {
        setError(err.message)
      } else {
        setPreference({ ...DEFAULTS })
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const save = useCallback(async ({ explanationStyle, verbosity }) => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      await preferenceService.upsertPreferences(userId, { explanationStyle, verbosity })
      setPreference({ explanationStyle, verbosity })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  return { preference, isLoading, error, load, save }
}
