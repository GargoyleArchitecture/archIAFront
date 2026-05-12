/**
 * Tests F9-T3: RoutineProgressBar
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoutineProgressBar, { STEPS } from './RoutineProgressBar'

describe('RoutineProgressBar', () => {
  it('renderiza 4 segmentos con los labels canónicos', () => {
    render(<RoutineProgressBar />)
    expect(STEPS).toHaveLength(4)
    for (const step of STEPS) {
      expect(screen.getByTestId(`step-label-${step.key}`)).toBeInTheDocument()
    }
  })

  it('el segmento del step actual recibe aria-current="step"', () => {
    const { container } = render(<RoutineProgressBar currentStep="attempt" />)
    const current = container.querySelector('[aria-current="step"]')
    expect(current).toBeInTheDocument()
    expect(current.getAttribute('data-step')).toBe('attempt')
  })

  it('aplica data-state correcto a cada segmento', () => {
    const { container } = render(
      <RoutineProgressBar
        currentStep="feedback"
        completedSteps={['description', 'attempt']}
      />,
    )
    expect(container.querySelector('[data-step="description"]').getAttribute('data-state'))
      .toBe('completed')
    expect(container.querySelector('[data-step="attempt"]').getAttribute('data-state'))
      .toBe('completed')
    expect(container.querySelector('[data-step="feedback"]').getAttribute('data-state'))
      .toBe('current')
    expect(container.querySelector('[data-step="recap"]').getAttribute('data-state'))
      .toBe('pending')
  })

  it('expone aria-progressbar con valuenow/valuemax correctos', () => {
    render(
      <RoutineProgressBar
        currentStep="feedback"
        completedSteps={['description', 'attempt']}
      />,
    )
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuemax', '4')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    // 2 completados + step actual no estaba en completedSet → +1 = 3
    expect(bar).toHaveAttribute('aria-valuenow', '3')
  })

  it('el label del step actual se resalta (font-weight 600)', () => {
    render(<RoutineProgressBar currentStep="recap" />)
    const label = screen.getByTestId('step-label-recap')
    expect(label.style.fontWeight).toBe('600')
  })

  it('cae al primer step si currentStep es inválido', () => {
    const { container } = render(<RoutineProgressBar currentStep="weird" />)
    const current = container.querySelector('[aria-current="step"]')
    expect(current.getAttribute('data-step')).toBe('description')
  })

  it('acepta completedSteps no-array como vacío (defensivo)', () => {
    const { container } = render(
      <RoutineProgressBar currentStep="attempt" completedSteps={null} />,
    )
    // No crashea y el step actual sigue marcado
    expect(container.querySelector('[aria-current="step"]')).toBeInTheDocument()
  })
})
