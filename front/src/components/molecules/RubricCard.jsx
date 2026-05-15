/**
 * F12-T8: RubricCard — Lista de criterios de la rúbrica con su resultado.
 *
 * Cada criterio se renderiza con un icono coherente con su `status`:
 *   - met     → ✓ verde
 *   - partial → ◐ ámbar
 *   - missing → ⨯ rojo (no destructivo: es un estado pedagógico, no un error)
 *
 * El componente acepta dos modos:
 *   - Pre-evaluación: solo se renderiza la rúbrica (descripción + weight),
 *     sin status. Útil mientras el alumno escribe su intento.
 *   - Post-evaluación: se renderizan los `criteria` (CriterionResult) con
 *     comentarios. Si la longitud no coincide con la rúbrica, se fusiona
 *     por `concept` con fallback a "missing".
 *
 * Props:
 *   rubric    — Array<{ concept, description, weight }>   (requerido)
 *   results?  — Array<{ concept, status, comment }>       (opcional)
 *   className — string
 */

import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline'
import RadioButtonCheckedIcon  from '@mui/icons-material/RadioButtonChecked'
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import HelpOutlineIcon         from '@mui/icons-material/HelpOutline'

import TextAtom from '../atoms/TextAtom'

const STATUS_VISUAL = {
  met: {
    Icon: CheckCircleOutlineIcon,
    color: 'var(--color-success-600)',
    bg:    'var(--color-success-50)',
    label: 'Cumplido',
  },
  partial: {
    Icon: RadioButtonCheckedIcon,
    color: 'var(--color-warning-600)',
    bg:    'var(--color-warning-50)',
    label: 'Parcial',
  },
  missing: {
    Icon: HighlightOffOutlinedIcon,
    color: 'var(--color-error-600)',
    bg:    'var(--color-error-50)',
    label: 'Faltante',
  },
  pending: {
    Icon: HelpOutlineIcon,
    color: 'var(--color-gray-500)',
    bg:    'var(--color-gray-50)',
    label: 'Sin evaluar',
  },
}

function CriterionRow({ criterion, result }) {
  const status = result?.status || 'pending'
  const visual = STATUS_VISUAL[status] || STATUS_VISUAL.pending
  const { Icon } = visual
  return (
    <li
      className="flex items-start gap-3 p-3 rounded-md border border-gray-200 bg-white theme-transition"
      style={{ backgroundColor: visual.bg }}
      data-testid="rubric-criterion"
      data-status={status}
    >
      <Icon style={{ fontSize: 20, color: visual.color, flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TextAtom variant="text-sm" weight="semibold" className="text-gray-800">
            {criterion.concept}
          </TextAtom>
          <div className="flex items-center gap-2">
            <TextAtom variant="text-xs" className="text-gray-500">
              Peso · {criterion.weight}
            </TextAtom>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ color: visual.color, borderColor: visual.color, borderWidth: 1, borderStyle: 'solid' }}
              aria-label={`Estado: ${visual.label}`}
            >
              {visual.label}
            </span>
          </div>
        </div>
        <TextAtom variant="text-xs" className="text-gray-600">
          {criterion.description}
        </TextAtom>
        {result?.comment && (
          <TextAtom variant="text-xs" className="text-gray-700 italic" data-testid="rubric-comment">
            {result.comment}
          </TextAtom>
        )}
      </div>
    </li>
  )
}

export default function RubricCard({ rubric, results, className = '' }) {
  if (!Array.isArray(rubric) || rubric.length === 0) return null

  // Fusión por `concept` para tolerar arrays desordenados o de tamaño distinto.
  const byConcept = new Map()
  if (Array.isArray(results)) {
    for (const r of results) {
      if (r && typeof r.concept === 'string') {
        byConcept.set(r.concept, r)
      }
    }
  }

  return (
    <section
      className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}
      aria-label="Rúbrica del reto"
      data-testid="rubric-card"
    >
      <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
        Rúbrica de evaluación
      </TextAtom>
      <ul className="flex flex-col gap-2" role="list">
        {rubric.map((c) => (
          <CriterionRow
            key={c.concept}
            criterion={c}
            result={byConcept.get(c.concept) || null}
          />
        ))}
      </ul>
    </section>
  )
}
