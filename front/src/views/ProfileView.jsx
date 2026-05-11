/**
 * F8-T1: ProfileView — Dashboard "Mi Perfil Técnico"
 *
 * Esqueleto navegable de la vista. Carga el perfil técnico del usuario
 * autenticado y orquesta cuatro estados: loading, error, empty, ready.
 *
 * El contenido interno de cada sección (radar, chips, action cards,
 * curva de olvido) se entrega en F8-T2..T5; aquí sólo va el shell.
 *
 * Endpoints consumidos:
 *   GET /users/:userId/profile      via profileService.getUserProfile
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowBackIcon       from '@mui/icons-material/ArrowBack'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import RefreshIcon         from '@mui/icons-material/Refresh'
import PersonOutlineIcon   from '@mui/icons-material/PersonOutline'
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline'

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

/* ─────────────────────────────────────────────────────────────
   Constantes de dominio
───────────────────────────────────────────────────────────── */
const SECTION_TITLES = [
  { key: 'radar',     title: 'Dominio General',  hint: 'Top 6 conceptos en formato radar (F8-T2).' },
  { key: 'strengths', title: 'Fortalezas',       hint: 'Conceptos consolidados con alta mastery (F8-T3).' },
  { key: 'weaknesses', title: 'Debilidades',     hint: 'Áreas a reforzar — generador de retos (F8-T4).' },
  { key: 'forgetting', title: 'Curva de Olvido', hint: 'Conceptos por re-encontrar antes que decaigan (F8-T5).' },
]

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function isEmptyProfile(profile) {
  if (!profile) return true
  const ec = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts : []
  const st = Array.isArray(profile.strengths) ? profile.strengths : []
  const wk = Array.isArray(profile.weaknesses) ? profile.weaknesses : []
  return ec.length === 0 && st.length === 0 && wk.length === 0
}

