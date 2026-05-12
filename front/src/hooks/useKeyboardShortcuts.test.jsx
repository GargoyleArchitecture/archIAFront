/**
 * Tests F6-T5: useKeyboardShortcuts hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useKeyboardShortcuts,
  COMMAND_PALETTE_EVENT,
  FOCUS_INPUT_EVENT,
} from './useKeyboardShortcuts'
import { ModeProvider } from '../contexts/ModeContext'

const wrapper = ({ children }) => <ModeProvider>{children}</ModeProvider>

function pressKey(key, { ctrlKey = true, metaKey = false, target } = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey,
    metaKey,
    bubbles: true,
    cancelable: true,
  })
  ;(target || document).dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-mode')
  })

  it('Ctrl+M alterna el modo via ModeContext', () => {
    document.documentElement.setAttribute('data-mode', 'professional')
    renderHook(() => useKeyboardShortcuts(), { wrapper })

    act(() => {
      pressKey('m', { ctrlKey: true })
    })

    expect(document.documentElement.dataset.mode).toBe('tutor')
  })

  it('Ctrl+M dos veces vuelve al modo original (toggle)', () => {
    document.documentElement.setAttribute('data-mode', 'professional')
    renderHook(() => useKeyboardShortcuts(), { wrapper })

    act(() => pressKey('m', { ctrlKey: true }))
    act(() => pressKey('m', { ctrlKey: true }))

    expect(document.documentElement.dataset.mode).toBe('professional')
  })

  it('Ctrl+K dispara CustomEvent FOCUS_INPUT_EVENT', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper })
    const handler = vi.fn()
    window.addEventListener(FOCUS_INPUT_EVENT, handler)

    act(() => pressKey('k', { ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener(FOCUS_INPUT_EVENT, handler)
  })

  it('Ctrl+/ dispara CustomEvent COMMAND_PALETTE_EVENT', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper })
    const handler = vi.fn()
    window.addEventListener(COMMAND_PALETTE_EVENT, handler)

    act(() => pressKey('/', { ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener(COMMAND_PALETTE_EVENT, handler)
  })

  it('Ctrl+/ NO se dispara si el target es un input editable', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper })
    const handler = vi.fn()
    window.addEventListener(COMMAND_PALETTE_EVENT, handler)

    const input = document.createElement('input')
    input.type = 'text'
    document.body.appendChild(input)
    input.focus()

    act(() => {
      pressKey('/', { ctrlKey: true, target: input })
    })

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(input)
    window.removeEventListener(COMMAND_PALETTE_EVENT, handler)
  })

  it('Cualquier otra letra con Ctrl no dispara nuestros eventos', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper })
    const palette = vi.fn()
    const focus = vi.fn()
    window.addEventListener(COMMAND_PALETTE_EVENT, palette)
    window.addEventListener(FOCUS_INPUT_EVENT, focus)

    act(() => pressKey('a', { ctrlKey: true }))
    act(() => pressKey('z', { ctrlKey: true }))

    expect(palette).not.toHaveBeenCalled()
    expect(focus).not.toHaveBeenCalled()
    window.removeEventListener(COMMAND_PALETTE_EVENT, palette)
    window.removeEventListener(FOCUS_INPUT_EVENT, focus)
  })

  it('No dispara si Alt está activo (no es nuestro patrón)', () => {
    document.documentElement.setAttribute('data-mode', 'professional')
    renderHook(() => useKeyboardShortcuts(), { wrapper })

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(event)
    })

    expect(document.documentElement.dataset.mode).toBe('professional')
  })
})
