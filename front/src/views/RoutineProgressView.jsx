/**
 * F18-T2: RoutineProgressView — "Mi progreso" dentro de Routines.
 *
 * Dashboard compacto unificado del dominio técnico del usuario (migrado
 * desde ProfileView en la Fase 18):
 *   - Dominio General (radar) como elemento héroe.
 *   - Fortalezas como chips compactos.
 *   - Debilidades como tarjetas con CTA "Generar reto" (cierra el loop
 *     débil → reto → mastery; reusa WeaknessActionCard que ya navega a
 *     /routines/:id).
 *   - Curva de Olvido (por repasar) como lista breve.
 *
 * Autocontenido: NO depende de helpers de ProfileView (que en F18-T3 se
 * adelgaza a Cuenta + Preferencias). Fuente de datos sin cambios:
 * `getUserProfile` (GET /users/:id/profile).
 *
 * Gate: `features.enableProfileDashboard` (contenido de dominio técnico).
 * Alcanzable bajo /routines cuando `enableRoutines !== false` (sidebar).
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import RefreshIcon         from '@mui/icons-material/Refresh'
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline'
import AutoGraphIcon       from '@mui/icons-material/AutoGraph'

import { useAuth } from '../hooks/useAuth'
import { useMode } from '../contexts/ModeContext'
import { useTelemetry } from '../hooks/useTelemetry'
import { useFeatures } from '../contexts/FeaturesContext'
import { getUserProfile } from '../services/profileService'

import BoxAtom       from '../components/atoms/BoxAtom'
import TextAtom      from '../components/atoms/TextAtom'
import ButtonAtom    from '../components/atoms/ButtonAtom'
import SkeletonAtom  from '../components/atoms/SkeletonAtom'
import ModeBadgeAtom from '../components/atoms/ModeBadgeAtom'
import StrengthChip  from '../components/molecules/StrengthChip'
import ForgettingCurveList from '../components/molecules/ForgettingCurveList'
import WeaknessActionCard from '../components/molecules/WeaknessActionCard'
import RadarChart from '../components/organisms/RadarChart'
import { hydrateNames } from '../utils/profileHydration'

/* ── helpers ───────────────────────────────────────────────────────── */

