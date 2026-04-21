/**
 * chatService.js — Capa de red: llamadas HTTP al backend de ArchIA
 *
 * Encapsula los dos endpoints del chat. Cada función recibe parámetros
 * con nombre, construye el FormData, llama al backend y retorna los
 * datos ya formateados — sin lógica de estado ni referencias a React.
 */

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

/* ================================================================
   sendMessage
   POST /message
   Envía el texto del usuario (más imágenes opcionales) y retorna
   la respuesta del asistente con todos sus metadatos.
================================================================ */

/**
 * @param {{ text: string, sessionId: string, images: Array<{file: File}> }} params
 * @returns {Promise<{
 *   text:             string,
 *   internalMessages: object[],
 *   sessionId:        string,
 *   messageId:        string | undefined,
 *   suggestions:      string[],
 * }>}
 */
export async function sendMessage({ text, sessionId, images = [], onPartial } = {}) {
  const form = new FormData()
  form.append('message',    text)
  form.append('session_id', sessionId)
  images.forEach((img, i) => form.append(`image${i + 1}`, img.file))

  const resp = await fetch(`${API}/message`, { method: 'POST', body: form })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  if (!resp.body) throw new Error('Response body is not a readable stream')

  const reader  = resp.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer    = ''
  let final     = null
  let streamErr = null

  outer: while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      const dataLine = rawEvent
        .split('\n')
        .filter((ln) => ln.startsWith('data:'))
        .map((ln) => ln.slice(5).trimStart())
        .join('\n')
      if (!dataLine) continue
      if (dataLine === '[DONE]') break outer

      let evt
      try { evt = JSON.parse(dataLine) } catch { continue }

      if (evt.type === 'complete') { final = evt; break outer }
      else if (evt.type === 'error') { streamErr = new Error(evt.message || 'Stream error'); break outer }
      else if (evt.type === 'partial' && typeof onPartial === 'function') onPartial(evt)
    }
  }

  try { await reader.cancel() } catch { /* stream already closed */ }

  if (streamErr) throw streamErr
  if (!final)    throw new Error('Stream ended without a complete event')

  return {
    text:             final?.endMessage                          ?? '—',
    internalMessages: Array.isArray(final?.messages)    ? final.messages    : [],
    sessionId:        final?.session_id                          ?? sessionId,
    messageId:        final?.message_id,
    suggestions:      Array.isArray(final?.suggestions) ? final.suggestions : [],
  }
}

/* ================================================================
   Diagram exports (Graphviz pipeline)
================================================================ */

/**
 * @param {{
 *  sessionId: string,
 *  format?: 'svg'|'dot'|'dot_drawio'|'drawio'
 * }} params
 */
export function buildDiagramExportUrl({ sessionId, format = 'svg' }) {
  const query = new URLSearchParams()
  query.set('session_id', sessionId)
  query.set('format', format)
  return `${API}/diagram/export?${query.toString()}`
}

/**
 * @param {{ sessionId: string }} params
 * @returns {Promise<{ svgText: string }>} 
 */
export async function fetchDiagramSvg({ sessionId }) {
  const url = buildDiagramExportUrl({ sessionId, format: 'svg' })
  const resp = await fetch(url)
  const rawText = await resp.text()

  if (!resp.ok) {
    let message = rawText || `HTTP ${resp.status}`
    try {
      const parsed = JSON.parse(rawText)
      if (parsed?.detail) message = String(parsed.detail)
      if (parsed?.message) message = String(parsed.message)
    } catch {
      // ignore json parsing errors
    }
    const error = new Error(message)
    error.status = resp.status
    throw error
  }

  return { svgText: rawText }
}

/* ================================================================
   sendFeedback
   POST /feedback
   Registra la valoración (pulgar arriba/abajo) de una respuesta.
================================================================ */

/**
 * @param {{ sessionId: string, messageId: string, thumbsUp: 0|1, thumbsDown: 0|1 }} params
 * @returns {Promise<void>}
 */
export async function sendFeedback({ sessionId, messageId, thumbsUp, thumbsDown }) {
  const form = new FormData()
  form.append('session_id',  sessionId)
  form.append('message_id',  messageId)
  form.append('thumbs_up',   thumbsUp)
  form.append('thumbs_down', thumbsDown)

  await fetch(`${API}/feedback`, { method: 'POST', body: form })
}
