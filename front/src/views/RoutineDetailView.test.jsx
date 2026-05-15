/**
 * Tests F12-T8: RoutineDetailView con ciclo completo.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import RoutineDetailView from './RoutineDetailView'
import { ModeProvider } from '../contexts/ModeContext'

vi.mock('../services/routinesService', async () => {
  const actual = await vi.importActual('../services/routinesService')
  return {
    ...actual,
    getRoutine: vi.fn(),
    submitAttempt: vi.fn(),
    evaluateAttempt: vi.fn(),
  }
})

const RUBRIC = [
  { concept: 'LRU',     description: 'Implementa evicción por uso reciente.', weight: 5 },
  { concept: 'Capac.',  description: 'Respeta la capacidad configurada.',    weight: 4 },
  { concept: 'Concur.', description: 'Es seguro bajo concurrencia.',         weight: 3 },
]

const PENDING_ROUTINE = {
  id: 'r-001',
  userId: 'user-x',
  title: 'Reto pendiente',
  targetWeakness: 'Caching',
  expectedConcepts: ['LRU', 'eviction'],
  difficulty: 3,
  challengeMd: '## Reto\n\nImplementá un LRU cache.',
  rubricJson: RUBRIC,
  solutionMd: null,
  attempts: [],
  createdAt: '2026-05-10T10:00:00Z',
}

const EVALUATED_ROUTINE = {
  ...PENDING_ROUTINE,
  id: 'r-002',
  solutionMd: '## Solución\n\n```python\nclass LRUCache: ...\n```',
  attempts: [
    {
      id: 'a-1',
      routineId: 'r-002',
      userId: 'user-x',
      status: 'in_progress',
      score: '72.00',
      feedbackJson: {
        score: 72,
        criteria: [
          { concept: 'LRU', status: 'met', comment: 'OK con OrderedDict.' },
          { concept: 'Capac.', status: 'partial', comment: 'Falta upper bound.' },
          { concept: 'Concur.', status: 'missing', comment: 'No hay locks.' },
        ],
        strengths: ['Decorador limpio'],
        improvements: ['Añadir jitter'],
        socratic_comment: '¿Y si 3 réplicas reintentaran?',
      },
      userResponseText: 'def lru(): ...',
      reflectionJson: null,
      evaluatedAt: '2026-05-12T09:00:00Z',
      completedAt: null,
      createdAt: '2026-05-12T08:00:00Z',
    },
  ],
  createdAt: '2026-05-09T10:00:00Z',
}

function renderDetail({ routineId = 'r-001' } = {}) {
  return render(
    <ModeProvider>
      <MemoryRouter initialEntries={[`/routines/${routineId}`]}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineDetailView />} />
          <Route path="/routines" element={<div data-testid="list-page" />} />
        </Routes>
      </MemoryRouter>
    </ModeProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  try { localStorage.clear() } catch { /* noop */ }
})

afterEach(() => {
  try { localStorage.clear() } catch { /* noop */ }
})

describe('RoutineDetailView — reto pendiente', () => {
  it('renderiza enunciado, rúbrica pendiente y área de trabajo', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(PENDING_ROUTINE)

    renderDetail({ routineId: 'r-001' })
    expect(await screen.findByRole('heading', { name: /Reto pendiente/i })).toBeInTheDocument()
    expect(screen.getByTestId('challenge-md')).toBeInTheDocument()
    expect(screen.getByTestId('rubric-card')).toBeInTheDocument()
    expect(screen.getByTestId('attempt-draft')).toBeInTheDocument()
    // Sin attempts evaluados → no feedback, no solution, no reflection.
    expect(screen.queryByTestId('feedback-panel')).toBeNull()
    expect(screen.queryByTestId('solution-panel')).toBeNull()
    expect(screen.queryByTestId('reflection-form')).toBeNull()
  })

  it('el borrador se persiste en localStorage por routineId', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(PENDING_ROUTINE)
    renderDetail({ routineId: 'r-001' })
    const textarea = await screen.findByTestId('attempt-draft')
    const user = userEvent.setup()
    await user.type(textarea, 'mi intento')
    expect(localStorage.getItem('archia.routines.draft.r-001')).toBe('mi intento')
  })

  it('al enviar, llama a submitAttempt + evaluateAttempt y limpia el borrador', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(PENDING_ROUTINE)
    svc.submitAttempt.mockResolvedValue({ id: 'a-new' })
    svc.evaluateAttempt.mockResolvedValue({ id: 'a-new', feedbackJson: { score: 70 } })

    renderDetail({ routineId: 'r-001' })
    const textarea = await screen.findByTestId('attempt-draft')
    const user = userEvent.setup()
    await user.type(textarea, 'class LRUCache: pass')
    await user.click(screen.getByTestId('submit-attempt'))

    await waitFor(() => {
      expect(svc.submitAttempt).toHaveBeenCalledWith('r-001', { userResponseText: 'class LRUCache: pass' })
      expect(svc.evaluateAttempt).toHaveBeenCalledWith('a-new', { userResponseText: 'class LRUCache: pass' })
    })
    // Borrador queda limpio en storage.
    expect(localStorage.getItem('archia.routines.draft.r-001')).toBeNull()
  })
})

describe('RoutineDetailView — reto con attempt evaluado', () => {
  it('muestra feedback, rúbrica con results, solución colapsada y reflection form', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(EVALUATED_ROUTINE)

    renderDetail({ routineId: 'r-002' })
    expect(await screen.findByTestId('feedback-panel')).toBeInTheDocument()
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument()
    expect(screen.getByTestId('reflection-form')).toBeInTheDocument()
    // Rúbrica con results aplicados
    const rows = screen.getAllByTestId('rubric-criterion')
    const statuses = rows.map((r) => r.getAttribute('data-status')).sort()
    expect(statuses).toEqual(['met', 'missing', 'partial'])
    // Intento en modo readonly (no editable)
    expect(screen.queryByTestId('attempt-draft')).toBeNull()
    expect(screen.getByTestId('attempt-readonly')).toBeInTheDocument()
  })

  it('enviar reflexión llama a evaluateAttempt con reflection', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(EVALUATED_ROUTINE)
    svc.evaluateAttempt.mockResolvedValue({ ...EVALUATED_ROUTINE.attempts[0], status: 'completed' })

    renderDetail({ routineId: 'r-002' })
    const user = userEvent.setup()
    await user.type(await screen.findByTestId('reflection-difficult'), 'aaaaaa')
    await user.type(screen.getByTestId('reflection-different'), 'bbbbbb')
    await user.click(screen.getByTestId('reflection-submit'))

    await waitFor(() => {
      expect(svc.evaluateAttempt).toHaveBeenCalledWith('a-1', {
        reflection: { difficultPart: 'aaaaaa', wouldDoDifferently: 'bbbbbb' },
      })
    })
  })
})

describe('RoutineDetailView — casos defensivos', () => {
  it('cuando getRoutine retorna null, muestra mensaje y botón de retorno', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue(null)
    renderDetail()
    expect(await screen.findByText(/no encontramos este reto/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver al listado/i })).toBeInTheDocument()
  })

  it('reto sin challengeMd muestra banner "Reto legado"', async () => {
    const svc = await import('../services/routinesService')
    svc.getRoutine.mockResolvedValue({ ...PENDING_ROUTINE, challengeMd: null })
    renderDetail()
    expect(await screen.findByTestId('legacy-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('challenge-md')).toBeNull()
    expect(screen.queryByTestId('work-area')).toBeNull()
  })
})
