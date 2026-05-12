/**
 * Tests F6-T2: ModeSwitcher (Segmented Button MD3 + a11y radiogroup)
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModeSwitcher from './ModeSwitcher'
import { renderWithMode } from '../../test/renderWithMode'

describe('ModeSwitcher', () => {
  it('expone un radiogroup con dos radios (tutor / professional)', () => {
    renderWithMode(<ModeSwitcher />, { mode: 'professional' })
    const group = screen.getByRole('radiogroup', { name: /modo de interacción/i })
    expect(group).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('marca aria-checked correctamente según el modo activo', () => {
    renderWithMode(<ModeSwitcher />, { mode: 'tutor' })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')   // tutor
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')  // professional
  })

  it('roving tabindex: solo el seleccionado tiene tabindex=0', () => {
    renderWithMode(<ModeSwitcher />, { mode: 'professional' })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('tabindex', '-1')
    expect(radios[1]).toHaveAttribute('tabindex', '0')
  })

  it('cambia el modo al hacer click en una opción', async () => {
    const user = userEvent.setup()
    renderWithMode(<ModeSwitcher />, { mode: 'professional' })
    const radios = screen.getAllByRole('radio')

    await user.click(radios[0]) // click en Tutor

    // Después del click, el primero queda checked
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('navega con flecha derecha de tutor a professional', async () => {
    const user = userEvent.setup()
    renderWithMode(<ModeSwitcher />, { mode: 'tutor' })
    const radios = screen.getAllByRole('radio')

    radios[0].focus()
    await user.keyboard('{ArrowRight}')

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
  })

  it('Home y End van al primer y último radio', async () => {
    const user = userEvent.setup()
    renderWithMode(<ModeSwitcher />, { mode: 'professional' })
    const radios = screen.getAllByRole('radio')

    radios[1].focus()
    await user.keyboard('{Home}')
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('{End}')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
  })
})
