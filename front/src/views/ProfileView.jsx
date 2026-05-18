/**
 * ProfileView — Vista unificada de perfil de usuario.
 *
 * Tres secciones verticales:
 *   1. Cuenta — name, email, tenant (read-only).
 *   2. Preferencias de comunicación — explanationStyle + verbosity.
 *      Editables con segmented buttons del DS y botón "Guardar".
 *   3. Perfil técnico — Dominio General · Fortalezas · Debilidades ·
 *      Curva de Olvido. Orquesta los 4 estados: loading/error/empty/ready.
 *
 * Endpoints consumidos:
 *   GET  /auth/me                       via useAuth().refreshUser   (tenant)
 *   GET  /users/:userId/preferences     via useUserPreference.load
 *   PUT  /users/:userId/preferences     via useUserPreference.save
 *   GET  /users/:userId/profile         via profileService.getUserProfile
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import RefreshIcon         from '@mui/icons-material/Refresh'
import PersonOutlineIcon   from '@mui/icons-material/PersonOutline'
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline'

import { useAuth } from '../hooks/useAuth'
import { useMode } from '../contexts/ModeContext'
import { useTelemetry } from '../hooks/useTelemetry'
import { useFeatures } from '../contexts/FeaturesContext'
import { usePreferences } from '../contexts/PreferencesContext'
import { getUserProfile } from '../services/profileService'

import BoxAtom       from '../components/atoms/BoxAtom'
import TextAtom      from '../components/atoms/TextAtom'
import ButtonAtom    from '../components/atoms/ButtonAtom'
import LabelAtom     from '../components/atoms/LabelAtom'
import SkeletonAtom  from '../components/atoms/SkeletonAtom'
import ModeBadgeAtom from '../components/atoms/ModeBadgeAtom'
import TooltipAtom   from '../components/atoms/TooltipAtom'
import StrengthChip  from '../components/molecules/StrengthChip'
import ForgettingCurveList from '../components/molecules/ForgettingCurveList'
import WeaknessActionCard from '../components/molecules/WeaknessActionCard'
import RadarChart from '../components/organisms/RadarChart'
import { hydrateNames } from '../utils/profileHydration'

/* ─────────────────────────────────────────────────────────────
   Constantes de dominio
───────────────────────────────────────────────────────────── */
const SECTION_TITLES = [
  { key: 'radar',     title: 'Dominio General',  hint: 'Top 6 conceptos en formato radar.' },
  { key: 'strengths', title: 'Fortalezas',       hint: 'Conceptos consolidados con alta mastery.' },
  { key: 'weaknesses', title: 'Debilidades',     hint: 'Áreas a reforzar — generador de retos.' },
  { key: 'forgetting', title: 'Curva de Olvido', hint: 'Conceptos por re-encontrar antes que decaigan.' },
]

const EXPLANATION_STYLES = [
  { value: 'FORMAL',  label: 'Formal',  desc: 'Terminología técnica precisa' },
  { value: 'ANALOGY', label: 'Analogy', desc: 'Comparaciones con el mundo real' },
  { value: 'CONCISE', label: 'Concise', desc: 'Respuestas cortas y directas' },
]

const VERBOSITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    desc: 'Solo puntos clave' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Detalle equilibrado' },
  { value: 'HIGH',   label: 'High',   desc: 'Explicación completa' },
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
   Subcomponentes locales
───────────────────────────────────────────────────────────── */
function SectionCard({ title, hint, children, headerExtra }) {
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
      <BoxAtom display="flex" justify="between" align="start" gap="3">
        <BoxAtom display="flex" direction="col" gap="1" className="flex-1 min-w-0">
          <TextAtom variant="text-md" weight="semibold" className="text-gray-800">
            {title}
          </TextAtom>
          {hint && (
            <TextAtom variant="text-xs" className="text-gray-400">
              {hint}
            </TextAtom>
          )}
        </BoxAtom>
        {headerExtra}
      </BoxAtom>
      <div>{children}</div>
    </BoxAtom>
  )
}

function ReadOnlyField({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <LabelAtom>{label}</LabelAtom>
      <div
        className={[
          'rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 select-text',
          'break-all',
          mono ? 'font-mono text-xs' : '',
        ].filter(Boolean).join(' ')}
      >
        {value || <span className="text-gray-400 italic">—</span>}
      </div>
    </div>
  )
}

function AccountCard({ user }) {
  if (!user) {
    return (
      <SectionCard title="Cuenta" hint="Información de tu cuenta y organización.">
        <TextAtom variant="text-sm" className="text-gray-500">
          Inicia sesión para ver tus datos.
        </TextAtom>
      </SectionCard>
    )
  }

  const tenantName = user.tenant?.name || user.tenantName || null
  const tenantFallback = tenantName || user.tenantId || '—'

  return (
    <SectionCard title="Cuenta" hint="Información de tu cuenta y organización.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="profile-account">
        <ReadOnlyField label="Nombre" value={user.name} />
        <ReadOnlyField label="Correo" value={user.email} />
        <ReadOnlyField
          label={tenantName ? 'Tenant' : 'Tenant ID'}
          value={tenantFallback}
          mono={!tenantName}
        />
      </div>
    </SectionCard>
  )
}