/* ─────────────────────────────────────────────────────────────
   Subcomponentes locales (cohesivos con la vista, no exportados)
───────────────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <BoxAtom display="flex" direction="col" gap="6" p="6" data-testid="profile-skeleton">
      <SkeletonAtom width="40%" height={28} />
      {SECTION_TITLES.map((s) => (
        <BoxAtom
          key={s.key}
          display="flex"
          direction="col"
          gap="3"
          p="5"
          rounded="lg"
          className="border border-gray-200 bg-white"
        >
          <SkeletonAtom width="30%" height={20} />
          <SkeletonAtom width="100%" height={s.key === 'radar' ? 220 : 80} />
        </BoxAtom>
      ))}
    </BoxAtom>
  )
}

function ErrorPanel({ message, onRetry }) {
  return (
    <BoxAtom
      display="flex"
      direction="col"
      align="center"
      justify="center"
      gap="3"
      p="8"
      className="m-6 rounded-lg border border-error-300 bg-error-50"
      data-testid="profile-error"
    >
      <ErrorOutlineIcon style={{ fontSize: 40, color: 'var(--color-error-600)' }} aria-hidden="true" />
      <TextAtom variant="text-lg" weight="semibold" className="text-error-700">
        No se pudo cargar tu perfil
      </TextAtom>
      <TextAtom variant="text-sm" className="text-error-600 text-center">
        {message || 'Hubo un problema al consultar el servicio. Intentá nuevamente en unos segundos.'}
      </TextAtom>
      <ButtonAtom
        variant="text-icon"
        intent="primary"
        size="sm"
        icon={<RefreshIcon />}
        onClick={onRetry}
      >
        Reintentar
      </ButtonAtom>
    </BoxAtom>
  )
}

function EmptyState({ onCTA }) {
  return (
    <BoxAtom
      display="flex"
      direction="col"
      align="center"
      justify="center"
      gap="4"
      p="8"
      className="m-6 rounded-lg border border-dashed border-gray-300 bg-white"
      data-testid="profile-empty"
    >
      <PersonOutlineIcon
        style={{ fontSize: 64, color: 'var(--mode-primary, var(--color-brand-400))' }}
        aria-hidden="true"
      />
      <TextAtom variant="display-xs" weight="semibold" className="text-gray-800 text-center">
        Tu perfil técnico todavía está vacío
      </TextAtom>
      <TextAtom variant="text-sm" className="text-gray-500 text-center max-w-md">
        El agente aprende sobre tus fortalezas y debilidades a medida que charlan.
        Empezá una conversación y volvé acá en unos minutos.
      </TextAtom>
      <ButtonAtom
        variant="text-icon"
        intent="primary"
        icon={<ChatBubbleOutlineIcon />}
        onClick={onCTA}
      >
        Hablar con el agente para construir tu perfil
      </ButtonAtom>
    </BoxAtom>
  )
}

function SectionCard({ title, hint, children }) {
  return (
    <BoxAtom
      as="section"
      display="flex"
      direction="col"
      gap="3"
      p="5"
      rounded="lg"
      className="border border-gray-200 bg-white"
    >
      <BoxAtom display="flex" direction="col" gap="1">
        <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
          {title}
        </TextAtom>
        <TextAtom variant="text-xs" className="text-gray-400">
          {hint}
        </TextAtom>
      </BoxAtom>
      <div>{children}</div>
    </BoxAtom>
  )
}

function ReadyContent({ profile, userId, enableRoutines = true }) {
  const evaluated = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts : []
  const strengthsHydrated = hydrateNames(profile.strengths, evaluated)
  const weaknessesHydrated = hydrateNames(profile.weaknesses, evaluated)

  return (
    <BoxAtom display="flex" direction="col" gap="5" p="6" data-testid="profile-ready">
      <SectionCard title="Dominio General" hint={SECTION_TITLES[0].hint}>
        <RadarChart concepts={evaluated} />
      </SectionCard>

      <SectionCard title="Fortalezas" hint={SECTION_TITLES[1].hint}>
        {strengthsHydrated.length > 0 ? (
          <div className="flex flex-wrap gap-2" data-testid="strengths-grid">
            {strengthsHydrated.map((s) => (
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
            Aún no hay fortalezas registradas.
          </TextAtom>
        )}
      </SectionCard>

      <SectionCard title="Debilidades" hint={SECTION_TITLES[2].hint}>
        {weaknessesHydrated.length > 0 ? (
          enableRoutines ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="weaknesses-grid">
              {weaknessesHydrated.map((w) => (
                <WeaknessActionCard
                  key={w.name}
                  userId={userId}
                  name={w.name}
                  mastery={w.mastery}
                  lastSeenAt={w.lastSeenAt}
                />
              ))}
            </div>
          ) : (
            // F11-T5: retos apagados → listado read-only sin CTA.
            <div className="flex flex-wrap gap-2" data-testid="weaknesses-list-readonly">
              {weaknessesHydrated.map((w) => (
                <span
                  key={w.name}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {w.name}
                </span>
              ))}
            </div>
          )
        ) : (
          <TextAtom variant="text-sm" className="text-gray-500">
            Aún no hay debilidades identificadas.
          </TextAtom>
        )}
      </SectionCard>

      <SectionCard title="Curva de Olvido" hint={SECTION_TITLES[3].hint}>
        <ForgettingCurveList concepts={evaluated} />
      </SectionCard>
    </BoxAtom>
  )
}

/* ─────────────────────────────────────────────────────────────
   Vista principal
───────────────────────────────────────────────────────────── */
export default function ProfileView() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mode } = useMode()
  const telemetry = useTelemetry()
  const { features } = useFeatures()

  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'empty' | 'ready'
  const [profile, setProfile] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      // ProtectedRoute cubre el caso unauth; este guard es defensivo.
      return
    }
    setStatus('loading')
    setErrorMsg(null)
    try {
      const data = await getUserProfile(user.id)
      setProfile(data ?? null)
      setStatus(isEmptyProfile(data) ? 'empty' : 'ready')
    } catch (err) {
      // 404 o respuesta sin perfil → tratamos como vacío para no asustar al usuario.
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

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // F11-T6: emite `profile_viewed` cuando la vista llega a estado ready.
  useEffect(() => {
    if (status === 'ready' && profile) {
      const evalCount = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts.length : 0
      telemetry.emit('profile_viewed', {
        evaluatedConceptsCount: evalCount,
        strengthsCount: Array.isArray(profile.strengths) ? profile.strengths.length : 0,
        weaknessesCount: Array.isArray(profile.weaknesses) ? profile.weaknesses.length : 0,
      })
    }
  }, [status, profile, telemetry])

  const handleBackToChat = () => navigate('/')

  // F11-T5: dashboard apagado por tenant → cortocircuito a un mensaje
  // explicativo (la ruta sigue existiendo para super-admin tests).
  if (!features.enableProfileDashboard) {
    return (
      <BoxAtom
        display="flex"
        direction="col"
        align="center"
        justify="center"
        h="screen"
        gap="3"
        className="bg-gray-50"
        data-testid="profile-disabled"
      >
        <TextAtom variant="display-xs" weight="semibold" className="text-gray-700 text-center">
          El panel de perfil técnico está deshabilitado para tu organización.
        </TextAtom>
        <TextAtom variant="text-sm" className="text-gray-500 text-center max-w-md">
          Contactá a un administrador si necesitás acceso.
        </TextAtom>
        <ButtonAtom
          variant="text-icon"
          intent="primary"
          onClick={handleBackToChat}
        >
          Volver al chat
        </ButtonAtom>
      </BoxAtom>
    )
  }

  return (
    <BoxAtom
      display="flex"
      direction="col"
      h="screen"
      className="overflow-hidden bg-gray-50"
    >
      {/* ── Top bar ── */}
      <BoxAtom
        as="header"
        display="flex"
        align="center"
        justify="between"
        gap="3"
        px="4"
        className="h-14 border-b border-gray-200 bg-white flex-shrink-0"
      >
        <BoxAtom display="flex" align="center" gap="2">
          <ButtonAtom
            variant="icon"
            intent="ghost"
            size="sm"
            onClick={handleBackToChat}
            aria-label="Volver al chat"
          >
            <ArrowBackIcon style={{ fontSize: 18 }} />
          </ButtonAtom>
          <TextAtom variant="text-lg" weight="semibold" className="text-gray-800">
            Mi Perfil Técnico
          </TextAtom>
        </BoxAtom>
        <ModeBadgeAtom mode={mode} size="sm" />
      </BoxAtom>

      {/* ── Body ── */}
      <BoxAtom
        as="main"
        flex="1"
        className="overflow-y-auto"
        aria-busy={status === 'loading'}
        aria-live="polite"
      >
        {status === 'loading' && <ProfileSkeleton />}
        {status === 'error'   && <ErrorPanel message={errorMsg} onRetry={fetchProfile} />}
        {status === 'empty'   && <EmptyState onCTA={handleBackToChat} />}
        {status === 'ready'   && (
          <ReadyContent
            profile={profile}
            userId={user?.id}
            enableRoutines={features.enableRoutines}
          />
        )}
      </BoxAtom>
    </BoxAtom>
  )
}
