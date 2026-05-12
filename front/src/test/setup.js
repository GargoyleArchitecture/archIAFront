/**
 * F6 Ciclo 2: setup global de Vitest.
 *
 * - Registra los matchers de @testing-library/jest-dom (toBeInTheDocument,
 *   toHaveAttribute, toHaveStyle, etc.).
 * - Limpia el DOM entre tests automáticamente (RTL ≥ 13 lo hace solo).
 */
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  // Reset data-mode en <html> entre tests para aislar el theming
  document.documentElement.removeAttribute('data-mode')
  // Limpia localStorage para evitar que el modo persistido por un test
  // contamine al siguiente vía ModeProvider.readInitialMode().
  try {
    window.localStorage.clear()
  } catch {
    // jsdom puede no tener localStorage en setups muy estrictos
  }
})