function EnumField({ label, options, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <LabelAtom className="text-gray-700 font-medium">{label}</LabelAtom>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white p-1"
      >
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <TooltipAtom key={opt.value} content={opt.desc} position="top">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => onChange(opt.value)}
                className={[
                  'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  selected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100',
                  disabled ? 'opacity-50 cursor-not-allowed' : '',
                ].filter(Boolean).join(' ')}
              >
                {opt.label}
              </button>
            </TooltipAtom>
          )
        })}
      </div>
    </div>
  )
}

function PreferencesCard({ userId }) {
  // F13-T1: fuente única vía PreferencesContext (compartida con el chat).
  // Guardar aquí se refleja de inmediato en lo que useChatManager envía.
  const { preference, reload, save, isLoading } = usePreferences()
  const [style, setStyle]         = useState(null)
  const [verbosity, setVerbosity] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    setStyle(preference.explanationStyle)
    setVerbosity(preference.verbosity)
  }, [preference])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await save({ explanationStyle: style, verbosity })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const dirty =
    style !== preference.explanationStyle ||
    verbosity !== preference.verbosity

  return (
    <SectionCard
      title="Preferencias de comunicación"
      hint="Cómo querés que la IA explique y formatee sus respuestas."
    >
      <div className="flex flex-col gap-5" data-testid="profile-preferences">
        <EnumField
          label="Explanation Style"
          options={EXPLANATION_STYLES}
          value={style}
          onChange={setStyle}
          disabled={!userId || isLoading || saving}
        />
        <EnumField
          label="Verbosity"
          options={VERBOSITY_OPTIONS}
          value={verbosity}
          onChange={setVerbosity}
          disabled={!userId || isLoading || saving}
        />

        {error && (
          <BoxAtom bg="error-50" border="error-300" rounded="md" p="3">
            <TextAtom variant="text-sm" className="text-error-600">{error}</TextAtom>
          </BoxAtom>
        )}
        {success && (
          <BoxAtom bg="success-50" border="success-300" rounded="md" p="3">
            <TextAtom variant="text-sm" className="text-success-700">
              Preferencias guardadas.
            </TextAtom>
          </BoxAtom>
        )}

        <div className="flex justify-end">
          <ButtonAtom
            intent="primary"
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving || !userId}
          >
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </ButtonAtom>
        </div>
      </div>
    </SectionCard>
  )
}

function ProfileSkeleton() {
  return (
    <BoxAtom display="flex" direction="col" gap="5" data-testid="profile-skeleton">
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
      rounded="lg"
      className="border border-error-300 bg-error-50"
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
      rounded="lg"
      className="border border-dashed border-gray-300 bg-white"
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

function ReadyContent({ profile, userId, enableRoutines = true }) {
  const evaluated = Array.isArray(profile.evaluatedConcepts) ? profile.evaluatedConcepts : []
  const strengthsHydrated = hydrateNames(profile.strengths, evaluated)
  const weaknessesHydrated = hydrateNames(profile.weaknesses, evaluated)

  return (
    <BoxAtom display="flex" direction="col" gap="5" data-testid="profile-ready">
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
  const { user, refreshUser } = useAuth()
  const { mode } = useMode()
  const telemetry = useTelemetry()
  const { features } = useFeatures()

  const [status, setStatus] = useState('loading')
  const [profile, setProfile] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  /* Refrescar el user (para que /auth/me devuelva tenant cargado). */
  useEffect(() => {
    if (typeof refreshUser === 'function' && user?.id && !user?.tenant) {
      refreshUser().catch(() => { /* tolerante: si falla, mostramos tenantId */ })
    }
  }, [refreshUser, user?.id, user?.tenant])

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

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
      flex="1"
      minH="0"
      className="overflow-hidden bg-gray-50"
    >
      {/* ── Header del panel ── */}
      <BoxAtom
        as="header"
        display="flex"
        align="center"
        justify="between"
        gap="3"
        px="4"
        className="h-14 border-b border-gray-200 bg-white flex-shrink-0"
      >
        <TextAtom variant="text-lg" weight="semibold" className="text-gray-800">
          Mi Perfil
        </TextAtom>
        <ModeBadgeAtom mode={mode} size="sm" />
      </BoxAtom>

      {/* ── Body ── */}
      <BoxAtom
        as="main"
        flex="1"
        minH="0"
        className="overflow-y-auto"
        aria-busy={status === 'loading'}
        aria-live="polite"
      >
        <BoxAtom display="flex" direction="col" gap="5" p="6">
          <AccountCard user={user} />

          {user?.id && <PreferencesCard userId={user.id} />}

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
    </BoxAtom>
  )
}
