/**
 * Tests F8-T3: StrengthChip
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StrengthChip from './StrengthChip'

describe('StrengthChip', () => {
  it('renderiza nombre y aria-label', () => {
    render(<StrengthChip name="SOLID" />)
    const chip = screen.getByRole('status')
    expect(chip).toHaveTextContent('SOLID')
    expect(chip).toHaveAttribute('aria-label', 'Fortaleza SOLID')
  })

  it('muestra microtexto "vigente desde dd/mm" cuando hay lastSeenAt', () => {
    render(<StrengthChip name="Caching" lastSeenAt="2026-05-01T12:00:00Z" />)
    const date = screen.getByTestId('strength-chip-date')
    expect(date).toHaveTextContent(/vigente desde \d{2}\/\d{2}/)
  })

  it('NO muestra el microtexto si lastSeenAt está ausente', () => {
    render(<StrengthChip name="Patterns" />)
    expect(screen.queryByTestId('strength-chip-date')).toBeNull()
  })

  it('aplica opacidad reducida con variante intensity y mastery baja', () => {
    render(<StrengthChip name="A" mastery={0.0} intensity />)
    const chip = screen.getByRole('status')
    // mastery=0 → 0.45 (mínimo para WCAG AA)
    expect(parseFloat(chip.style.opacity)).toBeCloseTo(0.45, 2)
  })

  it('aplica opacidad 1.0 sin intensity, sin importar el mastery', () => {
    render(<StrengthChip name="A" mastery={0.1} />)
    expect(parseFloat(screen.getByRole('status').style.opacity)).toBeCloseTo(1, 2)
  })

  it('muestra tooltip en hover con mastery formateado', () => {
    render(<StrengthChip name="SOLID" mastery={0.85} lastSeenAt="2026-05-01T12:00:00Z" />)
    // El wrapper del tooltip envuelve al chip
    const chip = screen.getByRole('status')
    fireEvent.mouseEnter(chip.parentElement)
    // TooltipAtom marca el portal con aria-hidden="true" (es decorativo;
    // el aria-label del chip ya describe el estado). Por eso buscamos
    // con { hidden: true }.
    const tooltip = screen.getByRole('tooltip', { hidden: true })
    expect(tooltip).toHaveTextContent('SOLID')
    expect(tooltip).toHaveTextContent('85 %')
  })

  it('retorna null si name está vacío o no es string', () => {
    const { container, rerender } = render(<StrengthChip name="" />)
    expect(container.firstChild).toBeNull()
    rerender(<StrengthChip name={null} />)
    expect(container.firstChild).toBeNull()
  })
})
