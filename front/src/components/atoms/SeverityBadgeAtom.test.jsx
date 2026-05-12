/**
 * Tests F8-T4: SeverityBadgeAtom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SeverityBadgeAtom, { severityFromMastery } from './SeverityBadgeAtom'

describe('SeverityBadgeAtom', () => {
  it('renderiza level=high con label Alta y aria-label correcto', () => {
    render(<SeverityBadgeAtom level="high" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveTextContent('Alta')
    expect(badge).toHaveAttribute('aria-label', 'Severidad Alta')
  })

  it('renderiza level=medium con label Media', () => {
    render(<SeverityBadgeAtom level="medium" />)
    expect(screen.getByRole('status')).toHaveTextContent('Media')
  })

  it('renderiza level=low con label Baja', () => {
    render(<SeverityBadgeAtom level="low" />)
    expect(screen.getByRole('status')).toHaveTextContent('Baja')
  })

  it('aplica fallback unknown ("—") para nivel inválido', () => {
    render(<SeverityBadgeAtom level="foo" />)
    expect(screen.getByRole('status')).toHaveTextContent('—')
  })
})

describe('severityFromMastery', () => {
  it('mapea correctamente los rangos de mastery', () => {
    expect(severityFromMastery(0.0)).toBe('high')
    expect(severityFromMastery(0.25)).toBe('high')
    expect(severityFromMastery(0.3)).toBe('medium')
    expect(severityFromMastery(0.59)).toBe('medium')
    expect(severityFromMastery(0.6)).toBe('low')
    expect(severityFromMastery(1.0)).toBe('low')
  })

  it('retorna unknown para valores no finitos', () => {
    expect(severityFromMastery(undefined)).toBe('unknown')
    expect(severityFromMastery(null)).toBe('unknown')
    expect(severityFromMastery(NaN)).toBe('unknown')
    expect(severityFromMastery('0.5')).toBe('unknown')
  })
})
