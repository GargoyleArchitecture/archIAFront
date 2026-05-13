/**
 * Tests Iter. 6: SwitchAtom
 * Cobertura: render base, estado checked, onChange, disabled, labels, a11y.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SwitchAtom from './SwitchAtom'

describe('SwitchAtom', () => {
  it('renderiza un input type=checkbox con role=switch', () => {
    render(<SwitchAtom checked={false} onChange={() => {}} aria-label="t" />)
    const input = screen.getByRole('switch')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  it('respeta el prop checked', () => {
    const { rerender } = render(
      <SwitchAtom checked={false} onChange={() => {}} aria-label="t" />
    )
    expect(screen.getByRole('switch')).not.toBeChecked()
    rerender(<SwitchAtom checked={true} onChange={() => {}} aria-label="t" />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('dispara onChange al hacer click', () => {
    const onChange = vi.fn()
    render(<SwitchAtom checked={false} onChange={onChange} aria-label="t" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('marca el input como disabled cuando se pasa la prop', () => {
    render(<SwitchAtom checked={false} onChange={() => {}} disabled aria-label="t" />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('muestra leadingLabel y label cuando se proveen', () => {
    render(
      <SwitchAtom
        checked={false}
        onChange={() => {}}
        leadingLabel="Profesional"
        label="Tutor"
      />
    )
    expect(screen.getByText('Profesional')).toBeInTheDocument()
    expect(screen.getByText('Tutor')).toBeInTheDocument()
  })

  it('propaga aria-checked en función de checked', () => {
    const { rerender } = render(
      <SwitchAtom checked={false} onChange={() => {}} aria-label="t" />
    )
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    rerender(<SwitchAtom checked={true} onChange={() => {}} aria-label="t" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})
