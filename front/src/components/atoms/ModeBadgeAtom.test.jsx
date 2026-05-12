/**
 * Tests F6-T1: ModeBadgeAtom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ModeBadgeAtom from './ModeBadgeAtom'

describe('ModeBadgeAtom', () => {
  it('renderiza con label "Tutor" y aria-label correcto en mode=tutor', () => {
    render(<ModeBadgeAtom mode="tutor" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'Modo Tutor activo')
    expect(badge).toHaveTextContent('Tutor')
  })

  it('renderiza con label "Profesional" en mode=professional', () => {
    render(<ModeBadgeAtom mode="professional" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'Modo Profesional activo')
    expect(badge).toHaveTextContent('Profesional')
  })

  it('oculta el label cuando showLabel=false (solo icono)', () => {
    render(<ModeBadgeAtom mode="tutor" showLabel={false} />)
    const badge = screen.getByRole('status')
    expect(badge).not.toHaveTextContent('Tutor')
    // El aria-label sigue describiendo el estado para screen readers
    expect(badge).toHaveAttribute('aria-label', 'Modo Tutor activo')
  })

  it('retorna null si mode es inválido', () => {
    const { container } = render(<ModeBadgeAtom mode="invalid" />)
    expect(container.firstChild).toBeNull()
  })

  it('aplica colores de la paleta secundaria en mode=tutor', () => {
    render(<ModeBadgeAtom mode="tutor" />)
    const badge = screen.getByRole('status')
    // Lectura directa del inline style — más robusto que toHaveStyle en jsdom.
    expect(badge.style.backgroundColor).toBe('var(--color-secondary-100)')
    expect(badge.style.color).toBe('var(--color-secondary-900)')
  })

  it('aplica colores de la paleta brand en mode=professional', () => {
    render(<ModeBadgeAtom mode="professional" />)
    const badge = screen.getByRole('status')
    expect(badge.style.backgroundColor).toBe('var(--color-brand-100)')
    expect(badge.style.color).toBe('var(--color-brand-900)')
  })
})
