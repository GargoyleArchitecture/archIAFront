/**
 * Tests F12-T8: ReflectionForm
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReflectionForm from './ReflectionForm'

describe('ReflectionForm', () => {
  it('renderiza ambas preguntas y el botón submit', () => {
    render(<ReflectionForm onSubmit={() => {}} />)
    expect(screen.getByTestId('reflection-difficult')).toBeInTheDocument()
    expect(screen.getByTestId('reflection-different')).toBeInTheDocument()
    expect(screen.getByTestId('reflection-submit')).toBeInTheDocument()
  })

  it('el botón está deshabilitado hasta que ambos campos tengan al menos 5 chars', async () => {
    render(<ReflectionForm onSubmit={() => {}} />)
    const submit = screen.getByTestId('reflection-submit')
    expect(submit).toBeDisabled()

    const user = userEvent.setup()
    await user.type(screen.getByTestId('reflection-difficult'), 'corto')
    expect(submit).toBeDisabled() // segundo aún vacío

    await user.type(screen.getByTestId('reflection-different'), 'también largo enough')
    expect(submit).not.toBeDisabled()
  })

  it('invoca onSubmit con el payload correcto', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ReflectionForm onSubmit={onSubmit} />)
    const user = userEvent.setup()
    await user.type(screen.getByTestId('reflection-difficult'), 'invariante de bucle')
    await user.type(screen.getByTestId('reflection-different'), 'tests antes que código')
    await user.click(screen.getByTestId('reflection-submit'))
    expect(onSubmit).toHaveBeenCalledWith({
      difficultPart: 'invariante de bucle',
      wouldDoDifferently: 'tests antes que código',
    })
  })

  it('muestra el error si onSubmit lanza', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('red caída'))
    render(<ReflectionForm onSubmit={onSubmit} />)
    const user = userEvent.setup()
    await user.type(screen.getByTestId('reflection-difficult'), 'aaaaa')
    await user.type(screen.getByTestId('reflection-different'), 'bbbbb')
    await user.click(screen.getByTestId('reflection-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('red caída')
  })

  it('respeta submitting=true: input y botón quedan deshabilitados', () => {
    render(<ReflectionForm onSubmit={() => {}} submitting />)
    expect(screen.getByTestId('reflection-difficult')).toBeDisabled()
    expect(screen.getByTestId('reflection-different')).toBeDisabled()
    expect(screen.getByTestId('reflection-submit')).toBeDisabled()
  })
})
