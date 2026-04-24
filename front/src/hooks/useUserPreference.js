/**
 * useUserPreference.js — Estado y operaciones de preferencias del usuario
 *
 * Carga y persiste las preferencias de comunicación del usuario
 * (explanationStyle + verbosity) desde el Backend API.
 * Los campos pueden ser null si el usuario no ha configurado preferencias aún.
 */

import { useState, useCallback } from 'react'
import * as preferenceService from '../services/preferenceService'

/**
 * @param {string} userId — ID del usuario autenticado (desde useAuth)
 * @returns {{
 *   preference: { explanationStyle: string|null, verbosity: string|null },
 *   isLoading: boolean,
 *   error: string|null,
 *   load: () => Promise<void>,
 *   save: (params: { explanationStyle?: string, verbosity?: string }) => Promise<void>,
 * }}
 */
export function useUserPreference(userId) {
  const [preference, setPreference] = useState({ explanationStyle: null, verbosity: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await preferenceService.getPreferences(userId)
      setPreference({
        explanationStyle: data?.explanationStyle ?? null,
        verbosity: data?.verbosity ?? null,
      })
    } catch (err) {
      // 404 significa que aún no hay preferencias — no es un error real
      if (!err.message?.includes('404')) {
        setError(err.message)
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
