/**
 * F9-T2: ResponseSkeleton — Skeleton loader semántico por modo
 *
 * Reemplaza el indicador genérico "Generando respuesta…" (TypingDots)
 * por un placeholder visual cuya forma sugiere la naturaleza de la
 * respuesta que el agente está componiendo.
 *
 * Variantes:
 *   - Tutor:        3 líneas de prosa con anchos decrecientes (85/60/40 %).
 *                   Evoca explicación narrativa.
 *   - Professional: un bloque mono-bg simulando código + 2 líneas debajo.
 *                   Evoca respuesta técnica estructurada.
 *
 * Props:
 *   mode      — 'tutor' | 'professional'  (opcional; default lee del context)
 *   className — string                     clases extra
 *
 * Accesibilidad:
 *   - role="status" + aria-live="polite" + aria-label descriptivo.
 *   - Animación deshabilitada bajo prefers-reduced-motion (herencia de SkeletonAtom).
 */

import SkeletonAtom from '../atoms/SkeletonAtom'

function TutorVariant() {
  return (
    <div className="flex flex-col gap-2 py-1" data-testid="response-skeleton-tutor">
      <SkeletonAtom width="85%" height={12} />
      <SkeletonAtom width="60%" height={12} />
      <SkeletonAtom width="40%" height={12} />
    </div>
  )
}

function ProfessionalVariant() {
  return (
    <div className="flex flex-col gap-2 py-1" data-testid="response-skeleton-professional">
      {/* Bloque de código simulado: alto y monoespaciado */}
      <SkeletonAtom
        width="100%"
        height={64}
        rounded="md"
        className="bg-gray-300"
      />
      <SkeletonAtom width="70%" height={10} />
      <SkeletonAtom width="50%" height={10} />
    </div>
  )
}

export default function ResponseSkeleton({ mode, className = '' }) {
  const resolvedMode = mode === 'tutor' || mode === 'professional' ? mode : 'professional'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generando respuesta"
      className={['flex flex-col', className].filter(Boolean).join(' ')}
    >
      {resolvedMode === 'tutor' ? <TutorVariant /> : <ProfessionalVariant />}
    </div>
  )
}
