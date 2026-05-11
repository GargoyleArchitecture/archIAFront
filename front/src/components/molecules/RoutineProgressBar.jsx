/**
 * F9-T3: RoutineProgressBar — Barra de progreso de 4 pasos para un reto
 *
 * Pasos canónicos:
 *   1. description — el reto fue descrito por el agente.
 *   2. attempt     — el usuario está intentando resolverlo.
 *   3. feedback    — el agente entrega feedback automático.
 *   4. recap       — recap pedagógico final.
 *
 * Visualización:
 *   - Barra horizontal con 4 segmentos. Cada segmento toma color
 *     `--mode-primary` cuando está completo o activo, gris cuando pendiente.
 *   - Labels debajo de cada segmento.
 *   - El paso actual se anuncia con `aria-current="step"`.
 *
 * Props:
 *   currentStep     — 'description' | 'attempt' | 'feedback' | 'recap'
 *                     (default: 'description')
 *   completedSteps  — string[] de steps ya completados (los que se "llenan").
 *   className       — clases extra para el contenedor.
 *
 * Accesibilidad:
 *   - role="progressbar" + aria-valuenow / aria-valuemax / aria-valuemin.
 *   - Cada segmento es un <li> con aria-current si aplica.
 *   - Animación respeta prefers-reduced-motion.
 */

export const STEPS = [
  { key: 'description', label: 'Descripción' },
  { key: 'attempt',     label: 'Intento' },
  { key: 'feedback',    label: 'Feedback' },
  { key: 'recap',       label: 'Recap' },
]

function indexOfStep(key) {
  const i = STEPS.findIndex((s) => s.key === key)
  return i === -1 ? 0 : i
}

export default function RoutineProgressBar({
  currentStep = 'description',
  completedSteps = [],
  className = '',
}) {
  // Resolución defensiva: si el caller pasó un step inválido, caemos al primero.
  const resolvedKey = STEPS.some((s) => s.key === currentStep)
    ? currentStep
    : STEPS[0].key
  const currentIdx = indexOfStep(resolvedKey)
  const completedSet = new Set(Array.isArray(completedSteps) ? completedSteps : [])
  // Conteo "visual": cuántos steps están coloreados (completados + el actual).
  const filledCount = completedSet.size + (completedSet.has(resolvedKey) ? 0 : 1)

  return (
    <div
      className={['flex flex-col gap-2 w-full', className].filter(Boolean).join(' ')}
      data-testid="routine-progress-bar"
    >
      {/* F11-T3: usamos <div role="progressbar"> con <span>s adentro porque
          `progressbar` no es role válido para <ol> y <li> fuera de un <ul>/<ol>
          rompe la regla `listitem` de axe. La semántica `progressbar` ya
          comunica la naturaleza del componente; los segmentos son decorativos. */}
      <div
        role="progressbar"
        aria-valuenow={filledCount}
        aria-valuemin={0}
        aria-valuemax={STEPS.length}
        aria-label="Progreso del reto"
        className="flex items-center gap-1"
      >
        {STEPS.map((step, i) => {
          const isCompleted = completedSet.has(step.key)
          const isCurrent = step.key === resolvedKey
          const isFilled = isCompleted || i < currentIdx || isCurrent
          return (
            <span
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex-1 h-2 rounded-full theme-transition motion-reduce:transition-none"
              style={{
                backgroundColor: isFilled
                  ? 'var(--mode-primary, var(--color-brand-500))'
                  : 'var(--color-gray-200)',
                opacity: isCurrent && !isCompleted ? 0.7 : 1,
                transition: 'background-color 200ms ease-out, opacity 200ms ease-out',
              }}
              data-step={step.key}
              data-state={isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-1 text-[10px] font-sans text-gray-500">
        {STEPS.map((step) => {
          const isCurrent = step.key === resolvedKey
          return (
            <span
              key={step.key}
              className="flex-1 text-center theme-transition"
              style={{
                fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? 'var(--mode-primary)' : 'var(--color-gray-500)',
              }}
              data-testid={`step-label-${step.key}`}
            >
              {step.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------
   Ejemplo:

   <RoutineProgressBar
     currentStep="feedback"
     completedSteps={['description', 'attempt']}
   />
---------------------------------------------------------------- */
