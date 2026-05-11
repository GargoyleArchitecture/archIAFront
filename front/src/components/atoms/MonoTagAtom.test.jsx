/**
 * Tests F10-T2: MonoTagAtom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonoTagAtom from './MonoTagAtom'

describe('MonoTagAtom', () => {
  it('renderiza el texto con role="status" y aria-label compuesto', () => {
    render(<MonoTagAtom>unifier</MonoTagAtom>)
    const tag = screen.getByRole('status')
    expect(tag).toHaveTextContent('unifier')
    expect(tag).toHaveAttribute('aria-label', 'Identificador técnico unifier')
  })

  it('aplica los colores del tone seleccionado', () => {
    const { rerender } = render(<MonoTagAtom tone="brand">x</MonoTagAtom>)
    let tag = screen.getByRole('status')
    expect(tag.style.backgroundColor).toBe('var(--color-brand-100)')

    rerender(<MonoTagAtom tone="success">x</MonoTagAtom>)
    tag = screen.getByRole('status')
    expect(tag.style.backgroundColor).toBe('var(--color-success-100)')

    rerender(<MonoTagAtom tone="warning">x</MonoTagAtom>)
    tag = screen.getByRole('status')
    expect(tag.style.backgroundColor).toBe('var(--color-warning-100)')
  })

  it('aplica clase de tamaño correspondiente', () => {
    const { rerender } = render(<MonoTagAtom size="sm">x</MonoTagAtom>)
    let tag = screen.getByRole('status')
    expect(tag.className).toContain('text-xs')

    rerender(<MonoTagAtom size="md">x</MonoTagAtom>)
    tag = screen.getByRole('status')
    expect(tag.className).toContain('text-sm')
  })

  it('retorna null si children es vacío/nulo', () => {
    const { container, rerender } = render(<MonoTagAtom>{''}</MonoTagAtom>)
    expect(container.firstChild).toBeNull()
    rerender(<MonoTagAtom>{null}</MonoTagAtom>)
    expect(container.firstChild).toBeNull()
    rerender(<MonoTagAtom>{undefined}</MonoTagAtom>)
    expect(container.firstChild).toBeNull()
  })

  it('font-mono está presente en las clases (semántica tipográfica)', () => {
    render(<MonoTagAtom>x</MonoTagAtom>)
    const tag = screen.getByRole('status')
    expect(tag.className).toContain('font-mono')
  })
})
