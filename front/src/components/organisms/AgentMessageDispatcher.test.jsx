/**
 * Tests F10-T1: AgentMessageDispatcher
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import AgentMessageDispatcher from './AgentMessageDispatcher'
import { ModeProvider } from '../../contexts/ModeContext'

function renderDispatcher(message) {
  return render(
    <MemoryRouter>
      <ModeProvider>
        <AgentMessageDispatcher message={message} />
      </ModeProvider>
    </MemoryRouter>
  )
}

describe('AgentMessageDispatcher', () => {
  it('renderiza MarkdownRenderer para name="unifier"', () => {
    const { container } = renderDispatcher({
      name: 'unifier',
      content: 'Hola **mundo**',
    })
    // MarkdownRenderer produce un <p> con el texto
    expect(container.textContent).toMatch(/Hola/)
  })

  it('retorna null para name="supervisor" (silent)', () => {
    const { container } = renderDispatcher({ name: 'supervisor', content: 'x' })
    expect(container.firstChild).toBeNull()
  })

  it('retorna null para name="profile_shadow" (silent)', () => {
    const { container } = renderDispatcher({ name: 'profile_shadow' })
    expect(container.firstChild).toBeNull()
  })

  it('retorna null para name="evaluator" (silent)', () => {
    const { container } = renderDispatcher({ name: 'evaluator' })
    expect(container.firstChild).toBeNull()
  })

  it('cae al FALLBACK (markdown) para nombre desconocido', () => {
    const { container } = renderDispatcher({
      name: 'algun_nodo_nuevo_xyz',
      content: 'Texto fallback',
    })
    expect(container.textContent).toMatch(/Texto fallback/)
  })

  it('F12-T9: renderiza link a /routines/:id para name="routine_generator" con payload válido', () => {
    renderDispatcher({
      name: 'routine_generator',
      payload: {
        id: 'r-1',
        title: 'Refactorizar caching',
        targetWeakness: 'Caching',
        expectedConcepts: ['lru'],
        difficulty: 3,
        inverseRagSnippet: 'def get(k): return cache.get(k)',
      },
    })
    // El dispatcher ya no inyecta ChallengeBlock; ahora pone un enlace a la
    // nueva vista detalle (F12-T9). El link conserva el título para el alumno.
    const linkEl = screen.getByTestId('routine-generated-link')
    expect(linkEl).toBeInTheDocument()
    const anchor = linkEl.querySelector('a')
    expect(anchor).toBeTruthy()
    expect(anchor.getAttribute('href')).toBe('/routines/r-1')
    expect(anchor.textContent).toMatch(/Refactorizar caching/)
  })

  it('para routine_generator SIN payload.id, el dispatcher retorna null', () => {
    const { container } = renderDispatcher({
      name: 'routine_generator',
      payload: { title: 'sin id' },
    })
    expect(container.firstChild).toBeNull()
  })

  it('retorna null si message es null o no-objeto', () => {
    const { container, rerender } = render(
      <MemoryRouter>
        <ModeProvider>
          <AgentMessageDispatcher message={null} />
        </ModeProvider>
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <MemoryRouter>
        <ModeProvider>
          <AgentMessageDispatcher message={42} />
        </ModeProvider>
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('mensaje sin name → fallback con content vacío (no crashea)', () => {
    const { container } = renderDispatcher({ content: 'huérfano' })
    expect(container.textContent).toMatch(/huérfano/)
  })
})
