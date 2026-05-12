/**
 * Tests F6-T3 / F6-T4: theming dual de BubbleMessage
 *
 * Snapshot tests con dos themes (tutor vs professional). Los snapshots
 * verifican que las clases + estilos inline cambian apropiadamente.
 */
import { describe, it, expect } from 'vitest'
import BubbleMessage from './BubbleMessage'
import { renderWithMode } from '../../test/renderWithMode'

describe('BubbleMessage — theming F6-T3 / F6-T4', () => {
  it('renderiza variant=user con data-mode=tutor (snapshot)', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="user">Hello tutor</BubbleMessage>,
      { mode: 'tutor' },
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renderiza variant=user con data-mode=professional (snapshot)', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="user">Hello professional</BubbleMessage>,
      { mode: 'professional' },
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renderiza variant=ai con isLoading=true (typing dots)', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="ai" isLoading />,
      { mode: 'tutor' },
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('aplica padding y maxWidth desde tokens --mode-* en el bubble', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="user">X</BubbleMessage>,
      { mode: 'tutor' },
    )
    // jsdom no carga tokens.css, así que getComputedStyle resolvería las
    // CSS vars a fallbacks. Leemos el inline style directamente.
    const bubble = container.querySelector('[data-variant="user"]')
    expect(bubble.style.backgroundColor).toBe('var(--mode-bubble-bg-user)')
    expect(bubble.style.padding).toBe('var(--mode-bubble-padding)')
    expect(bubble.style.maxWidth).toBe('var(--mode-bubble-max-width)')
  })

  it('variant=ai aplica borde con --mode-bubble-border-ai', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="ai">X</BubbleMessage>,
      { mode: 'professional' },
    )
    const bubble = container.querySelector('[data-variant="ai"]')
    expect(bubble.style.border).toContain('var(--mode-bubble-border-ai)')
  })

  it('aplica clase theme-transition para animar el cambio entre modos', () => {
    const { container } = renderWithMode(
      <BubbleMessage variant="user">X</BubbleMessage>,
      { mode: 'tutor' },
    )
    const bubble = container.querySelector('[data-variant="user"]')
    expect(bubble.className).toContain('theme-transition')
  })
})
