/**
 * Tests F6-T3 / F6-T4: theming dual del MarkdownRenderer
 *
 * Verifica que blockquote, listas y código inline reflejan los tokens
 * --mode-* del modo activo.
 */
import { describe, it, expect } from 'vitest'
import MarkdownRenderer from './MarkdownRenderer'
import { renderWithMode } from '../../test/renderWithMode'

describe('MarkdownRenderer — theming F6-T3 / F6-T4', () => {
  it('blockquote en data-mode=tutor usa fondo --mode-blockquote-bg', () => {
    const md = '> Esto es una analogía pedagógica importante.'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'tutor' },
    )
    const quote = container.querySelector('blockquote')
    expect(quote).toBeInTheDocument()
    // jsdom no carga tokens.css; leemos el inline style directamente.
    expect(quote.style.backgroundColor).toBe('var(--mode-blockquote-bg)')
    expect(quote.style.color).toBe('var(--mode-blockquote-fg)')
    expect(quote.style.borderColor).toBe('var(--mode-callout-border)')
  })

  it('blockquote en data-mode=professional referencia los mismos tokens (cambia el valor de la var)', () => {
    const md = '> Nota técnica sobre el ASR.'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'professional' },
    )
    const quote = container.querySelector('blockquote')
    expect(quote.style.backgroundColor).toBe('var(--mode-blockquote-bg)')
    expect(quote.style.color).toBe('var(--mode-blockquote-fg)')
  })

  it('inline code usa --mode-code-bg / --mode-code-fg', () => {
    const md = 'Usa `npm install` para instalar.'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'tutor' },
    )
    const code = container.querySelector('code')
    expect(code).toBeInTheDocument()
    expect(code.style.backgroundColor).toBe('var(--mode-code-bg)')
    expect(code.style.color).toBe('var(--mode-code-fg)')
  })

  it('listas usan --mode-list-spacing como gap', () => {
    const md = '- uno\n- dos\n- tres'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'professional' },
    )
    const ul = container.querySelector('ul')
    expect(ul.style.gap).toBe('var(--mode-list-spacing)')
  })

  it('snapshot del blockquote en tutor (callout pedagógico)', () => {
    const md = '> Piensa en el cache como en una alacena: lo que más usas, al frente.'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'tutor' },
    )
    expect(container.querySelector('blockquote')).toMatchSnapshot()
  })

  it('snapshot del blockquote en professional (nota técnica)', () => {
    const md = '> Cache LRU con TTL de 5 minutos para evitar thundering herd.'
    const { container } = renderWithMode(
      <MarkdownRenderer content={md} />,
      { mode: 'professional' },
    )
    expect(container.querySelector('blockquote')).toMatchSnapshot()
  })
})

/* ================================================================
   F9-T4: renderer diferenciado por modo
================================================================ */
import { screen } from '@testing-library/react'
import { renderWithMode as renderWM } from '../../test/renderWithMode'
import MarkdownRendererF9 from './MarkdownRenderer'

describe('MarkdownRenderer — F9-T4 (diferenciación por modo)', () => {

  it('blockquote en tutor inyecta el icono de callout pedagógico', () => {
    renderWM(
      <MarkdownRendererF9 content={'> Pista importante'} />,
      { mode: 'tutor' },
    )
    expect(screen.getByTestId('callout-icon')).toBeInTheDocument()
  })

  it('blockquote en professional NO inyecta el icono de callout', () => {
    renderWM(
      <MarkdownRendererF9 content={'> Nota técnica'} />,
      { mode: 'professional' },
    )
    expect(screen.queryByTestId('callout-icon')).toBeNull()
  })

  it('párrafo terminado en "?" en tutor se marca como socrático', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'¿Qué cambiarías de este diseño?'} />,
      { mode: 'tutor' },
    )
    const p = container.querySelector('p[data-socratic="true"]')
    expect(p).toBeInTheDocument()
    expect(p.className).toMatch(/font-semibold/)
  })

  it('párrafo terminado en "?" en professional NO se marca como socrático', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'¿Qué cambiarías de este diseño?'} />,
      { mode: 'professional' },
    )
    expect(container.querySelector('p[data-socratic="true"]')).toBeNull()
  })

  it('párrafo sin "?" no se marca como socrático aunque sea tutor', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'Aquí va una explicación normal.'} />,
      { mode: 'tutor' },
    )
    expect(container.querySelector('p[data-socratic="true"]')).toBeNull()
  })

  it('enlace glossary en tutor se renderiza como span con tooltip y data-glossary', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'[Caching](glossary:Caching) es clave.'} />,
      { mode: 'tutor' },
    )
    const term = container.querySelector('[data-glossary="Caching"]')
    expect(term).toBeInTheDocument()
    expect(term.tagName).toBe('SPAN')
    expect(term).toHaveAttribute('tabIndex', '0')
    expect(term.getAttribute('aria-label')).toMatch(/Glosario: Caching/)
  })

  it('enlace glossary en professional se neutraliza a span SIN tooltip', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'[SOLID](glossary:SOLID) ayuda.'} />,
      { mode: 'professional' },
    )
    const term = container.querySelector('[data-glossary="SOLID"]')
    expect(term).toBeInTheDocument()
    expect(term.tagName).toBe('SPAN')
    // No tabIndex porque no es interactivo
    expect(term.getAttribute('tabIndex')).toBeNull()
  })

  it('enlaces NO glossary se renderizan como <a> normal en ambos modos', () => {
    const { container } = renderWM(
      <MarkdownRendererF9 content={'[Docs](https://example.com)'} />,
      { mode: 'tutor' },
    )
    const a = container.querySelector('a[href="https://example.com"]')
    expect(a).toBeInTheDocument()
    expect(a).toHaveAttribute('target', '_blank')
  })
})
