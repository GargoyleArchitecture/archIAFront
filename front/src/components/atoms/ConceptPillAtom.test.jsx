/**
 * Tests F10-T2: ConceptPillAtom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConceptPillAtom from './ConceptPillAtom'

describe('ConceptPillAtom', () => {
  it('renderiza como <span role="status"> cuando no hay onClick', () => {
    render(<ConceptPillAtom>SOLID</ConceptPillAtom>)
    const pill = screen.getByRole('status')
    expect(pill.tagName).toBe('SPAN')
    expect(pill).toHaveTextContent('SOLID')
    expect(pill).toHaveAttribute('aria-label', 'Concepto SOLID')
  })

  it('renderiza como <button> con aria-pressed cuando se pasa onClick', () => {
    const onClick = vi.fn()
    render(<ConceptPillAtom onClick={onClick}>Cache</ConceptPillAtom>)
    const btn = screen.getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('refleja selected via aria-pressed=true', () => {
    render(<ConceptPillAtom onClick={() => {}} selected>Cache</ConceptPillAtom>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('aplica los colores del intent', () => {
    const { rerender } = render(<ConceptPillAtom intent="primary">x</ConceptPillAtom>)
    let pill = screen.getByRole('status')
    expect(pill.style.backgroundColor).toBe('var(--mode-primary-container, var(--color-brand-100))')

    rerender(<ConceptPillAtom intent="danger">x</ConceptPillAtom>)
    pill = screen.getByRole('status')
    expect(pill.style.backgroundColor).toBe('var(--color-error-100)')
  })

  it('aplica clase de tamaño correspondiente (sm/md/lg)', () => {
    const { rerender } = render(<ConceptPillAtom size="sm">x</ConceptPillAtom>)
    expect(screen.getByRole('status').className).toContain('text-xs')
    rerender(<ConceptPillAtom size="lg">x</ConceptPillAtom>)
    expect(screen.getByRole('status').className).toContain('text-md')
  })

  it('retorna null si children está vacío/nulo', () => {
    const { container, rerender } = render(<ConceptPillAtom>{''}</ConceptPillAtom>)
    expect(container.firstChild).toBeNull()
    rerender(<ConceptPillAtom>{null}</ConceptPillAtom>)
    expect(container.firstChild).toBeNull()
  })
})
