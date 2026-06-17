/**
 * ProfileView — Cuenta y preferencias del usuario.
 *
 * F18-T3: el dominio técnico (Dominio General · Fortalezas · Debilidades ·
 * Curva de Olvido) se MOVIÓ a `RoutineProgressView` ("Mi progreso", bajo
 * /routines). Esta vista queda con dos secciones:
 *   1. Cuenta — name, email, tenant (read-only).
 *   2. Preferencias de comunicación — explanationStyle + verbosity.
 *
 * Endpoints consumidos:
 *   GET  /auth/me                       via useAuth().refreshUser   (tenant)
 *   GET  /users/:userId/preferences     via PreferencesContext
 *   PUT  /users/:userId/preferences     via PreferencesContext
 */

import { useEffect, useState } from 'react'

import { useAuth } from '../hooks/useAuth'
import { useMode } from '../contexts/ModeContext'
import { usePreferences } from '../contexts/PreferencesContext'

import BoxAtom       from '../components/atoms/BoxAtom'
import TextAtom      from '../components/atoms/TextAtom'
import ButtonAtom    from '../components/atoms/ButtonAtom'
import LabelAtom     from '../components/atoms/LabelAtom'
import ModeBadgeAtom from '../components/atoms/ModeBadgeAtom'
import TooltipAtom   from '../components/atoms/TooltipAtom'

/* ─────────────────────────────────────────────────────────────
   Constantes de dominio
───────────────────────────────────────────────────────────── */
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
      hint="Cómo quieres que la IA explique y formatee sus respuestas."
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

/* ─────────────────────────────────────────────────────────────
   Vista principal
───────────────────────────────────────────────────────────── */
export default function ProfileView() {
  const { user, refreshUser } = useAuth()
  const { mode } = useMode()

  /* Refrescar el user (para que /auth/me devuelva tenant cargado). */
  useEffect(() => {
    if (typeof refreshUser === 'function' && user?.id && !user?.tenant) {
      refreshUser().catch(() => { /* tolerante: si falla, mostramos tenantId */ })
    }
  }, [refreshUser, user?.id, user?.tenant])

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
        <div className="flex flex-col">
          <TextAtom variant="text-lg" weight="semibold" className="text-gray-800">
            Mi Perfil
          </TextAtom>
          <TextAtom variant="text-xs" className="text-gray-500">
            Tu cuenta y cómo quieres que la IA te explique. Tu progreso técnico
            vive ahora en Routines › Mi progreso.
          </TextAtom>
        </div>
        <ModeBadgeAtom mode={mode} size="sm" />
      </BoxAtom>

      {/* ── Body ── */}
      <BoxAtom as="main" flex="1" minH="0" className="overflow-y-auto">
        <BoxAtom display="flex" direction="col" gap="5" p="6">
          <AccountCard user={user} />
          {user?.id && <PreferencesCard userId={user.id} />}
        </BoxAtom>
      </BoxAtom>
    </BoxAtom>
  )
}
