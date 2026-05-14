/**
 * F12-T8: ReflectionForm — Formulario de reflexión metacognitiva.
 *
 * Dos campos:
 *   - difficultPart        → "¿Qué fue lo más difícil?"
 *   - wouldDoDifferently   → "¿Qué harías diferente la próxima vez?"
 *
 * Pedagogía:
 *   La reflexión cierra el ciclo "intento → feedback → solución → reflexión".
 *   Forzar al alumno a articular qué le costó y qué cambiaría refuerza el
 *   aprendizaje profundo (metacognición). En el Backend real (F12-T4),
 *   esta reflexión se enrutará al Shadow Agent para refinar el perfil.
 *
 * Props:
 *   onSubmit({difficultPart, wouldDoDifferently}) — async, devuelve promesa.
 *   submitting? — bool, desactiva el botón mientras la promesa esté pendiente.
 *   error?      — string para mostrar feedback de error.
 *   className?  — string.
 */

import { useState } from 'react'
import SendIcon          from '@mui/icons-material/Send'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'

import TextAtom   from '../atoms/TextAtom'
import ButtonAtom from '../atoms/ButtonAtom'

const MIN_LENGTH = 5

export default function ReflectionForm({ onSubmit, submitting = false, error, className = '' }) {
  const [difficultPart, setDifficultPart] = useState('')
  const [wouldDoDifferently, setWouldDoDifferently] = useState('')
  const [localError, setLocalError] = useState(null)

  const canSubmit =
    !submitting &&
    difficultPart.trim().length >= MIN_LENGTH &&
    wouldDoDifferently.trim().length >= MIN_LENGTH

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSubmit || typeof onSubmit !== 'function') return
    setLocalError(null)
    try {
      await onSubmit({
        difficultPart: difficultPart.trim(),
        wouldDoDifferently: wouldDoDifferently.trim(),
      })
    } catch (err) {
      setLocalError(err?.message || 'No se pudo enviar la reflexión.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        'flex flex-col gap-4 p-5 rounded-xl border border-gray-200 bg-white theme-transition',
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Reflexión metacognitiva"
      data-testid="reflection-form"
    >
      <header className="flex items-center gap-2">
        <PsychologyOutlinedIcon
          style={{ fontSize: 20, color: 'var(--mode-primary, var(--color-brand-500))' }}
          aria-hidden="true"
        />
        <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
          Tu reflexión cierra el ciclo
        </TextAtom>
      </header>

      <TextAtom variant="text-xs" className="text-gray-500">
        Estas dos preguntas te ayudan a fijar el aprendizaje. La reflexión es privada
        y se usa para entender mejor tus áreas de crecimiento.
      </TextAtom>

      <label className="flex flex-col gap-1.5" htmlFor="reflection-difficult">
        <TextAtom variant="text-sm" weight="medium" className="text-gray-700">
          ¿Qué fue lo más difícil?
        </TextAtom>
        <textarea
          id="reflection-difficult"
          value={difficultPart}
          onChange={(e) => setDifficultPart(e.target.value)}
          placeholder="Por ejemplo: identificar el invariante correcto…"
          rows={3}
          disabled={submitting}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm theme-transition focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y disabled:opacity-60"
          data-testid="reflection-difficult"
        />
      </label>

      <label className="flex flex-col gap-1.5" htmlFor="reflection-different">
        <TextAtom variant="text-sm" weight="medium" className="text-gray-700">
          ¿Qué harías diferente la próxima vez?
        </TextAtom>
        <textarea
          id="reflection-different"
          value={wouldDoDifferently}
          onChange={(e) => setWouldDoDifferently(e.target.value)}
          placeholder="Por ejemplo: empezar por el test antes que la implementación…"
          rows={3}
          disabled={submitting}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm theme-transition focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y disabled:opacity-60"
          data-testid="reflection-different"
        />
      </label>

      {(localError || error) && (
        <div
          role="alert"
          className="px-3 py-2 rounded-md bg-error-50 border border-error-200 text-error-700"
        >
          <TextAtom variant="text-xs" className="text-error-700">
            {localError || error}
          </TextAtom>
        </div>
      )}

      <div className="flex items-center justify-end">
        <ButtonAtom
          type="submit"
          variant="text-icon"
          intent="primary"
          size="sm"
          icon={<SendIcon />}
          disabled={!canSubmit}
          onClick={handleSubmit}
          data-testid="reflection-submit"
        >
          {submitting ? 'Enviando…' : 'Enviar reflexión y cerrar reto'}
        </ButtonAtom>
      </div>
    </form>
  )
}
