/**
 * F6 Ciclo 2: helper de testing.
 *
 * `renderWithMode(ui, { mode })` envuelve un componente en `<ModeProvider>` y
 * además fuerza el atributo `data-mode` en el `<html>` ANTES del render para
 * que los tokens `--mode-*` resuelvan correctamente durante el test.
 *
 * Uso típico:
 *
 *   const { container } = renderWithMode(<BubbleMessage variant="user">Hi</BubbleMessage>, { mode: 'tutor' })
 *   expect(container.firstChild).toMatchSnapshot()
 */
import { render } from '@testing-library/react'
import { ModeProvider } from '../contexts/ModeContext'

export function renderWithMode(ui, { mode = 'professional', ...renderOptions } = {}) {
  // Forzamos el atributo en el <html> ANTES de montar el árbol React.
  // ModeProvider también lo hace en su useEffect, pero así garantizamos
  // que la primera medición ya tenga el modo correcto (importante para
  // assertions sobre estilos calculados).
  document.documentElement.setAttribute('data-mode', mode)
  // También colocamos el valor en localStorage para que ModeProvider lo
  // hidrate idéntico (no hay race conditions con su readInitialMode).
  try {
    window.localStorage.setItem('arquia.mode', mode)
  } catch {
    // localStorage puede no existir en jsdom estricto; no es crítico.
  }

  return render(<ModeProvider>{ui}</ModeProvider>, renderOptions)
}

export default renderWithMode
