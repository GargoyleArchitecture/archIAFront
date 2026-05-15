/**
 * Tests: SpinnerAtom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpinnerAtom from './SpinnerAtom'

describe('SpinnerAtom', () => {
  it('renderiza con role="status" y aria-live="polite"', () => {
    render(<SpinnerAtom data-testid="sp" />)
    const el = screen.getByTestId('sp')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('usa el label por defecto "Cargando" y lo expone como aria-label + sr-only', () => {
    render(<SpinnerAtom data-testid="sp" />)
    const el = screen.getByTestId('sp')
    expect(el).toHaveAttribute('aria-label', 'Cargando')
    // el texto sr-only existe dentro
    expect(el.textContent).toContain('Cargando')
  })

  it('respeta un label personalizado', () => {
    render(<SpinnerAtom label="Generando reto" data-testid="sp" />)
    const el = screen.getByTestId('sp')
    expect(el).toHaveAttribute('aria-label', 'Generando reto')
    expect(el.textContent).toContain('Generando reto')
  })

  it('aplica las clases de tamaño según el prop size', () => {
    const { rerender } = render(<SpinnerAtom size="sm" data-testid="sp" />)
    let ring = screen.getByTestId('sp').firstChild
    expect(ring.className).toContain('w-4')
    expect(ring.className).toContain('h-4')

    rerender(<SpinnerAtom size="lg" data-testid="sp" />)
    ring = screen.getByTestId('sp').firstChild
    expect(ring.className).toContain('w-12')
    expect(ring.className).toContain('h-12')
  })

  it('aplica el color de intent (primary por default usa brand-600)', () => {
    const { rerender } = render(<SpinnerAtom data-testid="sp" />)
    let ring = screen.getByTestId('sp').firstChild
    expect(ring.className).toContain('border-brand-600')

    rerender(<SpinnerAtom intent="on-dark" data-testid="sp" />)
    ring = screen.getByTestId('sp').firstChild
    expect(ring.className).toContain('border-white')
  })

  it('incluye animate-spin + motion-reduce:animate-none', () => {
    render(<SpinnerAtom data-testid="sp" />)
    const ring = screen.getByTestId('sp').firstChild
    expect(ring.className).toContain('animate-spin')
    expect(ring.className).toContain('motion-reduce:animate-none')
  })
})