function isEmptyProfile(profile) {
  if (!profile) return true
  const ec = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts : []
  const st = Array.isArray(profile.strengths) ? profile.strengths : []
  const wk = Array.isArray(profile.weaknesses) ? profile.weaknesses : []
  return ec.length === 0 && st.length === 0 && wk.length === 0
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={`flex flex-col gap-3 p-5 rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
          {title}
        </TextAtom>
        {subtitle && (
          <TextAtom variant="text-xs" className="text-gray-400">
            {subtitle}
          </TextAtom>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}

function ProgressSkeleton() {
  return (
    <BoxAtom display="flex" direction="col" gap="5" data-testid="progress-skeleton">
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <SkeletonAtom width="30%" height={20} />
        <SkeletonAtom width="100%" height={240} />
      </div>
      <div className="flex flex-col gap-5">
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <SkeletonAtom width="40%" height={20} />
          <SkeletonAtom width="100%" height={90} />
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <SkeletonAtom width="40%" height={20} />
          <SkeletonAtom width="100%" height={90} />
        </div>
      </div>
    </BoxAtom>
  )
}

function ErrorPanel({ message, onRetry }) {
  return (
    <BoxAtom
      display="flex" direction="col" align="center" justify="center" gap="3" p="8"
      rounded="lg" className="border border-error-300 bg-error-50"
      data-testid="progress-error"
    >
      <ErrorOutlineIcon style={{ fontSize: 40, color: 'var(--color-error-600)' }} aria-hidden="true" />
      <TextAtom variant="text-lg" weight="semibold" className="text-error-700">
        No se pudo cargar tu progreso
      </TextAtom>
      <TextAtom variant="text-sm" className="text-error-600 text-center">
        {message || 'Hubo un problema al consultar el servicio. Intentá nuevamente en unos segundos.'}
      </TextAtom>
      <ButtonAtom variant="text-icon" intent="primary" size="sm" icon={<RefreshIcon />} onClick={onRetry}>
        Reintentar
      </ButtonAtom>
    </BoxAtom>
  )
}

function EmptyState({ onCTA }) {
  return (
    <BoxAtom
      display="flex" direction="col" align="center" justify="center" gap="4" p="8"
      rounded="lg" className="border border-dashed border-gray-300 bg-white"
      data-testid="progress-empty"
    >
      <AutoGraphIcon
        style={{ fontSize: 64, color: 'var(--mode-primary, var(--color-brand-400))' }}
        aria-hidden="true"
      />
      <TextAtom variant="display-xs" weight="semibold" className="text-gray-800 text-center">
        Tu progreso técnico está por comenzar
      </TextAtom>
      <TextAtom variant="text-sm" className="text-gray-500 text-center max-w-md">
        A medida que practicas retos y conversas con el agente, aquí vas a ver
        crecer tu dominio: fortalezas, debilidades y qué conviene repasar.
      </TextAtom>
      <ButtonAtom
        variant="text-icon" intent="primary" icon={<ChatBubbleOutlineIcon />}
        onClick={onCTA}
      >
        Hablar con el agente para construir tu perfil
      </ButtonAtom>
    </BoxAtom>
  )
}

/* ── vista principal ───────────────────────────────────────────────── */

export default function RoutineProgressView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mode } = useMode()
  const telemetry = useTelemetry()
  const { features } = useFeatures()

  const [status, setStatus] = useState('loading')
  const [profile, setProfile] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    setStatus('loading')
    setErrorMsg(null)
    try {
      const data = await getUserProfile(user.id)
      setProfile(data ?? null)
      setStatus(isEmptyProfile(data) ? 'empty' : 'ready')
    } catch (err) {
      const msg = err?.message || 'Error de red'
      if (/404/.test(msg)) {
        setProfile(null)
        setStatus('empty')
        return
      }
      setErrorMsg(msg)
      setStatus('error')
    }
  }, [user?.id])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  useEffect(() => {
    if (status === 'ready' && profile) {
      const evalCount = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts.length : 0
      telemetry.emit('profile_viewed', {
        evaluatedConceptsCount: evalCount,
        strengthsCount: Array.isArray(profile.strengths) ? profile.strengths.length : 0,
        weaknessesCount: Array.isArray(profile.weaknesses) ? profile.weaknesses.length : 0,
        surface: 'routines_progress',
      })
    }
  }, [status, profile, telemetry])

  if (!features.enableProfileDashboard) {
    return (
      <BoxAtom
        display="flex" direction="col" align="center" justify="center" flex="1"
        gap="3" className="bg-gray-50"
        data-testid="routine-progress-view"
        data-state="disabled"
      >
        <TextAtom variant="display-xs" weight="semibold" className="text-gray-700 text-center">
          El panel de progreso técnico está deshabilitado para tu organización.
        </TextAtom>
        <TextAtom variant="text-sm" className="text-gray-500 text-center max-w-md">
          Contacta a un administrador si necesitas acceso.
        </TextAtom>
        <ButtonAtom variant="text-icon" intent="primary" onClick={() => navigate('/routines')}>
          Volver a mis retos
        </ButtonAtom>
      </BoxAtom>
    )
  }

  const evaluated = Array.isArray(profile?.evaluatedConcepts) ? profile.evaluatedConcepts : []
  const strengths = profile ? hydrateNames(profile.strengths, evaluated) : []
  const weaknesses = profile ? hydrateNames(profile.weaknesses, evaluated) : []

  return (
    <BoxAtom
      display="flex" direction="col" flex="1" minH="0"
      className="overflow-hidden bg-gray-50"
      data-testid="routine-progress-view"
    >
      {/* Header */}
      <BoxAtom
        as="header" display="flex" align="center" justify="between" gap="3" px="4"
        className="h-14 border-b border-gray-200 bg-white flex-shrink-0"
      >
        <div className="flex flex-col">
          <TextAtom variant="text-lg" weight="semibold" className="text-gray-800">
            Mi progreso
          </TextAtom>
          <TextAtom variant="text-xs" className="text-gray-500">
            Tu dominio crece con cada reto y conversación.
          </TextAtom>
        </div>
        <ModeBadgeAtom mode={mode} size="sm" />
      </BoxAtom>

      {/* Body */}
      <BoxAtom
        as="main" flex="1" minH="0" className="overflow-y-auto"
        aria-busy={status === 'loading'} aria-live="polite"
      >
        <div className="max-w-5xl mx-auto w-full p-6 flex flex-col gap-5">
          {status === 'loading' && <ProgressSkeleton />}
          {status === 'error'   && <ErrorPanel message={errorMsg} onRetry={fetchProfile} />}
          {status === 'empty'   && <EmptyState onCTA={() => navigate('/')} />}

          {status === 'ready' && (
            <div className="flex flex-col gap-5" data-testid="progress-ready">
              {/* Héroe: Dominio General */}
              <Panel
                title="Dominio General"
                subtitle="Top 6 conceptos en formato radar."
                className="items-stretch"
              >
                <RadarChart concepts={evaluated} />
              </Panel>

              {/* Fortalezas y Debilidades — cada sección a fila completa */}
              <div className="flex flex-col gap-5">
                <Panel title="Fortalezas" subtitle="Conceptos consolidados con alta mastery.">
                  {strengths.length > 0 ? (
                    <div className="flex flex-wrap gap-2" data-testid="strengths-grid">
                      {strengths.map((s) => (
                        <StrengthChip
                          key={s.name}
                          name={s.name}
                          mastery={s.mastery}
                          lastSeenAt={s.lastSeenAt}
                          intensity
                        />
                      ))}
                    </div>
                  ) : (
                    <TextAtom variant="text-sm" className="text-gray-500">
                      Aún no hay fortalezas registradas — ¡sigue practicando!
                    </TextAtom>
                  )}
                </Panel>

                <Panel
                  title="Debilidades"
                  subtitle="Áreas a reforzar — genera un reto para mejorar."
                >
                  {weaknesses.length > 0 ? (
                    <div className="flex flex-col gap-3" data-testid="weaknesses-grid">
                      {weaknesses.map((w) => (
                        <WeaknessActionCard
                          key={w.name}
                          userId={user?.id}
                          name={w.name}
                          mastery={w.mastery}
                          lastSeenAt={w.lastSeenAt}
                        />
                      ))}
                    </div>
                  ) : (
                    <TextAtom variant="text-sm" className="text-gray-500">
                      Aún no hay debilidades identificadas.
                    </TextAtom>
                  )}
                </Panel>
              </div>

              {/* Por repasar: Curva de Olvido */}
              <Panel
                title="Por repasar"
                subtitle="Conceptos por re-encontrar antes que decaigan."
              >
                <ForgettingCurveList concepts={evaluated} />
              </Panel>
            </div>
          )}
        </div>
      </BoxAtom>
    </BoxAtom>
  )
}
