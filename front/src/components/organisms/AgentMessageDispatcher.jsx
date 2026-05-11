/**
 * F10-T1: AgentMessageDispatcher — Enrutador Agente → Atomic Design
 *
 * Recibe un mensaje interno del Backend IA (proveniente del array
 * `internalMessages` que viaja en el evento SSE complete) y resuelve
 * qué componente del frontend lo renderiza, consultando el catálogo
 * `agentJsonMap`.
 *
 * Forma del `message`:
 *   {
 *     name:     string  // nombre del nodo del grafo (e.g. 'unifier')
 *     content?: string  // texto Markdown del unifier/investigator/…
 *     payload?: object  // payload estructurado (e.g. RoutineOutput)
 *   }
 *
 * Política:
 *   - Si `message` es nulo o no-objeto → retorna null.
 *   - Si el nodo está en silent list → retorna null.
 *   - Si el nodo es conocido → invoca el render mapeado.
 *   - Si el nodo es desconocido → invoca el FALLBACK_RENDERER (markdown).
 *
 * Forward-compat:
 *   El chat actual sólo renderiza `endMessage` (texto del unifier). Cuando
 *   el backend embeba `internalMessages` con `name`+`payload` ricos, basta
 *   con cambiar el callsite del chat a `<AgentMessageDispatcher message={msg} />`
 *   sin cambios a este organism.
 */

import { getRendererForNode } from '../../data/agentJsonMap'

export default function AgentMessageDispatcher({ message }) {
  if (!message || typeof message !== 'object') return null
  const { name, content, payload } = message
  const { kind, render } = getRendererForNode(name)
  if (kind === 'silent' || typeof render !== 'function') return null
  return render({ content, payload })
}

/* ----------------------------------------------------------------
   Ejemplo de uso:

   {internalMessages.map((msg, i) => (
     <AgentMessageDispatcher key={i} message={msg} />
   ))}
---------------------------------------------------------------- */
