/**
 * Tests F12-T8: SolutionPanel
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolutionPanel from './SolutionPanel'
import { ModeProvider } from '../../contexts/ModeContext'

const SOLUTION = '## Solución\n\nUsá `OrderedDict` para mantener O(1) en get/put.'

function renderWithMode(ui) {
  return render(<ModeProvider>{ui}</ModeProvider>)
}

describe('SolutionPanel', () => {
  it('por defecto el contenido está colapsado', () => {
    renderWithMode(<SolutionPanel solution={SOLUTION} />)
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument()
    expect(screen.getByTestId('solution-toggle')).toBeInTheDocument()
    expect(screen.queryByTestId('solution-body')).toBeNull()
  })

  it('expande al click en el toggle', async () => {
    renderWithMode(<SolutionPanel solution={SOLUTION} />)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('solution-toggle'))
    expect(screen.getByTestId('solution-body')).toBeInTheDocument()
    // Markdown header se renderiza:
    expect(screen.getByText('Solución')).toBeInTheDocument()
  })

  it('retorna null si solution está vacío', () => {
    const { container } = renderWithMode(<SolutionPanel solution="" />)
    expect(container.firstChild).toBeNull()
    const { container: c2 } = renderWithMode(<SolutionPanel solution={null} />)
    expect(c2.firstChild).toBeNull()
  })

  it('defaultOpen=true arranca expandido', () => {
    renderWithMode(<SolutionPanel solution={SOLUTION} defaultOpen />)
    expect(screen.getByTestId('solution-body')).toBeInTheDocument()
  })
})
