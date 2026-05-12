/**
 * F10-T3: CompetencyCard — Tarjeta de competencia técnica
 *
 * Compone nombre de la competencia + severidad (derivada de mastery) +
 * lista de subconceptos como ConceptPills + microtexto de "último visto".
 *
 * Útil para representar el "estado de un dominio" en dashboards
 * (Profile, reports, etc.) sin acoplar la presentación a un sólo lugar
 * del UI (a diferencia de WeaknessActionCard que está atada a un CTA).
 *
 * Props:
 *   name        — string (requerido)
 *   mastery     — number 0..1  (opcional). Determina la severidad.
 *   concepts    — string[]     (opcional). Subconceptos a mostrar como pills.
 *   lastSeenAt  — string ISO   (opcional). Microtexto humanizado.
 *   className   — string
 */

import TextAtom from '../atoms/TextAtom'
import SeverityBadgeAtom, { severityFromMastery } from '../atoms/SeverityBadgeAtom'
import ConceptPillAtom from '../atoms/ConceptPillAtom'
import { humanizeDelta } from '../../utils/profileHydration'

export default function CompetencyCard({
  name,
  mastery,
  concepts = [],
  lastSeenAt,
  className = '',
}) {
  if (!name || typeof name !== 'string') return null

  const severity = severityFromMastery(mastery)
  const safeConcepts = Array.isArray(concepts) ? concepts.filter((c) => typeof c === 'string' && c.trim()) : []
  const lastSeen = lastSeenAt ? humanizeDelta(lastSeenAt) : null
  const masteryPct = (typeof mastery === 'number' && Number.isFinite(mastery))
    ? `${Math.round(Math.max(0, Math.min(1, mastery)) * 100)} %`
    : null

  return (
    <article
      className={[
        'flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white theme-transition',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={`Competencia ${name}`}
      data-testid="competency-card"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <TextAtom variant="text-md" weight="semibold" className="text-gray-800 truncate">
          {name}
        </TextAtom>
        <SeverityBadgeAtom level={severity} />
      </header>

      {/* Microcopy: mastery + lastSeenAt */}
      {(masteryPct || lastSeen) && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {masteryPct && (
            <span data-testid="competency-mastery" className="font-mono text-gray-700">
              {masteryPct}
            </span>
          )}
          {masteryPct && lastSeen && <span aria-hidden="true">·</span>}
          {lastSeen && <span>Último visto · {lastSeen}</span>}
        </div>
      )}

      {/* Subconceptos */}
      {safeConcepts.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="competency-concepts">
          {safeConcepts.map((c) => (
            <ConceptPillAtom key={c} size="sm" intent="neutral">
              {c}
            </ConceptPillAtom>
          ))}
        </div>
      )}
    </article>
  )
}

/* ----------------------------------------------------------------
   Ejemplo de uso:

   <CompetencyCard
     name="Concurrency"
     mastery={0.65}
     concepts={['locks', 'channels', 'actor model']}
     lastSeenAt="2026-04-15T10:00:00Z"
   />
---------------------------------------------------------------- */
