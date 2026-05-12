/**
 * Tests F8-T3 / F8-T5: profileHydration utils
 */
import { describe, it, expect } from 'vitest'
import {
  hydrateNames,
  formatDateShort,
  humanizeDelta,
} from './profileHydration'

describe('hydrateNames', () => {
  const evaluated = [
    { name: 'SOLID',       mastery: 0.85, decayRate: 0.05, lastSeenAt: '2026-05-01T10:00:00Z' },
    { name: 'concurrency', mastery: 0.30, decayRate: '0.07', lastSeenAt: '2026-04-15T10:00:00Z' },
    { name: '  Caching  ', mastery: '0.6' },
  ]

  it('hace join case-insensitive y trimmed', () => {
    const out = hydrateNames(['solid', 'CONCURRENCY', 'caching'], evaluated)
    expect(out).toHaveLength(3)
    expect(out[0]).toMatchObject({ name: 'SOLID',       mastery: 0.85, decayRate: 0.05 })
    expect(out[1]).toMatchObject({ name: 'concurrency', mastery: 0.30, decayRate: 0.07 })
    expect(out[2]).toMatchObject({ name: 'Caching',     mastery: 0.6 })
  })

  it('retorna sólo name cuando no hay match en evaluatedConcepts', () => {
    const out = hydrateNames(['Unknown'], evaluated)
    expect(out).toEqual([{ name: 'Unknown' }])
  })

  it('filtra strings vacíos o no-string', () => {
    // eslint-disable-next-line no-sparse-arrays
    const out = hydrateNames(['SOLID', '', '   ', null, undefined, 42], evaluated)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('SOLID')
  })

  it('coerce numérico tolerante (string → number, vacío → undefined)', () => {
    const ec = [{ name: 'A', mastery: '0.45', decayRate: '' }]
    const [a] = hydrateNames(['A'], ec)
    expect(a.mastery).toBe(0.45)
    expect(a.decayRate).toBeUndefined()
  })

  it('retorna [] si names no es array', () => {
    expect(hydrateNames(null, evaluated)).toEqual([])
    expect(hydrateNames(undefined, evaluated)).toEqual([])
  })
})

describe('formatDateShort', () => {
  it('formatea "dd/mm" con padding', () => {
    // 5 de marzo de 2026 — mediodía UTC para evitar surprise de TZ
    expect(formatDateShort('2026-03-05T12:00:00Z')).toMatch(/^\d{2}\/\d{2}$/)
  })

  it('retorna string vacío para ISO inválido o ausente', () => {
    expect(formatDateShort('')).toBe('')
    expect(formatDateShort(null)).toBe('')
    expect(formatDateShort(undefined)).toBe('')
    expect(formatDateShort('not-a-date')).toBe('')
  })
})

describe('humanizeDelta', () => {
  const NOW = Date.parse('2026-05-08T12:00:00Z')

  it('retorna minutos cuando delta < 1h', () => {
    const iso = new Date(NOW - 15 * 60 * 1000).toISOString()
    expect(humanizeDelta(iso, NOW)).toMatch(/hace \d+ min/)
  })

  it('retorna horas cuando 1h ≤ delta < 1d', () => {
    const iso = new Date(NOW - 3 * 60 * 60 * 1000).toISOString()
    expect(humanizeDelta(iso, NOW)).toBe('hace 3 h')
  })

  it('retorna días (singular y plural) cuando 1d ≤ delta < 1 mes', () => {
    const iso1 = new Date(NOW - 1 * 24 * 60 * 60 * 1000).toISOString()
    const iso7 = new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString()
    expect(humanizeDelta(iso1, NOW)).toBe('hace 1 día')
    expect(humanizeDelta(iso7, NOW)).toBe('hace 7 días')
  })

  it('retorna meses cuando delta ≥ 1 mes', () => {
    const iso = new Date(NOW - 60 * 24 * 60 * 60 * 1000).toISOString()
    expect(humanizeDelta(iso, NOW)).toBe('hace 2 meses')
  })

  it('retorna "—" para ISO inválido, ausente o futuro', () => {
    expect(humanizeDelta(null, NOW)).toBe('—')
    expect(humanizeDelta('not-a-date', NOW)).toBe('—')
    const future = new Date(NOW + 60 * 60 * 1000).toISOString()
    expect(humanizeDelta(future, NOW)).toBe('—')
  })
})
