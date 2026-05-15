/**
 * F12-T8: FeedbackPanel — Resumen del feedback global del intento.
 *
 * Renderiza el `RoutineFeedback` completo: score, fortalezas, áreas de
 * mejora y comentario socrático. Mantiene la rúbrica detallada fuera
 * (eso vive en `RubricCard`).
 *
 * Props:
 *   feedback  — { score, criteria, strengths, improvements, socratic_comment }
 *   className — string
 */

import TrendingUpIcon       from '@mui/icons-material/TrendingUp'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import FormatQuoteIcon      from '@mui/icons-material/FormatQuote'

import TextAtom from '../atoms/TextAtom'

function ScoreBubble({ score }) {
  const n = Math.max(0, Math.min(100, Math.round(Number(score) || 0)))
  const tone =
    n >= 80 ? { bg: 'var(--color-success-50)', fg: 'var(--color-success-800)', border: 'var(--color-success-300)' } :
    n >= 50 ? { bg: 'var(--color-warning-50)', fg: 'var(--color-warning-800)', border: 'var(--color-warning-300)' } :
              { bg: 'var(--color-error-50)',   fg: 'var(--color-error-800)',   border: 'var(--color-error-300)' }
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-4 py-3"
      style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.border, borderWidth: 1, borderStyle: 'solid' }}
      aria-label={`Score ${n} de 100`}
      data-testid="feedback-score"
    >
      <TextAtom variant="text-2xl" weight="bold" family="mono" className="leading-none" style={{ color: tone.fg }}>
        {n}
      </TextAtom>
      <TextAtom variant="text-xs" className="opacity-80" style={{ color: tone.fg }}>
        / 100
      </TextAtom>
    </div>
  )
}

function ListBlock({ icon: Icon, title, items, accent }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon style={{ fontSize: 16, color: accent }} aria-hidden="true" />
        <TextAtom variant="text-sm" weight="semibold" className="text-gray-800">
          {title}
        </TextAtom>
      </div>
      <ul className="flex flex-col gap-0.5 pl-6 list-disc text-gray-700">
        {items.map((it, i) => (
          <li key={i}>
            <TextAtom as="span" variant="text-sm" className="text-gray-700">
              {it}
            </TextAtom>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FeedbackPanel({ feedback, className = '' }) {
  if (!feedback || typeof feedback !== 'object') return null

  return (
    <section
      className={[
        'flex flex-col gap-4 p-5 rounded-xl border border-gray-200 bg-white theme-transition',
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Feedback de tu intento"
      data-testid="feedback-panel"
    >
      <header className="flex items-start gap-4">
        <ScoreBubble score={feedback.score} />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
            Feedback de tu intento
          </TextAtom>
          <TextAtom variant="text-xs" className="text-gray-500">
            Score ponderado por la rúbrica del reto.
          </TextAtom>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListBlock
          icon={TrendingUpIcon}
          title="Fortalezas"
          items={feedback.strengths}
          accent="var(--color-success-600)"
        />
        <ListBlock
          icon={LightbulbOutlinedIcon}
          title="Áreas de mejora"
          items={feedback.improvements}
          accent="var(--color-warning-600)"
        />
      </div>

      {feedback.socratic_comment && (
        <div
          className="flex items-start gap-2 p-3 rounded-md border-l-4 bg-gray-50"
          style={{ borderColor: 'var(--mode-primary, var(--color-brand-500))' }}
          data-testid="feedback-socratic"
        >
          <FormatQuoteIcon
            style={{ fontSize: 20, color: 'var(--mode-primary, var(--color-brand-500))', flexShrink: 0 }}
            aria-hidden="true"
          />
          <TextAtom variant="text-sm" className="text-gray-700 italic">
            {feedback.socratic_comment}
          </TextAtom>
        </div>
      )}
    </section>
  )
}
