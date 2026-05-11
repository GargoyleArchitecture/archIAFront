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
import MarkdownRenderer from '../components/organisms/MarkdownRenderer'
import ChallengeBlock   from '../components/molecules/ChallengeBlock'

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

function renderRoutine({ payload }) {
  // El payload llega como objeto serializable del subgrafo routine_generator.
  // ChallengeBlock retorna null si payload.id está ausente, lo cual es la
  // semántica correcta del dispatcher (no romper si el backend manda algo
  // mal formado).
  return createElement(ChallengeBlock, { routine: payload })
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
