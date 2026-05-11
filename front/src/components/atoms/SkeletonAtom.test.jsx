/**
 * Tests F8-T1: SkeletonAtom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SkeletonAtom from './SkeletonAtom'

describe('SkeletonAtom', () => {
  it('renderiza con dimensiones por defecto (width 100%, height 16px)', () => {
    render(<SkeletonAtom data-testid="sk" />)
    const el = screen.getByTestId('sk')
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('16px')
  })

  it('acepta width/height como número (los convierte a px) y como string CSS', () => {
    const { rerender } = render(<SkeletonAtom width={120} height={48} data-testid="sk" />)
    let el = screen.getByTestId('sk')
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('48px')

    rerender(<SkeletonAtom width="50%" height="2rem" data-testid="sk" />)
    el = screen.getByTestId('sk')
    expect(el.style.width).toBe('50%')
    expect(el.style.height).toBe('2rem')
  })

  it('aplica la clase de redondeo seleccionada', () => {
    const { rerender } = render(<SkeletonAtom rounded="full" data-testid="sk" />)
    expect(screen.getByTestId('sk').className).toContain('rounded-full')

    rerender(<SkeletonAtom rounded="none" data-testid="sk" />)
    expect(screen.getByTestId('sk').className).toContain('rounded-none')
  })

  it('es accesible: aria-hidden + role="presentation" (decorativo)', () => {
    render(<SkeletonAtom data-testid="sk" />)
    const el = screen.getByTestId('sk')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveAttribute('role', 'presentation')
  })

  it('incluye animate-pulse + motion-reduce:animate-none para respetar prefers-reduced-motion', () => {
    render(<SkeletonAtom data-testid="sk" />)
    const el = screen.getByTestId('sk')
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('motion-reduce:animate-none')
  })
})
