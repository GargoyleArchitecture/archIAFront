/**
 * useChatManager.js — Capa de lógica: estado del chat + persistencia
 *
 * Soporta dos modos según el parámetro `projectId`:
 *
 *   • Modo in-memory (projectId = null):
 *     Una sola sesión efímera, sin llamadas al Backend API ni localStorage.
 *     Compatible con ChatView en /chat.
 *
 *   • Modo Backend API (projectId = string):
 *     Carga chats y mensajes del Backend API. Persiste cada mensaje
 *     (USER y AI) tras cada intercambio. Historial sobrevive recargas.
 *
 * Exporta además dos utilidades de presentación reutilizables:
 *   summarizeRoles     — agrupa los agentes internos por nombre
 *   extractRagSources  — extrae las fuentes RAG de mensajes internos
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  sendMessage    as aiSendMessage,
  sendFeedback   as apiSendFeedback,
  listChats,
  createChat,
  updateChat,
  deleteChat,
  fetchMessages,
  persistMessage,
} from '../services/chatService'
// F7-T1: modo activo e identidad del usuario para propagar al Backend IA.
import { useMode } from '../contexts/ModeContext'
import { useAuth } from './useAuth'
// F13-T1: preferencias de comunicación por-turno hacia /message.
import { usePreferences } from '../contexts/PreferencesContext'

/* ================================================================
   UTILIDADES PURAS (sin dependencias de React)
================================================================ */

const uuid = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

const titleFrom = (text) => {
  const t = (text || '').trim()
  if (!t) return 'Nuevo chat'
  return t.split('\n')[0].slice(0, 60) || 'Nuevo chat'
}

/* ----------------------------------------------------------------
   summarizeRoles — exportada para uso en la vista
   Retorna pares [nombre, conteo] ordenados por relevancia.
---------------------------------------------------------------- */
export const summarizeRoles = (internal = []) => {
  const counts = new Map()
  const ORDER  = ['supervisor', 'researcher', 'evaluator', 'creator', 'asr_recommender', 'unifier']

  internal.forEach((m) => {
    const k = (m.name || m.role || 'other').toLowerCase()
    counts.set(k, (counts.get(k) || 0) + 1)
  })

  const ordered = ORDER.filter((k) => counts.has(k)).map((k) => [k, counts.get(k)])
  const rest    = [...counts.entries()].filter(([k]) => !ORDER.includes(k))
  return [...ordered, ...rest]
}

/* ----------------------------------------------------------------
   extractRagSources — exportada para uso en la vista
   Parsea las fuentes RAG embebidas en los mensajes internos.
---------------------------------------------------------------- */
export const extractRagSources = (internal = []) => {
  const out = []
  for (const m of internal) {
    const text = String(m.content || '')
    const idx  = text.indexOf('\nSOURCES:\n')
    if (idx !== -1) {
      const lines = text.substring(idx + '\nSOURCES:\n'.length).split('\n')
      for (const ln of lines) {
        const t = ln.trim()
        if (t.startsWith('- ')) out.push(t.slice(2))
      }
    }
  }
  return out
}

/* ================================================================
   HOOK PRINCIPAL
================================================================ */

/**
 * @param {{ projectId?: string|null }} options
 *   projectId — ID del proyecto activo. null = modo in-memory.
 */
