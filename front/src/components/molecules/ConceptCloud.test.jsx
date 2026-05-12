/**
 * Tests F10-T3: ConceptCloud
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConceptCloud from './ConceptCloud'

describe('ConceptCloud', () => {
  it('ordena items por weight DESC', () => {
    render(
      <ConceptCloud
        concepts={[
          { name: 'Low',    weight: 0.1 },
          { name: 'High',   weight: 0.9 },
          { name: 'Medium', weight: 0.5 },
        ]}
      />
    )
    const items = screen.getAllByTestId('cloud-item')
    expect(items[0]).toHaveTextContent('High')
    expect(items[1]).toHaveTextContent('Medium')
    expect(items[2]).toHaveTextContent('Low')
  })

  it('escala font-size linealmente entre minSize y maxSize', () => {
    render(
      <ConceptCloud
        concepts={[
          { name: 'Zero', weight: 0.0 },
          { name: 'One',  weight: 1.0 },
        ]}
        minSize={10}
        maxSize={30}
      />
    )
    const items = screen.getAllByTestId('cloud-item')
    // Tras sort DESC, weight=1.0 va primero
    expect(items[0].style.fontSize).toBe('30px')
    expect(items[1].style.fontSize).toBe('10px')
  })

  it('clamp de weight fuera de [0,1]', () => {
    render(
      <ConceptCloud
        concepts={[
          { name: 'Sub',   weight: -0.5 },
          { name: 'Super', weight: 1.5 },
        ]}
        minSize={12}
        maxSize={20}
      />
    )
    const items = screen.getAllByTestId('cloud-item')
    expect(items[0].style.fontSize).toBe('20px') // 1.5 → clamp a 1
    expect(items[1].style.fontSize).toBe('12px') // -0.5 → clamp a 0
  })

  it('muestra placeholder con array vacío', () => {
    render(<ConceptCloud concepts={[]} />)
    expect(screen.getByText(/No hay conceptos para mostrar/)).toBeInTheDocument()
    expect(screen.queryByTestId('concept-cloud')).toBeNull()
  })

  it('muestra placeholder con concepts no-array', () => {
    render(<ConceptCloud concepts={null} />)
    expect(screen.getByText(/No hay conceptos para mostrar/)).toBeInTheDocument()
  })

  it('filtra entradas sin name válido', () => {
    render(
      <ConceptCloud
        concepts={[
          { name: 'OK',    weight: 0.5 },
          { name: '',      weight: 0.5 },
          { name: '   ',   weight: 0.5 },
          { weight: 0.5 },
          { name: null,    weight: 0.5 },
        ]}
      />
    )
    const items = screen.getAllByTestId('cloud-item')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('OK')
  })
})
