/**
 * toast.js — Minimal event-based toast dispatcher.
 *
 * Services dispatch a `CustomEvent('archia:toast', { detail: { message, severity } })`
 * which is consumed by `<ToastListener />` mounted once at the root of the app.
 *
 * This avoids dragging a global state library into network helpers while still
 * giving the user feedback on auth failures and similar errors.
 */

export const TOAST_EVENT = 'archia:toast'

/**
 * @param {{ message: string, severity?: 'error'|'warning'|'info'|'success', duration?: number }} detail
 */
export function showToast(detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }))
}

export const toast = {
  error:   (message, duration)   => showToast({ message, severity: 'error',   duration }),
  warning: (message, duration)   => showToast({ message, severity: 'warning', duration }),
  info:    (message, duration)   => showToast({ message, severity: 'info',    duration }),
  success: (message, duration)   => showToast({ message, severity: 'success', duration }),
}
