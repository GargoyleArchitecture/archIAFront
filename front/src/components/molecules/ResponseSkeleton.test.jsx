/**
 * Tests F9-T2: ResponseSkeleton
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResponseSkeleton from './ResponseSkeleton'

describe('ResponseSkeleton', () => {
  it('renderiza variante tutor con 3 líneas', () => {
    const { container } = render(<ResponseSkeleton mode="tutor" />)
    expect(screen.getByTestId('response-skeleton-tutor')).toBeInTheDocument()
    expect(screen.queryByTestId('response-skeleton-professional')).toBeNull()
    // 3 spans con role="presentation" (de SkeletonAtom)
    const sk = container.querySelectorAll('[role="presentation"]')
    expect(sk).toHaveLength(3)
  })

  it('renderiza variante professional con bloque + 2 líneas', () => {
    const { container } = render(<ResponseSkeleton mode="professional" />)
    expect(screen.getByTestId('response-skeleton-professional')).toBeInTheDocument()
    expect(screen.queryByTestId('response-skeleton-tutor')).toBeNull()
    const sk = container.querySelectorAll('[role="presentation"]')
    expect(sk).toHaveLength(3) // bloque + 2 líneas
  })

  it('cae a professional como default seguro cuando mode es inválido', () => {
    render(<ResponseSkeleton mode="weird-mode" />)
    expect(screen.getByTestId('response-skeleton-professional')).toBeInTheDocument()
  })

  it('cae a professional cuando mode es undefined', () => {
    render(<ResponseSkeleton />)
    expect(screen.getByTestId('response-skeleton-professional')).toBeInTheDocument()
  })

  it('aplica atributos a11y correctos', () => {
    render(<ResponseSkeleton mode="tutor" />)
    // El contenedor externo, no el inner div con testid
    const status = screen.getAllByRole('status')[0]
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-label', 'Generando respuesta')
  })

  it('respeta prefers-reduced-motion vía SkeletonAtom (motion-reduce:animate-none)', () => {
    const { container } = render(<ResponseSkeleton mode="tutor" />)
    const sk = container.querySelector('[role="presentation"]')
    expect(sk.className).toContain('motion-reduce:animate-none')
  })
})
