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
 *   mermaidCode:      string,
 *   sessionId:        string,
 *   messageId:        string | undefined,
 *   suggestions:      string[],
 * }>}
 */
export async function sendMessage({ text, sessionId, images = [] }) {
  const form = new FormData()
  form.append('message',    text)
  form.append('session_id', sessionId)
  images.forEach((img, i) => form.append(`image${i + 1}`, img.file))

  const resp = await fetch(`${API}/message`, { method: 'POST', body: form })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)

  const data = await resp.json()

  return {
    text:             data?.endMessage                        ?? '—',
    internalMessages: Array.isArray(data?.messages)  ? data.messages    : [],
    mermaidCode:      data?.mermaidCode                       ?? '',
    sessionId:        data?.session_id                        ?? sessionId,
    messageId:        data?.message_id,
    suggestions:      Array.isArray(data?.suggestions) ? data.suggestions : [],
  }
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
