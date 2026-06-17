/**
 * F12-T7: RoutinesView — Listado de retos pedagógicos con tabs.
 *
 * Tabs:
 *   - Pendientes   → retos con derivedStatus 'pending' o 'in_progress'.
 *   - Completados  → derivedStatus 'completed' o 'abandoned'.
 *
 * Cada tarjeta resume: título, target weakness, dificultad, fecha relativa,
 * severidad (derivada de un placeholder de mastery para visualización), y
 * un microtexto de estado ("Sin intentos" / "Intento sin evaluar" /
 * "Evaluado · N/100"). Click → navega a `/routines/:id`.
 *
 * Gating: si `useFeatures().enableRoutines === false`, se muestra un panel
 * "función deshabilitada" + CTA de retorno, consistente con F11-T5.
 *
 * Modalidad MOCK (F12-T6): consume `routinesService` que opera contra
 * fixtures locales. Cuando Backend reanude (F12-T5), el componente no
 * cambia — sólo flippea `VITE_USE_MOCKS=false`.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFeatures } from '../contexts/FeaturesContext'

import ArrowBackIcon          from '@mui/icons-material/ArrowBack'
import FilterListIcon         from '@mui/icons-material/FilterList'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'

import TextAtom        from '../components/atoms/TextAtom'
import HeaderAtom      from '../components/atoms/HeaderAtom'
import ButtonAtom      from '../components/atoms/ButtonAtom'
import SeverityBadgeAtom from '../components/atoms/SeverityBadgeAtom'
import ConceptPillAtom from '../components/atoms/ConceptPillAtom'

import {
  listRoutines,
  derivedStatus,
  summarizeFeedback,
  FIXTURE_USER_ID,
} from '../services/routinesService'
import { humanizeDelta } from '../utils/profileHydration'

const TABS = [
  { key: 'pending',   label: 'Pendientes',  statuses: ['pending', 'in_progress'] },
  { key: 'completed', label: 'Completados', statuses: ['completed', 'abandoned'] },
]

/* Heurística sencilla: si el reto está completado, severidad baja (verde);
   si está pending pero ya hubo intentos, severidad media; si nunca se intentó,
   severidad alta (lo que más vale la pena trabajar). */
function severityFromRoutine(routine) {
  const s = derivedStatus(routine)
  if (s === 'completed') return 'low'
  if (s === 'in_progress' || s === 'abandoned') return 'medium'
  return 'high'
}

function difficultyLabel(d) {
  const n = Number(d)
  if (!Number.isFinite(n)) return null
  const clamp = Math.max(1, Math.min(5, Math.round(n)))
  return `Dificultad ${clamp}/5`
}

function RoutineCard({ routine, onOpen }) {
  const status = derivedStatus(routine)
  const summary = summarizeFeedback(routine)
  const severity = severityFromRoutine(routine)
  const created = routine.createdAt ? humanizeDelta(routine.createdAt) : null
  const diff = difficultyLabel(routine.difficulty)
  const concepts = Array.isArray(routine.expectedConcepts) ? routine.expectedConcepts.slice(0, 3) : []

  return (
    <article
      className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white theme-transition hover:border-brand-300 hover:shadow-sm cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(routine.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(routine.id)
        }
      }}
      data-testid="routine-card"
      data-status={status}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <TextAtom variant="text-md" weight="semibold" className="text-gray-800 truncate">
            {routine.title || `Reto sobre ${routine.targetWeakness}`}
          </TextAtom>
          <div className="flex items-center gap-2 flex-wrap">
            <TextAtom variant="text-xs" className="text-gray-500">
              {routine.targetWeakness}
            </TextAtom>
            {diff && (
              <TextAtom variant="text-xs" family="mono" className="text-gray-600">
                · {diff}
              </TextAtom>
            )}
            {created && (
              <TextAtom variant="text-xs" className="text-gray-500">
                · {created}
              </TextAtom>
            )}
          </div>
        </div>
        <SeverityBadgeAtom level={severity} />
      </header>

      {concepts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {concepts.map((c) => (
            <ConceptPillAtom key={c} size="sm" intent="neutral">
              {c}
            </ConceptPillAtom>
          ))}
          {routine.expectedConcepts && routine.expectedConcepts.length > 3 && (
            <TextAtom variant="text-xs" className="text-gray-500">
              +{routine.expectedConcepts.length - 3}
            </TextAtom>
          )}
        </div>
      )}

      <footer className="flex items-center justify-between">
        <TextAtom variant="text-xs" className="text-gray-600" data-testid="routine-card-summary">
          {summary}
        </TextAtom>
        <TextAtom variant="text-xs" className="text-brand-600">
          Abrir →
        </TextAtom>
      </footer>
    </article>
  )
}

export default function RoutinesView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { features } = useFeatures()
  const userId = user?.id || FIXTURE_USER_ID

  const [activeTab, setActiveTab] = useState('pending')
  const [routines, setRoutines]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listRoutines(userId, { limit: 50 })
      .then((list) => {
        if (!cancelled) setRoutines(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'No se pudo cargar el listado de retos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  if (features && features.enableRoutines === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
        <EmojiObjectsOutlinedIcon style={{ fontSize: 40 }} className="text-gray-400" aria-hidden="true" />
        <HeaderAtom level={3} weight="semibold" className="text-gray-700">
          Retos pedagógicos deshabilitados
        </HeaderAtom>
        <TextAtom variant="text-sm" className="text-gray-500 max-w-md text-center">
          Esta función no está disponible para tu organización en este momento.
          Si crees que es un error, contacta a tu administrador.
        </TextAtom>
        <ButtonAtom
          variant="text-icon"
          intent="secondary"
          size="sm"
          icon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Volver al chat
        </ButtonAtom>
      </div>
    )
  }

  const tabStatuses = TABS.find((t) => t.key === activeTab)?.statuses || []
  const filtered = routines.filter((r) => tabStatuses.includes(derivedStatus(r)))

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Header del panel */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <HeaderAtom level={3} weight="semibold" className="text-gray-900">
              Mis retos pedagógicos
            </HeaderAtom>
            <TextAtom variant="text-xs" className="text-gray-500">
              Practica un reto, recibe feedback estructurado y reflexiona sobre tu solución.
            </TextAtom>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="max-w-5xl mx-auto mt-4 flex items-center gap-1"
          role="tablist"
          aria-label="Estado de los retos"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab
            const count = routines.filter((r) => tab.statuses.includes(derivedStatus(r))).length
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium theme-transition border',
                  isActive
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300',
                ].join(' ')}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label} · {count}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <TextAtom variant="text-sm" className="text-gray-500">Cargando retos…</TextAtom>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-md bg-error-50 border border-error-200 text-error-700">
            <TextAtom variant="text-sm" className="text-error-700">{error}</TextAtom>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FilterListIcon style={{ fontSize: 36 }} className="text-gray-400" aria-hidden="true" />
            <TextAtom variant="text-sm" className="text-gray-500">
              {activeTab === 'pending'
                ? 'No tienes retos pendientes en este momento.'
                : 'Aún no has completado ningún reto.'}
            </TextAtom>
            <TextAtom variant="text-xs" className="text-gray-400 max-w-md text-center">
              {activeTab === 'pending'
                ? 'Genera un reto desde tu perfil o explora los retos completados para repasar.'
                : 'Cuando termines un reto y envíes tu reflexión, aparecerá aquí.'}
            </TextAtom>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="routines-grid">
            {filtered.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onOpen={(id) => navigate(`/routines/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
