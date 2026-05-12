/**
 * useKeyboardShortcuts — Hook global de atajos de teclado.
 *
 * Se monta UNA VEZ en App.jsx (vía un componente helper que esté
 * dentro de <ModeProvider>). Escucha keyboard a nivel de documento y
 * dispara las acciones globales del producto.
 *
 * Atajos:
 *   Ctrl+M / Cmd+M  → toggle de modo Tutor ↔ Profesional (via ModeContext).
 *   Ctrl+/ / Cmd+/  → CustomEvent COMMAND_PALETTE_EVENT
 *                     (un componente futuro escuchará y abrirá la paleta;
 *                      por ahora es no-op silencioso, listo para Fase 7+).
 *   Ctrl+K / Cmd+K  → CustomEvent FOCUS_INPUT_EVENT
 *                     (MessageInput escucha y enfoca su textarea).
 *
 * Reglas para no interferir con shortcuts del navegador:
 *   - Sólo previene default cuando reconoce la combinación.
 *   - Ignora si `altKey` está activo (no es nuestro patrón).
 *   - No intercepta cuando se usa dentro de <input>/<textarea>/[contenteditable]
 *     SI la tecla es una letra normal (preserva edición), excepto los
 *     atajos que tienen sentido global como Ctrl+K (focus input).
 *
 * Plataforma:
 *   - macOS    → metaKey (Cmd)
 *   - Windows/Linux → ctrlKey
 *   Detección: navigator.userAgentData.platform (preferida) con fallback
 *   a navigator.platform.
 */

import { useEffect } from 'react'
import { useMode } from '../contexts/ModeContext'

export const COMMAND_PALETTE_EVENT = 'arquia-command-palette'
export const FOCUS_INPUT_EVENT     = 'arquia-focus-input'

export function isMacPlatform() {
  if (typeof navigator === 'undefined') return false
  const platform =
    navigator.userAgentData?.platform || navigator.platform || ''
  return /Mac|iPhone|iPad/i.test(platform)
}

function isEditableTarget(target) {
  if (!target) return false
  const tag = (target.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  return target.isContentEditable === true
}

export function useKeyboardShortcuts() {
  const { toggle } = useMode()

  useEffect(() => {
    const isMac = isMacPlatform()

    const handler = (e) => {
      const modKey = isMac ? e.metaKey : e.ctrlKey
      if (!modKey) return
      // Si Alt está activo, no es nuestro patrón.
      if (e.altKey) return

      const key = (e.key || '').toLowerCase()
      const editable = isEditableTarget(e.target)

      switch (key) {
        case 'm': {
          // Ctrl/Cmd+M es seguro globalmente; no choca con edición.
          e.preventDefault()
          toggle()
          break
        }
        case '/': {
          // Sólo capturamos si NO estamos en un campo editable
          // (en un textarea, "/" puede ser parte del texto + Cmd no aplica).
          if (editable) return
          e.preventDefault()
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENT))
          }
          break
        }
        case 'k': {
          // Ctrl+K para focus en el input es global; preserva la
          // semántica esperada (idéntica a Slack, GitHub, Discord).
          e.preventDefault()
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(FOCUS_INPUT_EVENT))
          }
          break
        }
        default:
          // Cualquier otro Ctrl+X no nos interesa; pasa al navegador.
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggle])
}

export default useKeyboardShortcuts
