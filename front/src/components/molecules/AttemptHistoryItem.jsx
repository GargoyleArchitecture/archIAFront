/**
 * F16-T4: AttemptHistoryItem — un intento previo con su feedback COMPLETO.
 *
 * Antes el historial sólo mostraba fecha + score + respuesta. Ahora cada
 * intento reusa RubricCard + FeedbackPanel para mostrar la rúbrica con sus
 * resultados y el feedback global, igual que el intento actual.
 *
 * Props:
 *   attempt — { id, createdAt, status, userResponseText, feedbackJson }
 *   rubric  — Array<{ concept, description, weight }> (de la rutina)
 */
import { useState } from 'react'

import TextAtom from '../atoms/TextAtom'
import RubricCard from './RubricCard'
import FeedbackPanel from './FeedbackPanel'

export default function AttemptHistoryItem({ attempt, rubric }) {
  const [open, setOpen] = useState(false)
  if (!attempt) return null

  const fb = attempt.feedbackJson || null
  const scoreLabel =
    fb && fb.score != null ? `${Math.round(fb.score)}/100` : attempt.status

  return (
    <li
      className="rounded-md bg-gray-50 border border-gray-200"
      data-testid="history-item"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 theme-transition"
        data-testid="history-item-toggle"
      >
        <TextAtom variant="text-xs" className="text-gray-500 font-mono">
          {new Date(attempt.createdAt).toLocaleString()}
        </TextAtom>
        <span className="flex items-center gap-2">
          <TextAtom
            variant="text-xs"
            weight="semibold"
            className="text-gray-700"
            data-testid="history-item-score"
          >
            {scoreLabel}
          </TextAtom>
          <TextAtom variant="text-xs" className="text-gray-400">
            {open ? '▾' : '▸'}
          </TextAtom>
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 flex flex-col gap-3 border-t border-gray-100">
          {attempt.userResponseText && (
            <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 max-h-40 overflow-auto">
              {attempt.userResponseText}
            </pre>
          )}
          {fb && Array.isArray(rubric) && rubric.length > 0 && (
            <RubricCard rubric={rubric} results={fb.criteria || []} />
          )}
          {fb && <FeedbackPanel feedback={fb} />}
          {!fb && (
            <TextAtom variant="text-xs" className="text-gray-500">
              Este intento aún no tiene feedback.
            </TextAtom>
          )}
        </div>
      )}
    </li>
  )
}
