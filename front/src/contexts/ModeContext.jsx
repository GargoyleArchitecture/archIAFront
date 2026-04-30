import { createContext, useContext, useEffect, useState, useCallback } from 'react'

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
    setModeState(next)
  }, [])

  const toggle = useCallback(() => {
    setModeState((m) => (m === 'tutor' ? 'professional' : 'tutor'))
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
