/**
 * F11-T3: Auditoría de accesibilidad (axe-core)
 *
 * Renderiza las 3 vistas críticas (ChatView, ProfileView, ChallengeBlock)
 * y ejecuta axe-core para detectar violaciones WCAG.
 *
 * Política:
 *   - Falla el test si hay issues nivel A.
 *   - Issues nivel AA se reportan como console.warn y se documentan en
 *     docs/a11y_audit.md para remediación planificada.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'

import { ModeProvider } from '../contexts/ModeContext'

/* ───────── Mocks comunes ───────── */
const mockGetUserProfile = vi.fn()
vi.mock('../services/profileService', () => ({
  getUserProfile: (...args) => mockGetUserProfile(...args),
  generateRoutine: vi.fn().mockResolvedValue({ id: 'r-1', title: 'T', difficulty: 3 }),
}))

const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}))

/* Importamos las vistas DESPUÉS de los mocks. */
import ProfileView from '../views/ProfileView'
import RoutineProgressView from '../views/RoutineProgressView'
import ChallengeBlock from '../components/molecules/ChallengeBlock'

/**
 * Configuración axe-core:
 * - rules nivel A: enforced (fail).
 * - rules AA y AAA: collected pero no fail.
 *
 * `disableOtherRules: true` no existe en axe-core; usamos `runOnly`
 * para limitar las reglas auditadas.
 */
const A_RULE_TAGS = ['wcag2a', 'wcag21a', 'best-practice']

async function runAxe(container, opts = {}) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: opts.tags || A_RULE_TAGS },
    resultTypes: ['violations'],
  })
  return results
}

function renderInShell(ui) {
  return render(
    <MemoryRouter>
      <ModeProvider>{ui}</ModeProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockUseAuth.mockReturnValue({ user: { id: 'u-1', name: 'Tester' } })
})

describe('a11y — ProfileView (Cuenta + Preferencias, F18-T3)', () => {
  it('ProfileView (slim) no tiene violaciones nivel A', async () => {
    const { container, findByTestId } = renderInShell(<ProfileView />)
    await findByTestId('profile-account')
    const results = await runAxe(container)
    if (results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[a11y] ProfileView violations:', JSON.stringify(results.violations, null, 2))
    }
    expect(results.violations).toEqual([])
  })
})

describe('a11y — RoutineProgressView (Mi progreso, F18-T2)', () => {
  it('estado ready no tiene violaciones nivel A', async () => {
    mockGetUserProfile.mockResolvedValueOnce({
      userId: 'u-1',
      strengths: ['SOLID', 'Patterns'],
      weaknesses: ['Concurrency'],
      evaluatedConcepts: [
        { name: 'SOLID',       mastery: 0.9, decayRate: 0.05, lastSeenAt: '2026-05-01T10:00:00Z' },
        { name: 'Concurrency', mastery: 0.3, decayRate: 0.05, lastSeenAt: '2026-04-15T10:00:00Z' },
        { name: 'Patterns',    mastery: 0.7, decayRate: 0.05, lastSeenAt: '2026-04-28T10:00:00Z' },
      ],
      updatedAt: '2026-05-08T12:00:00Z',
    })
    const { container, findByTestId } = renderInShell(<RoutineProgressView />)
    await findByTestId('progress-ready')
    const results = await runAxe(container)
    if (results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[a11y] RoutineProgressView violations:', JSON.stringify(results.violations, null, 2))
    }
    expect(results.violations).toEqual([])
  })

  it('estado empty no tiene violaciones nivel A', async () => {
    mockGetUserProfile.mockResolvedValueOnce({
      userId: 'u-1', strengths: [], weaknesses: [], evaluatedConcepts: [],
      updatedAt: '2026-05-08T12:00:00Z',
    })
    const { container, findByTestId } = renderInShell(<RoutineProgressView />)
    await findByTestId('progress-empty')
    const results = await runAxe(container)
    if (results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[a11y] RoutineProgressView empty violations:', results.violations)
    }
    expect(results.violations).toEqual([])
  })
})

describe('a11y — ChallengeBlock (F11-T3)', () => {
  it('ChallengeBlock con rutina activa no tiene violaciones nivel A', async () => {
    const routine = {
      id: 'r-1',
      title: 'Refactorizar caching naïve',
      targetWeakness: 'Caching',
      expectedConcepts: ['lru', 'invalidation'],
      difficulty: 3,
      inverseRagSnippet: 'def get(k):\n    return cache.get(k)',
    }
    const { container } = renderInShell(
      <ChallengeBlock routine={routine} onClose={() => {}} />
    )
    const results = await runAxe(container)
    if (results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[a11y] ChallengeBlock violations:', JSON.stringify(results.violations, null, 2))
    }
    expect(results.violations).toEqual([])
  })
})

describe('a11y — Color contrast advisory (AA, no failing)', () => {
  it('reporta hallazgos AA en RoutineProgressView sin fallar (solo warning)', async () => {
    mockGetUserProfile.mockResolvedValueOnce({
      userId: 'u-1', strengths: [], weaknesses: [], evaluatedConcepts: [],
      updatedAt: '2026-05-08T12:00:00Z',
    })
    const { container, findByTestId } = renderInShell(<RoutineProgressView />)
    await findByTestId('progress-empty')
    const results = await runAxe(container, { tags: ['wcag2aa', 'wcag21aa'] })
    if (results.violations.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[a11y][AA] RoutineProgressView empty — hallazgos AA documentables:',
        results.violations.map((v) => v.id))
    }
    // Asserción suave: NO falla por hallazgos AA. Documentar en docs/a11y_audit.md.
    expect(true).toBe(true)
  })
})
