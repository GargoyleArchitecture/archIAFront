/**
 * Tests F10-T3: CodeDiffBlock
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeDiffBlock from './CodeDiffBlock'

describe('CodeDiffBlock', () => {
  it('renderiza ambos paneles con labels "Antes" y "Después"', () => {
    render(
      <CodeDiffBlock
        before='cache.get(key)'
        after='cache.get_or_compute(key, fn)'
        language="python"
      />
    )
    expect(screen.getByTestId('code-diff-block')).toBeInTheDocument()
    expect(screen.getByTestId('diff-panel-before')).toBeInTheDocument()
    expect(screen.getByTestId('diff-panel-after')).toBeInTheDocument()
    expect(screen.getByText(/Antes/i)).toBeInTheDocument()
    expect(screen.getByText(/Después/i)).toBeInTheDocument()
  })

  it('renderiza el caption cuando se provee', () => {
    render(
      <CodeDiffBlock before="a" after="b" caption="Refactor de caching naïve" />
    )
    expect(screen.getByText('Refactor de caching naïve')).toBeInTheDocument()
  })

  it('omite un panel si su contenido está vacío', () => {
    render(<CodeDiffBlock before="a" after="" />)
    expect(screen.getByTestId('diff-panel-before')).toBeInTheDocument()
    expect(screen.queryByTestId('diff-panel-after')).toBeNull()
  })

  it('retorna null si before y after están vacíos', () => {
    const { container } = render(<CodeDiffBlock before="" after="" />)
    expect(container.firstChild).toBeNull()
  })

  it('aria-label refleja el caption', () => {
    render(<CodeDiffBlock before="a" after="b" caption="Mi refactor" />)
    const section = screen.getByTestId('code-diff-block')
    expect(section.getAttribute('aria-label')).toMatch(/Mi refactor/)
  })

  it('contenido se renderiza textualmente sin inyección HTML', () => {
    const { container } = render(
      <CodeDiffBlock
        before={'<script>alert(1)</script>'}
        after={'safe()'}
        language="javascript"
      />
    )
    // Aserción de seguridad: ningún <script> real en el DOM. React + el
    // syntax highlighter tokenizan el texto pero nunca lo inyectan como HTML.
    expect(container.querySelector('script')).toBeNull()
    // El panel "Antes" sigue existiendo (los caracteres `<script>` aparecen
    // como tokens textuales escapados, no como un elemento HTML).
    expect(screen.getByTestId('diff-panel-before')).toBeInTheDocument()
  })
})