export function useChatManager({ projectId = null } = {}) {
  const [sessions,      setSessions]      = useState([])
  const [sessionId,     setSessionId]     = useState(null)
  const [messages,      setMessages]      = useState([])
  const [ratedMessages, setRatedMessages] = useState(() => new Set())
  const [isLoading,     setIsLoading]     = useState(false)

  // F7-T1: modo activo y user_id para propagar al Backend IA en cada turno.
  const { mode }         = useMode()
  const { user }         = useAuth()
  const { preference }   = usePreferences()

  const requestSeq = useRef(0)
  const sessionIds = useMemo(
    () => new Set(sessions.map((s) => s.id)),
    [sessions]
  )
  const hasSession = useCallback(
    (id) => sessionIds.has(id),
    [sessionIds]
  )

  /* isBusy: true mientras haya un mensaje con pending=true */
  const isBusy = useMemo(() => messages.some((m) => m.pending), [messages])

  /* ── Inicialización al montar / cambiar de proyecto ── */
  useEffect(() => {
    setSessions([])
    setMessages([])
    setSessionId(null)

    if (!projectId) {
      /* Modo in-memory: una sesión vacía, sin API */
      const id = uuid()
      setSessions([{ id, title: 'Nuevo chat', createdAt: Date.now() }])
      setSessionId(id)
      return
    }

    /* Modo API: cargar chats del proyecto */
    setIsLoading(true)
    listChats({ projectId })
      .then((list) => {
        if (list.length === 0) {
          return createChat({ projectId, title: 'Nuevo chat' }).then((c) => [c])
        }
        return list
      })
      .then((list) => {
        const normalized = list.map((c) => ({
          id:        c.id,
          title:     c.title || 'Nuevo chat',
          createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
        }))
        setSessions(normalized)
        setSessionId(normalized[0].id)
      })
      .catch(() => {
        /* En modo proyecto solo aceptamos chats persistidos en el API. */
        setSessions([])
        setSessionId(null)
        setMessages([])
      })
      .finally(() => setIsLoading(false))
  }, [projectId])

  /* Ref con la sessions list mas reciente — evita que el useEffect de carga
   * de mensajes se re-suscriba a cambios de `sessions` (e.g. renameSession),
   * lo que disparaba un refetch espurio que pisaba el placeholder optimista
   * "Generando respuesta…" en el primer mensaje de un chat. */
  const sessionsRef = useRef(sessions)
  useEffect(() => { sessionsRef.current = sessions }, [sessions])

  /* ── Carga mensajes al cambiar de sesión (solo en modo API) ──
   *
   * Dependencias intencionalmente acotadas a [sessionId, projectId]:
   * la pertenencia de la sesion se lee del ref `sessionsRef` para no
   * resuscribirse en cada cambio de la lista. Ademas, el setMessages
   * usa el callback form y respeta el optimistic update si ya hay un
   * mensaje pending (defensa contra race con send()).
   */
  useEffect(() => {
    if (!sessionId || !projectId) return
    let cancelled = false

    const known = sessionsRef.current.some((s) => s.id === sessionId)
    if (!known) {
      setMessages((current) => current.some((m) => m.pending) ? current : [])
      return
    }

    setIsLoading(true)
    fetchMessages(sessionId)
      .then((msgs) => {
        if (cancelled) return
        setMessages((current) => current.some((m) => m.pending) ? current : msgs)
      })
      .catch(() => {
        if (cancelled) return
        setMessages((current) => current.some((m) => m.pending) ? current : [])
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [sessionId, projectId])

  /* ================================================================
     OPERACIONES SOBRE SESIONES
  ================================================================ */

  const createSession = () => {
    if (isBusy) return

    if (!projectId) {
      /* Modo in-memory */
      const id  = uuid()
      const s   = { id, title: 'Nuevo chat', createdAt: Date.now() }
      setSessions((prev) => [s, ...prev])
      setSessionId(id)
      setMessages([])
      return
    }

    /* Modo API */
    createChat({ projectId, title: 'Nuevo chat' })
      .then((c) => {
        const s = {
          id:        c.id,
          title:     c.title || 'Nuevo chat',
          createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
        }
        setSessions((prev) => [s, ...prev])
        setSessionId(s.id)
        setMessages([])
      })
      .catch(() => {})
  }

  const renameSession = (id, title) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)))
    if (projectId && hasSession(id)) {
      updateChat(id, { title }).catch(() => {})
    }
  }

  const deleteSession = (id) => {
    if (isBusy) return

    const exists = hasSession(id)
    const remaining = sessions.filter((s) => s.id !== id)
    setSessions(remaining)

    if (projectId && exists) {
      deleteChat(id).catch(() => {})
    }

    if (id === sessionId) {
      if (remaining.length > 0) {
        setSessionId(remaining[0].id)
      } else {
        /* Crear nueva sesión al quedarse sin chats */
        createSession()
      }
    }
  }

  /* ================================================================
     ENVÍO DE MENSAJES (actualización optimista)
  ================================================================ */

  const send = async (text, images = []) => {
    if (isBusy || !sessionId) return
    const textToSend = text.trim()
    if (!textToSend && images.length === 0) return

    /* Renombra la sesión con el primer mensaje */
    if (messages.length === 0) renameSession(sessionId, titleFrom(textToSend))

    /* Mensaje del usuario + placeholder de carga */
    const userMsg = {
      id:        uuid(),
      sender:    'usuario',
      text:      textToSend,
      images:    images.map((img) => img.preview),
      createdAt: Date.now(),
    }
    const pendingId = `pending-${uuid()}`
    const pending   = { id: pendingId, sender: 'respuesta', text: '', pending: true }

    const optimistic = [...messages, userMsg, pending]
    setMessages(optimistic)

    const seq = ++requestSeq.current

    try {
      /* Persistir mensaje del usuario en el Backend API */
      if (projectId && hasSession(sessionId)) {
        await persistMessage(sessionId, { content: textToSend, role: 'USER' })
      }

      /* Llamar al Backend Inteligente — F7-T1: incluye modo activo y user_id */
      const accessToken = localStorage.getItem('archia.accessToken') || ''
      const result = await aiSendMessage({
        text:      textToSend,
        sessionId,
        images,
        projectId,
        accessToken,
        mode:      mode   || 'professional',
        userId:    user?.id,
        // F13-T1: override por-turno; si no hay preferencia, se omite y el
        // Backend IA cae al fetch a Negocio (fallback intacto).
        explanationStyle: preference?.explanationStyle || undefined,
        verbosity:        preference?.verbosity || undefined,
      })

      if (seq !== requestSeq.current) return   // respuesta de un request anterior: ignorar

      /* Persistir respuesta del asistente en el Backend API */
      if (projectId && hasSession(sessionId)) {
        await persistMessage(sessionId, { content: result.text, role: 'AI' })
      }

      const rendered = optimistic.map((m) =>
        m.id === pendingId
          ? {
              ...m,
              pending:          false,
              text:             result.text,
              internalMessages: result.internalMessages,
              sessionId:        result.sessionId,
              messageId:        result.messageId,
              suggestions:      result.suggestions,
              diagram:          result.diagram ?? null,  // Issue 3: expose for DiagramViewer
              // F7-T1: sugerencia de cambio de modo del clasificador (F2-T4).
              modeSuggestion:   result.modeSuggestion,
              createdAt:        Date.now(),
            }
          : m
      )
      setMessages(rendered)

    } catch {
      const rendered = optimistic.map((m) =>
        m.id === pendingId
          ? { ...m, pending: false, text: '⚠️ Error al generar la respuesta.' }
          : m
      )
      setMessages(rendered)
    }
  }

  /* ================================================================
     FEEDBACK (pulgar arriba / abajo)
  ================================================================ */

  const rateMessage = (sid, mid, isUp) => {
    const key = `${sid}-${mid}`
    if (ratedMessages.has(key)) return
    setRatedMessages((prev) => { const next = new Set(prev); next.add(key); return next })
    apiSendFeedback({ sessionId: sid, messageId: mid, thumbsUp: isUp ? 1 : 0, thumbsDown: isUp ? 0 : 1 })
  }

  /* ================================================================
     API pública del hook
  ================================================================ */
  return {
    /* estado de solo lectura */
    sessions,
    sessionId,
    messages,
    isBusy,
    isLoading,
    ratedMessages,
    /* acciones */
    setSessionId,
    createSession,
    renameSession,
    deleteSession,
    send,
    rateMessage,
  }
}
