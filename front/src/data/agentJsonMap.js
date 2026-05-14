/**
 * F10-T1: agentJsonMap — Catálogo Agente → Atomic Design
 *
 * Mapeo de cada nodo del grafo LangGraph (Backend IA) a un componente
 * del frontend. Permite que el chat renderice mensajes internos
 * (`internalMessages[]` del payload SSE complete) con componentes
 * especializados en lugar de fallar a un sólo MarkdownRenderer.
 *
 * Estructura de cada entrada:
 *   {
 *     render: ({ content, payload }) => ReactNode | null,
 *     silent: boolean   // si true, el dispatcher NO renderiza nada
 *   }
 *
 * Conventional names (tomados del system prompt y nodos del grafo):
 *   - unifier            — respuesta final compuesta (texto markdown).
 *   - investigator       — investigación con RAG + citas.
 *   - asr                — Architectural Significant Requirements.
 *   - tactics            — tácticas arquitectónicas.
 *   - style              — explicación con estilo (analogía, formal, …).
 *   - supervisor         — orquestador (señal interna, no presentable).
 *   - evaluator          — evaluador de calidad (señal interna).
 *   - profile_shadow     — Shadow Agent de perfilado (asíncrono, oculto).
 *   - routine_generator  — subgrafo de generación de retos. Renderiza
 *                          ChallengeBlock con el payload estructurado.
 *
 * Política de fallback:
 *   - Nombre conocido y NO silent → render mapeado.
 *   - Nombre conocido y silent    → null.
 *   - Nombre desconocido          → FALLBACK_RENDERER (MarkdownRenderer
 *                                   con `content` o cadena vacía).
 */

import { createElement } from 'react'
import { Link } from 'react-router-dom'
import MarkdownRenderer from '../components/organisms/MarkdownRenderer'

/* ----------------------------------------------------------------
   Renderers reutilizables — usamos createElement en vez de JSX para
   mantener este archivo como .js (sin que Vite tenga que transformarlo
   como JSX). Equivalente funcional a <MarkdownRenderer content={...} />.
---------------------------------------------------------------- */

function renderMarkdown({ content }) {
  return createElement(MarkdownRenderer, {
    content: typeof content === 'string' ? content : '',
  })
}

/**
 * F12-T9: el subgrafo `routine_generator` ya NO se renderiza inline en el
 * chat. En su lugar, el dispatcher inserta un enlace "Abrir reto generado"
 * que navega a `/routines/:id` (vista dedicada con el ciclo pedagógico
 * completo). El payload debe traer `id`; en otro caso retornamos null.
 */
function renderRoutine({ payload }) {
  if (!payload || typeof payload !== 'object' || !payload.id) return null
  const title = typeof payload.title === 'string' ? payload.title : 'Nuevo reto'
  return createElement(
    'div',
    {
      className: 'flex items-center gap-2 p-3 rounded-md border border-brand-200 bg-brand-50',
      'data-testid': 'routine-generated-link',
    },
    createElement('span', { className: 'text-xs text-brand-700 font-semibold uppercase' }, 'Reto creado'),
    createElement(Link, {
      to: `/routines/${payload.id}`,
      className: 'text-sm font-medium text-brand-800 underline hover:no-underline',
    }, title + ' — Abrir'),
  )
}

/* ----------------------------------------------------------------
   Catálogo
---------------------------------------------------------------- */

export const AGENT_JSON_MAP = {
  unifier:           { render: renderMarkdown },
  investigator:      { render: renderMarkdown },
  asr:               { render: renderMarkdown },
  tactics:           { render: renderMarkdown },
  style:             { render: renderMarkdown },
  supervisor:        { silent: true },
  evaluator:         { silent: true },
  profile_shadow:    { silent: true },
  routine_generator: { render: renderRoutine },
}

export const FALLBACK_RENDERER = renderMarkdown

/**
 * Resuelve el renderer adecuado para un nombre de nodo.
 *
 * @param {string|undefined} name
 * @returns {{ kind: 'mapped' | 'silent' | 'fallback', render: Function | null }}
 */
export function getRendererForNode(name) {
  if (typeof name !== 'string' || name.length === 0) {
    return { kind: 'fallback', render: FALLBACK_RENDERER }
  }
  const entry = AGENT_JSON_MAP[name]
  if (!entry) {
    return { kind: 'fallback', render: FALLBACK_RENDERER }
  }
  if (entry.silent) {
    return { kind: 'silent', render: null }
  }
  return { kind: 'mapped', render: entry.render }
}

/**
 * Helpers exportados para tests y UIs de admin (saber qué nodos existen
 * y cuáles están silenciados).
 */
export function getKnownNodeNames() {
  return Object.keys(AGENT_JSON_MAP)
}

export function isSilentNode(name) {
  const entry = AGENT_JSON_MAP[name]
  return !!(entry && entry.silent)
}
