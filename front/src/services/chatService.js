/**
 * chatService.js — Capa de red: Backend Inteligente + Backend API
 *
 * Dos bases URL diferenciadas:
 *   AI_BASE  → Backend Inteligente (FastAPI/LangGraph, puerto 8000)
 *   API_BASE → Backend API (NestJS/PostgreSQL, puerto 3000)
 *
 * Cada función recibe parámetros con nombre, llama al backend correspondiente
 * y retorna los datos ya formateados — sin lógica de estado ni referencias a React.
 */

import { authFetch, authJson } from './authFetch'

const AI_BASE = import.meta.env.VITE_AI_BASE || 'http://localhost:8000'

const API_BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/v1`
  : '/api/v1'

/* ================================================================
   Helper para llamadas al Backend API (JSON, con Bearer token y
   refresh transparente en 401 vía authFetch).
================================================================ */

async function apiRequest(url, opts = {}) {
  return authJson(url, opts)
}

/* ================================================================
   BACKEND INTELIGENTE — sendMessage
   POST /message
   Envía el texto del usuario (más imágenes opcionales) y retorna
   la respuesta del asistente con todos sus metadatos.
================================================================ */

/**
 * @param {{
 *   text:        string,
 *   sessionId:   string,
 *   images?:     Array<{file: File}>,
 *   projectId?:  string,
 *   accessToken?: string,
 *   onPartial?:  (evt: object) => void,
 *   mode?:       'tutor' | 'professional',
 *   userId?:     string,
 *   explanationStyle?: 'ANALOGY' | 'FORMAL' | 'CONCISE',
 *   verbosity?:        'LOW' | 'MEDIUM' | 'HIGH',
 * }} params
 * @returns {Promise<{
 *   text:             string,
 *   internalMessages: object[],
 *   sessionId:        string,
 *   messageId:        string | undefined,
 *   suggestions:      string[],
 *   mode:             'tutor' | 'professional',
 *   modeSuggestion:   'tutor' | 'professional' | null,
 * }>}
 */
export async function sendMessage({ text, sessionId, images = [], projectId, accessToken, onPartial, mode, userId, explanationStyle, verbosity } = {}) {
  const form = new FormData()
  form.append('message',    text)
  form.append('session_id', sessionId)
  if (projectId) form.append('project_id', projectId)
  // F7-T1: propaga el modo activo y el user_id al Backend IA (F2-T2).
  form.append('mode', mode || 'professional')
  if (userId) form.append('user_id', userId)
  // F13-T1: override por-turno de preferencias (camelCase → snake_case,
  // mismo patrón que user_id). Omitido si no hay preferencia → fallback Negocio.
  if (explanationStyle) form.append('explanation_style', explanationStyle)
  if (verbosity) form.append('verbosity', verbosity)
  images.forEach((img, i) => form.append(`image${i + 1}`, img.file))

  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

  const resp = await authFetch(`${AI_BASE}/message`, { method: 'POST', body: form, headers })
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

  const diagramPayload = final?.diagram && final.diagram.ok ? final.diagram : null

  return {
    text:             final?.endMessage                          ?? '—',
    internalMessages: Array.isArray(final?.messages)    ? final.messages    : [],
    sessionId:        final?.session_id                          ?? sessionId,
    messageId:        final?.message_id,
    suggestions:      Array.isArray(final?.suggestions) ? final.suggestions : [],
    diagram:          diagramPayload,
    // F7-T1: modo confirmado por el backend y sugerencia de cambio (F2-T4).
    mode:             final?.mode            ?? 'professional',
    modeSuggestion:   final?.mode_suggestion ?? null,
  }
}

/* ================================================================
   BACKEND INTELIGENTE — Diagram exports (Graphviz pipeline)
================================================================ */

/**
 * @param {{ sessionId: string, format?: 'svg'|'dot'|'dot_drawio'|'drawio' }} params
 */
export function buildDiagramExportUrl({ sessionId, format = 'svg' }) {
  const query = new URLSearchParams()
  query.set('session_id', sessionId)
  query.set('format', format)
  return `${AI_BASE}/diagram/export?${query.toString()}`
}

/**
 * @param {{ sessionId: string }} params
 * @returns {Promise<{ svgText: string }>}
 */
export async function fetchDiagramSvg({ sessionId }) {
  const url = buildDiagramExportUrl({ sessionId, format: 'svg' })
  const resp = await authFetch(url)
  const rawText = await resp.text()

  if (!resp.ok) {
    let message = rawText || `HTTP ${resp.status}`
    try {
      const parsed = JSON.parse(rawText)
      if (parsed?.detail)  message = String(parsed.detail)
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

/**
 * @param {{ sessionId: string, format: 'svg'|'dot'|'dot_drawio'|'drawio' }} params
 * @returns {Promise<{ blob: Blob, contentType: string }>}
 */
export async function downloadDiagramBlob({ sessionId, format }) {
  const url = buildDiagramExportUrl({ sessionId, format })
  const resp = await authFetch(url)

  if (!resp.ok) {
    const rawText = await resp.text().catch(() => '')
    let message = rawText || `HTTP ${resp.status}`
    try {
      const parsed = JSON.parse(rawText)
      if (parsed?.detail)  message = String(parsed.detail)
      if (parsed?.message) message = String(parsed.message)
    } catch {
      // ignore json parsing errors
    }
    const error = new Error(message)
    error.status = resp.status
    throw error
  }

  const blob = await resp.blob()
  const contentType = resp.headers.get('Content-Type') || ''
  return { blob, contentType }
}

/* ================================================================
   BACKEND INTELIGENTE — sendFeedback
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

  await authFetch(`${AI_BASE}/feedback`, { method: 'POST', body: form, skipAuth: true })
}

/* ================================================================
   BACKEND API — Chats
   Operaciones CRUD sobre chats asociados a un proyecto.
================================================================ */

/**
 * GET /chats?projectId=&page=&limit=
 * @param {{ projectId?: string, page?: number, limit?: number }} params
 * @returns {Promise<object[]>}
 */
export async function listChats({ projectId, page = 1, limit = 100 } = {}) {
  const query = new URLSearchParams({ page, limit })
  if (projectId) query.set('projectId', projectId)
  const result = await apiRequest(`${API_BASE}/chats?${query.toString()}`)
  return Array.isArray(result) ? result : (result?.data ?? [])
}

/**
 * POST /chats
 * @param {{ projectId: string, title: string, chatMode?: string }} params
 * @returns {Promise<object>} Chat creado
 */
export async function createChat({ projectId, title, chatMode = 'PROFESSIONAL' }) {
  return apiRequest(`${API_BASE}/chats`, {
    method: 'POST',
    body: JSON.stringify({ projectId, title, chatMode }),
  })
}

/**
 * PATCH /chats/:id
 * @param {string} chatId
 * @param {{ title?: string, chatMode?: string }} params
 * @returns {Promise<object>}
 */
export async function updateChat(chatId, { title, chatMode } = {}) {
  const body = {}
  if (title    !== undefined) body.title    = title
  if (chatMode !== undefined) body.chatMode = chatMode
  return apiRequest(`${API_BASE}/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/**
 * DELETE /chats/:id → 204
 * @param {string} chatId
 * @returns {Promise<void>}
 */
export async function deleteChat(chatId) {
  return apiRequest(`${API_BASE}/chats/${chatId}`, { method: 'DELETE' })
}

/* ================================================================
   BACKEND API — Messages
   Persistencia y carga de mensajes de un chat.
================================================================ */

/**
 * GET /chats/:chatId/messages?page=&limit=
 * Retorna los mensajes normalizados con sender ('usuario' | 'respuesta').
 * @param {string} chatId
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<Array<{ id: string, sender: string, text: string, createdAt: number }>>}
 */
export async function fetchMessages(chatId, { page = 1, limit = 100 } = {}) {
  const raw = await apiRequest(
    `${API_BASE}/chats/${chatId}/messages?page=${page}&limit=${limit}`
  )
  const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
  return list.map((m) => ({
    id:        m.id,
    sender:    m.role === 'USER' ? 'usuario' : 'respuesta',
    text:      m.content,
    createdAt: new Date(m.createdAt).getTime(),
  }))
}

/**
 * POST /chats/:chatId/messages
 * @param {string} chatId
 * @param {{ content: string, role: 'USER'|'AI' }} params
 * @returns {Promise<object>} Mensaje creado
 */
export async function persistMessage(chatId, { content, role }) {
  return apiRequest(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, role }),
  })
}
