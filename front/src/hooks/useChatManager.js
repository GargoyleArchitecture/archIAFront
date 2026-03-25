/**
 * useChatManager.js — Capa de lógica: estado del chat + persistencia
 *
 * Centraliza toda la lógica de sesiones, mensajes y LocalStorage.
 * La vista solo consume datos y llama a funciones — nunca toca
 * directamente ni fetch ni localStorage.
 *
 * Exporta además dos utilidades de presentación reutilizables:
 *   summarizeRoles     — agrupa los agentes internos por nombre
 *   extractRagSources  — extrae las fuentes RAG de mensajes internos
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  sendMessage  as apiSendMessage,
  sendFeedback as apiSendFeedback,
} from '../services/chatService'

/* ================================================================
   UTILIDADES PURAS (sin dependencias de React)
================================================================ */

const uuid = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

const KEYS = {
  SESSIONS: 'arquia.sessions',
  MESSAGES: (sid) => `arquia.chat.${sid}`,
}

const titleFrom = (text) => {
  const t = (text || '').trim()
  if (!t) return 'Nuevo chat'
  return t.split('\n')[0].slice(0, 60) || 'Nuevo chat'
}

const loadSessions = () => {
  try { return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]') } catch { return [] }
}
const saveSessions = (arr) => localStorage.setItem(KEYS.SESSIONS, JSON.stringify(arr))

const loadChat = (sid) => {
  try { return JSON.parse(localStorage.getItem(KEYS.MESSAGES(sid)) || '[]') } catch { return [] }
}
const saveChat = (sid, msgs) => localStorage.setItem(KEYS.MESSAGES(sid), JSON.stringify(msgs))

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
export function useChatManager() {
  /* Estado de sesiones */
  const [sessions,      setSessions]      = useState(loadSessions)
  const [sessionId,     setSessionId]     = useState(() => loadSessions()?.[0]?.id ?? uuid())
  const [messages,      setMessages]      = useState(() => loadChat(loadSessions()?.[0]?.id ?? ''))
  const [ratedMessages, setRatedMessages] = useState(() => new Set())

  /* Secuencia de requests para descartar respuestas obsoletas */
  const requestSeq = useRef(0)

  /* isBusy: true mientras haya un mensaje con pending=true */
  const isBusy = useMemo(() => messages.some((m) => m.pending), [messages])

  /* ── Inicialización: crea sesión por defecto si no existe ninguna ── */
  useEffect(() => {
    const existing = loadSessions()
    if (existing.length === 0) {
      const id    = sessionId
      const first = { id, title: 'Nuevo chat', createdAt: Date.now() }
      const arr   = [first]
      setSessions(arr)
      saveSessions(arr)
      saveChat(id, [])
      setMessages([])
    } else {
      setMessages(loadChat(sessionId))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Carga mensajes al cambiar de sesión ── */
  useEffect(() => {
    setMessages(loadChat(sessionId))
  }, [sessionId])

  /* ================================================================
     OPERACIONES SOBRE SESIONES
  ================================================================ */

  const createSession = () => {
    if (isBusy) return
    const id  = uuid()
    const s   = { id, title: 'Nuevo chat', createdAt: Date.now() }
    const arr = [s, ...sessions]
    setSessions(arr)
    saveSessions(arr)
    setSessionId(id)
    saveChat(id, [])
  }

  const renameSession = (id, title) => {
    const arr = sessions.map((s) => (s.id === id ? { ...s, title } : s))
    setSessions(arr)
    saveSessions(arr)
  }

  const deleteSession = (id) => {
    if (isBusy) return
    const arr = sessions.filter((s) => s.id !== id)
    setSessions(arr)
    saveSessions(arr)
    localStorage.removeItem(KEYS.MESSAGES(id))

    if (id === sessionId) {
      const nextId = arr[0]?.id ?? uuid()
      if (!arr[0]) {
        const ns   = { id: nextId, title: 'Nuevo chat', createdAt: Date.now() }
        const arr2 = [ns]
        setSessions(arr2)
        saveSessions(arr2)
        saveChat(nextId, [])
      }
      setSessionId(nextId)
    }
  }

  /* ================================================================
     ENVÍO DE MENSAJES (actualización optimista)
  ================================================================ */

  const send = async (text, images = []) => {
    if (isBusy) return
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
    saveChat(sessionId, optimistic)

    const seq = ++requestSeq.current
    try {
      const result = await apiSendMessage({ text: textToSend, sessionId, images })
      if (seq !== requestSeq.current) return   // respuesta de un request anterior: ignorar

      const rendered = optimistic.map((m) =>
        m.id === pendingId
          ? {
              ...m,
              pending:          false,
              text:             result.text,
              internalMessages: result.internalMessages,
              mermaidCode:      result.mermaidCode,
              sessionId:        result.sessionId,
              messageId:        result.messageId,
              suggestions:      result.suggestions,
              createdAt:        Date.now(),
            }
          : m
      )
      setMessages(rendered)
      saveChat(sessionId, rendered)

    } catch {
      const rendered = optimistic.map((m) =>
        m.id === pendingId
          ? { ...m, pending: false, text: '⚠️ Error al generar la respuesta.' }
          : m
      )
      setMessages(rendered)
      saveChat(sessionId, rendered)
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
