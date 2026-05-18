/**
 * F12-T8: RoutineDetailView — Vista detalle de un reto con ciclo pedagógico completo.
 *
 * Estructura (top → bottom):
 *   1. Header con título, target weakness, dificultad y RoutineProgressBar.
 *   2. Enunciado (challengeMd) renderizado en Markdown.
 *   3. Snippet de "Código a mejorar" si la rutina lo trae.
 *   4. Área de trabajo: textarea + botón "Enviar para evaluación".
 *      El borrador se persiste en localStorage para sobrevivir refresh.
 *   5. Feedback (si hay attempt evaluado): RubricCard + FeedbackPanel.
 *   6. Solución de referencia (colapsable, sólo si hubo evaluación).
 *   7. ReflectionForm (sólo si hay attempt evaluado sin reflexión).
 *   8. Historial (sólo si hay más de un attempt).
 *
 * Modalidad MOCK (F12-T6): consume `routinesService` con fixtures locales.
 * Cuando F12-T5 ship, el componente no cambia — basta con
 * `VITE_USE_MOCKS=false`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ArrowBackIcon              from '@mui/icons-material/ArrowBack'
import EmojiObjectsOutlinedIcon   from '@mui/icons-material/EmojiObjectsOutlined'
import SendIcon                   from '@mui/icons-material/Send'
import HistoryIcon                from '@mui/icons-material/History'

import TextAtom         from '../components/atoms/TextAtom'
import HeaderAtom       from '../components/atoms/HeaderAtom'
import ButtonAtom       from '../components/atoms/ButtonAtom'
import ConceptPillAtom  from '../components/atoms/ConceptPillAtom'
import MarkdownRenderer from '../components/organisms/MarkdownRenderer'
import RoutineProgressBar from '../components/molecules/RoutineProgressBar'
import RubricCard       from '../components/molecules/RubricCard'
import FeedbackPanel    from '../components/molecules/FeedbackPanel'
import SolutionPanel    from '../components/molecules/SolutionPanel'
import ReflectionForm   from '../components/molecules/ReflectionForm'
import AttemptHistoryItem from '../components/molecules/AttemptHistoryItem'

import {
  getRoutine,
  submitAttempt,
  evaluateAttempt,
  derivedStatus,
} from '../services/routinesService'
import { toast } from '../services/toast'

const DRAFT_KEY_PREFIX = 'archia.routines.draft.'

// F16-T3: el evaluador IA puede tardar; si el HTTP síncrono de Negocio
// expira (504), el sync-back idempotente de F16-T1 persiste el resultado
// poco después. Hacemos polling acotado hasta verlo.
const POLL_INTERVAL_MS = 5000
const POLL_MAX_TRIES = 24 // ~120s

function clampDifficulty(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  return Math.max(1, Math.min(5, Math.round(n)))
}

/**
 * Determina el step actual del progress bar según el attempt más reciente.
 *   - sin attempts                → 'description'
 *   - attempt sin evaluación      → 'attempt'
 *   - attempt evaluado sin reflex → 'feedback'
 *   - attempt completed           → 'recap'
 */
function progressStepFromAttempt(attempt) {
  if (!attempt) return { current: 'description', completed: [] }
  if (!attempt.feedbackJson) return { current: 'attempt', completed: ['description'] }
  if (!attempt.reflectionJson) return { current: 'feedback', completed: ['description', 'attempt'] }
  return { current: 'recap', completed: ['description', 'attempt', 'feedback'] }
}

function latestAttempt(routine) {
  if (!routine || !Array.isArray(routine.attempts) || routine.attempts.length === 0) return null
  return [...routine.attempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]
}

