import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { emit as emitTelemetry } from '../services/telemetryService'

const STORAGE_KEY = 'arquia.mode'
const VALID_MODES = ['tutor', 'professional']
const DEFAULT_MODE = 'professional'

const ModeContext = createContext(null)

function readInitialMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && VALID_MODES.includes(stored)) return stored
  } catch {
    // localStorage might be unavailable (privacy mode, sandbox).
  }
  return DEFAULT_MODE
}

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(readInitialMode)

  // Aplica el atributo data-mode en <html> sin re-render del arbol React.
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore storage errors
    }
  }, [mode])

  const setMode = useCallback((next) => {
    if (!VALID_MODES.includes(next)) return
    setModeState((prev) => {
      if (prev !== next) {
        // F11-T6: instrumentación de cambio de modo.
        emitTelemetry('mode_changed', { payload: { from: prev, to: next } })
      }
      return next
    })
  }, [])

  const toggle = useCallback(() => {
    setModeState((m) => {
      const next = m === 'tutor' ? 'professional' : 'tutor'
      // F11-T6: instrumentación (toggle es el camino más usado del UI).
      emitTelemetry('mode_changed', { payload: { from: m, to: next, via: 'toggle' } })
      return next
    })
  }, [])

  return (
    <ModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within <ModeProvider>')
  return ctx
}