export default function RoutineDetailView() {
  const { routineId } = useParams()
  const navigate = useNavigate()

  const [routine, setRoutine]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [draftText, setDraftText]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reflecting, setReflecting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // F16-T3: corta el polling si el usuario navega fuera (evita setState en
  // componente desmontado y un loop colgado de ~120s).
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const draftKey = useMemo(() => `${DRAFT_KEY_PREFIX}${routineId}`, [routineId])

  /* ── Bootstrap: cargar la rutina + restaurar borrador local ── */
  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await getRoutine(routineId)
      if (!r) {
        setError('No encontramos este reto. Puede que el id no exista.')
        setRoutine(null)
      } else {
        setRoutine(r)
      }
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el reto.')
    } finally {
      setLoading(false)
    }
  }, [routineId])

  useEffect(() => { reload() }, [reload])

  // Restaurar borrador localStorage cuando llega routineId.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(draftKey) || ''
      setDraftText(stored)
    } catch { /* noop */ }
  }, [draftKey])

  const persistDraft = useCallback((text) => {
    try {
      if (text && text.trim()) {
        localStorage.setItem(draftKey, text)
      } else {
        localStorage.removeItem(draftKey)
      }
    } catch { /* noop */ }
  }, [draftKey])

  const onDraftChange = (e) => {
    const v = e.target.value
    setDraftText(v)
    persistDraft(v)
  }

  /* ── Acciones ── */

  // F16-T3: polling acotado tras enviar. Resuelve cuando el intento ya tiene
  // feedback (vía respuesta síncrona O sync-back de IA si el HTTP expiró).
  const pollForEvaluation = useCallback(
    async (attemptId) => {
      for (let i = 0; i < POLL_MAX_TRIES; i++) {
        await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS))
        if (!mountedRef.current) return false
        let r
        try {
          r = await getRoutine(routineId)
        } catch {
          continue
        }
        if (!mountedRef.current) return false
        const a = (r?.attempts || []).find((x) => x.id === attemptId)
        if (a && a.feedbackJson) {
          setRoutine(r)
          return true
        }
      }
      return false
    },
    [routineId],
  )

  const handleSubmitAttempt = async () => {
    if (!routine || !draftText.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    // F15-T1: crear el attempt sólo con status (CreateRoutineAttemptDto).
    let attempt
    try {
      attempt = await submitAttempt(routine.id, { status: 'in_progress' })
    } catch (err) {
      setError(err?.message || 'No se pudo crear el intento.')
      setSubmitting(false)
      return
    }

    const responseText = draftText.trim()
    persistDraft('')
    setDraftText('')
    toast.info('Evaluando tu intento… esto puede tardar un momento.')

    // El texto va a POST /routine-attempts/:id/evaluate.
    let evaluated = null
    try {
      evaluated = await evaluateAttempt(attempt.id, {
        userResponseText: responseText,
      })
    } catch (err) {
      // F16-T3: 504 (timeout) / 503 NO es fatal — el sync-back idempotente
      // de F16-T1 persistirá el resultado; lo recogemos por polling. Otros
      // errores sí se muestran.
      if (err?.status !== 504 && err?.status !== 503) {
        setError(err?.message || 'No se pudo evaluar el intento.')
        setSubmitting(false)
        return
      }
    }

    // Respuesta síncrona ya trajo feedback (caso normal / MOCK): listo.
    if (evaluated && evaluated.feedbackJson) {
      await reload()
      toast.success('¡Evaluación lista!')
      setSubmitting(false)
      return
    }

    // Si no, esperamos el sync-back con polling acotado.
    const ok = await pollForEvaluation(attempt.id)
    if (ok) {
      toast.success('¡Evaluación lista!')
    } else {
      toast.warning(
        'Tu intento se está evaluando. Vuelve a entrar en un momento para ver el feedback.',
      )
      await reload()
    }
    setSubmitting(false)
  }

  const handleSubmitReflection = async ({ difficultPart, wouldDoDifferently }) => {
    const attempt = latestAttempt(routine)
    if (!attempt) return
    // F15-T2: POST /routine-attempts/:id/evaluate exige `userResponseText`
    // (EvaluateRoutineAttemptDto, requerido). Reenviamos el texto ya
    // persistido del attempt junto con la reflexión; sin él el backend
    // real responde 400 (en MOCK pasaba por idempotencia del evaluator).
    const priorText = (attempt.userResponseText || '').trim()
    if (!priorText) {
      setError('No se puede enviar la reflexión: el intento no tiene una respuesta registrada.')
      return
    }
    setReflecting(true)
    try {
      await evaluateAttempt(attempt.id, {
        userResponseText: priorText,
        reflection: { difficultPart, wouldDoDifferently },
      })
      await reload()
    } finally {
      setReflecting(false)
    }
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <TextAtom variant="text-sm" className="text-gray-500">Cargando reto…</TextAtom>
      </div>
    )
  }

  if (error || !routine) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
        <HeaderAtom level={3} weight="semibold" className="text-gray-700">
          {error || 'Reto no encontrado'}
        </HeaderAtom>
        <ButtonAtom
          variant="text-icon"
          intent="secondary"
          size="sm"
          icon={<ArrowBackIcon />}
          onClick={() => navigate('/routines')}
        >
          Volver al listado
        </ButtonAtom>
      </div>
    )
  }

  const attempt = latestAttempt(routine)
  const allAttemptsSorted = Array.isArray(routine.attempts)
    ? [...routine.attempts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : []
  const previousAttempts = allAttemptsSorted.slice(1)
  const isLegacy = !routine.challengeMd
  const status   = derivedStatus(routine)
  const progress = progressStepFromAttempt(attempt)
  const difficulty = clampDifficulty(routine.difficulty)
  const showFeedback = !!(attempt && attempt.feedbackJson)
  const showReflection = !!(attempt && attempt.feedbackJson && !attempt.reflectionJson)
  const showSolution = showFeedback && !!routine.solutionMd

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <ButtonAtom
            variant="text-icon"
            intent="ghost"
            size="sm"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/routines')}
          >
            Listado
          </ButtonAtom>
          <TextAtom variant="text-xs" className="text-gray-500 font-mono">
            Reto · {routine.id}
          </TextAtom>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        {/* Header del reto */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: 'var(--mode-primary-container, var(--color-brand-100))',
                color:           'var(--mode-on-primary-container, var(--color-brand-900))',
              }}
            >
              <EmojiObjectsOutlinedIcon style={{ fontSize: 14 }} aria-hidden="true" />
              Reto
            </span>
            {difficulty !== null && (
              <TextAtom variant="text-xs" family="mono" className="text-gray-600">
                Dificultad {difficulty}/5
              </TextAtom>
            )}
            <TextAtom variant="text-xs" className="text-gray-500">
              · {routine.targetWeakness}
            </TextAtom>
            <TextAtom variant="text-xs" className="text-gray-500" data-testid="detail-status">
              · estado: {status}
            </TextAtom>
          </div>
          <HeaderAtom level={2} weight="semibold" className="text-gray-900">
            {routine.title || `Reto sobre ${routine.targetWeakness}`}
          </HeaderAtom>
          <RoutineProgressBar
            currentStep={progress.current}
            completedSteps={progress.completed}
          />
          {Array.isArray(routine.expectedConcepts) && routine.expectedConcepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {routine.expectedConcepts.map((c) => (
                <ConceptPillAtom key={c} size="sm" intent="primary">{c}</ConceptPillAtom>
              ))}
            </div>
          )}
        </header>

        {/* Banner reto legacy */}
        {isLegacy && (
          <div
            role="status"
            className="px-4 py-3 rounded-md bg-warning-50 border border-warning-200 text-warning-800"
            data-testid="legacy-banner"
          >
            <TextAtom variant="text-sm" weight="semibold" className="text-warning-800">
              Reto legado
            </TextAtom>
            <TextAtom variant="text-xs" className="text-warning-700">
              Este reto fue generado antes de habilitar la persistencia del enunciado
              completo. Podés explorar el historial de intentos, pero el cuerpo del
              reto no está disponible.
            </TextAtom>
          </div>
        )}

        {/* Enunciado */}
        {!isLegacy && (
          <section
            className="p-5 rounded-xl border border-gray-200 bg-white"
            aria-label="Enunciado del reto"
            data-testid="challenge-md"
          >
            <MarkdownRenderer content={routine.challengeMd} />
          </section>
        )}

        {/* Snippet de mal código */}
        {routine.inverseRagSnippet && (
          <section
            className="rounded-md overflow-x-auto border border-gray-200"
            data-testid="inverse-rag-snippet"
          >
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-gray-100 text-gray-600">
              Código a mejorar
            </div>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 text-gray-800">
              {routine.inverseRagSnippet}
            </pre>
          </section>
        )}

        {/* Rúbrica (vista previa pre-evaluación o con results post-eval) */}
        {Array.isArray(routine.rubricJson) && routine.rubricJson.length > 0 && (
          <RubricCard
            rubric={routine.rubricJson}
            results={showFeedback ? attempt.feedbackJson.criteria : null}
          />
        )}

        {/* Área de trabajo: textarea + botón */}
        {!isLegacy && (
          <section
            className="flex flex-col gap-3 p-5 rounded-xl border border-gray-200 bg-white"
            aria-label="Tu intento"
            data-testid="work-area"
          >
            <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
              {showFeedback ? 'Tu último intento' : 'Tu intento'}
            </TextAtom>
            {showFeedback && attempt?.userResponseText ? (
              <pre
                className="p-3 rounded-md bg-gray-50 border border-gray-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-gray-800 max-h-72 overflow-auto"
                data-testid="attempt-readonly"
              >
                {attempt.userResponseText}
              </pre>
            ) : (
              <>
                <TextAtom variant="text-xs" className="text-gray-500">
                  Escribí tu solución. El borrador se guarda automáticamente y sobrevive a refresh.
                </TextAtom>
                <textarea
                  value={draftText}
                  onChange={onDraftChange}
                  placeholder="Escribí tu solución acá. Markdown y código bloque son bienvenidos."
                  rows={10}
                  disabled={submitting}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-mono theme-transition focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y disabled:opacity-60"
                  data-testid="attempt-draft"
                />
                <div className="flex items-center justify-end">
                  <ButtonAtom
                    variant="text-icon"
                    intent="primary"
                    size="sm"
                    icon={<SendIcon />}
                    onClick={handleSubmitAttempt}
                    disabled={!draftText.trim() || submitting}
                    data-testid="submit-attempt"
                  >
                    {submitting ? 'Enviando y evaluando…' : 'Enviar para evaluación'}
                  </ButtonAtom>
                </div>
              </>
            )}
          </section>
        )}

        {/* F16-T4: contador total de intentos (visible con ≥1 intento) */}
        {allAttemptsSorted.length > 0 && (
          <TextAtom
            variant="text-xs"
            className="text-gray-500"
            data-testid="attempts-total"
          >
            Intentos realizados: {allAttemptsSorted.length}
          </TextAtom>
        )}

        {/* Feedback */}
        {showFeedback && <FeedbackPanel feedback={attempt.feedbackJson} />}

        {/* Solución de referencia (anti-spoiler) */}
        {showSolution && <SolutionPanel solution={routine.solutionMd} />}

        {/* Reflexión */}
        {showReflection && (
          <ReflectionForm
            onSubmit={handleSubmitReflection}
            submitting={reflecting}
          />
        )}

        {/* Historial */}
        {previousAttempts.length > 0 && (
          <section
            className="flex flex-col rounded-xl border border-gray-200 bg-white"
            aria-label="Intentos anteriores"
            data-testid="history-panel"
          >
            <button
              type="button"
              className="flex items-center justify-between gap-3 px-5 py-3 w-full text-left hover:bg-gray-50 theme-transition"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              data-testid="history-toggle"
            >
              <div className="flex items-center gap-2">
                <HistoryIcon
                  style={{ fontSize: 18, color: 'var(--color-gray-600)' }}
                  aria-hidden="true"
                />
                <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
                  Intentos anteriores · {previousAttempts.length}
                </TextAtom>
              </div>
              <TextAtom variant="text-xs" className="text-gray-500">
                {showHistory ? 'Ocultar' : 'Mostrar'}
              </TextAtom>
            </button>
            {showHistory && (
              <ul className="px-5 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-100" role="list">
                {previousAttempts.map((a) => (
                  <AttemptHistoryItem
                    key={a.id}
                    attempt={a}
                    rubric={routine.rubricJson}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
