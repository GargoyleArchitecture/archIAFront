/**
 * ChatHomePanel — Panel principal de chat dentro de AppLayout.
 *
 * Renderiza el top bar, el contenedor de mensajes y el MessageInput.
 * Lee el estado de chat desde el outlet context provisto por `AppLayout`.
 *
 * También consume `location.state` para abrir un chat específico cuando el
 * usuario llega desde otro panel (p.ej. ProjectDetailView pasa { chatId,
 * projectId } al navegar a "/").
 *
 * F12-T9 (2026-05-14): el overlay `ChallengeBlock` se retiró de este panel.
 * Tras generar un reto, `WeaknessActionCard` navega a `/routines/:id` (vista
 * dedicada con el ciclo pedagógico completo). El handover por
 * `location.state.pendingRoutine` ya no se usa.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import { useMode } from '../../contexts/ModeContext'

import SmartToyIcon from '@mui/icons-material/SmartToy'
import FolderIcon   from '@mui/icons-material/Folder'
import GridViewIcon from '@mui/icons-material/GridView'
import SettingsIcon from '@mui/icons-material/Settings'

import TextAtom               from '../atoms/TextAtom'
import BoxAtom                from '../atoms/BoxAtom'
import ButtonAtom             from '../atoms/ButtonAtom'
import LabelAtom              from '../atoms/LabelAtom'
import TooltipAtom            from '../atoms/TooltipAtom'
import ModeSuggestionChipAtom from '../atoms/ModeSuggestionChipAtom'
import Chips          from '../molecules/Chips'
import Modal          from '../molecules/Modal'
import BubbleMessage  from '../molecules/BubbleMessage'
import ChatContainer  from '../molecules/ChatContainer'
import MessageInput   from '../molecules/MessageInput'
import ModeToggleHint from '../molecules/ModeToggleHint'
import MarkdownRenderer from '../organisms/MarkdownRenderer'

import CloseIcon from '@mui/icons-material/Close'

/* ─────────────────────────────────────────────────────────────
   Avatar IA reutilizado
───────────────────────────────────────────────────────────── */
const AVATAR_AI = (
  <div className="w-full h-full bg-brand-600 flex items-center justify-center">
    <SmartToyIcon style={{ fontSize: 14, color: 'white' }} />
  </div>
)

/* ─────────────────────────────────────────────────────────────
   Tag input (idéntico al de MainView original) — usado solo en
   el modal de Project Context.
───────────────────────────────────────────────────────────── */
function TagInput({ tags, onChange, placeholder }) {
  const [inputVal, setInputVal] = useState('')

  const addTag = (raw) => {
    const val = raw.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInputVal('')
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inputVal) }
    else if (e.key === 'Backspace' && !inputVal && tags.length > 0) onChange(tags.slice(0, -1))
  }
  const handleBlur = () => { if (inputVal.trim()) addTag(inputVal) }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-400">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-md text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="hover:text-brand-900 leading-none"
          >
            <CloseIcon style={{ fontSize: 12 }} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ChatHomePanel
───────────────────────────────────────────────────────────── */
export default function ChatHomePanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const ctx = useOutletContext()
  const { mode, setMode } = useMode()

  const {
    features,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    activeSession,
    messages,
    isBusy,
    send,
    pendingChatId,
    setPendingChatId,
    getContext,
    saveContext,
  } = ctx

  const messagesEndRef = useRef(null)

  /* ── Project context modal (vive aquí porque se dispara desde el top bar) ── */
  const [showProjectContext, setShowProjectContext] = useState(false)
  const [ctxProjectId, setCtxProjectId] = useState(null)
  const [ctxTechStack, setCtxTechStack] = useState([])
  const [ctxRules, setCtxRules]         = useState('')
  const [ctxLoading, setCtxLoading]     = useState(false)
  const [ctxSaving, setCtxSaving]       = useState(false)
  const [ctxError, setCtxError]         = useState(null)

  /* ── Consume location.state al montar (handover desde otros paneles) ── */
  useEffect(() => {
    const { chatId, projectId } = location.state || {}
    if (chatId && projectId) {
      setPendingChatId(chatId)
      setActiveProjectId(projectId)
      navigate('/', { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ── Project context modal handlers ── */
  const openProjectContext = async (projId, e) => {
    e?.stopPropagation()
    setCtxProjectId(projId)
    setCtxTechStack([])
    setCtxRules('')
    setCtxError(null)
    setShowProjectContext(true)
    setCtxLoading(true)
    try {
      const c = await getContext(projId)
      setCtxTechStack(Array.isArray(c?.techStack) ? c.techStack : [])
      setCtxRules(c?.businessRules ?? '')
    } catch (err) {
      if (!err.message?.includes('404')) setCtxError(err.message)
    } finally {
      setCtxLoading(false)
    }
  }

  const handleSaveContext = async () => {
    setCtxSaving(true)
    setCtxError(null)
    try {
      await saveContext(ctxProjectId, {
        techStack: ctxTechStack,
        businessRules: ctxRules.trim() || undefined,
      })
      setShowProjectContext(false)
    } catch (err) {
      setCtxError(err.message)
    } finally {
      setCtxSaving(false)
    }
  }

  return (
    <>
      {/* ── Top Bar ── */}
      {activeProjectId && (
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white flex-shrink-0">
          <TextAtom variant="text-sm" weight="semibold" className="text-gray-800">
            {activeSession?.title ?? activeProject?.name ?? 'Chat'}
          </TextAtom>
          {activeProject && (
            <div className="flex items-center gap-2">
              <Chips label={activeProject.name} variant="brand" size="sm" />
              <TooltipAtom content="Project context" position="bottom">
                <ButtonAtom
                  variant="icon" intent="ghost" size="xs"
                  onClick={(e) => openProjectContext(activeProject.id, e)}
                  className="text-gray-400 border-transparent hover:text-brand-600"
                >
                  <SettingsIcon style={{ fontSize: 16 }} />
                </ButtonAtom>
              </TooltipAtom>
              <TooltipAtom content="Project details" position="bottom">
                <ButtonAtom
                  variant="icon" intent="ghost" size="xs"
                  onClick={() => navigate(`/projects/${activeProject.id}`)}
                  className="text-gray-400 border-transparent hover:text-brand-600"
                >
                  <FolderIcon style={{ fontSize: 16 }} />
                </ButtonAtom>
              </TooltipAtom>
            </div>
          )}
        </div>
      )}

      {/* ── Chat Content ── */}
      {activeProjectId ? (
        <ChatContainer className="flex-1">
          {messages.map((msg) =>
            msg.sender === 'usuario' ? (
              <BubbleMessage key={msg.id} variant="user">
                {msg.text}
              </BubbleMessage>
            ) : (
              <div key={msg.id} className="flex flex-col items-start gap-2">
                <BubbleMessage
                  variant="ai"
                  isLoading={msg.pending}
                  avatar={AVATAR_AI}
                  noTextWrap
                >
                  <MarkdownRenderer content={msg.text} />
                </BubbleMessage>
                {!msg.pending
                  && msg.modeSuggestion
                  && msg.modeSuggestion !== mode
                  && (
                    <ModeSuggestionChipAtom
                      suggestedMode={msg.modeSuggestion}
                      onClick={() => setMode(msg.modeSuggestion)}
                    />
                  )
                }
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </ChatContainer>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-brand-200 [&_svg]:w-16 [&_svg]:h-16">
            <GridViewIcon style={{ fontSize: 64 }} />
          </span>
          <TextAtom variant="display-xs" weight="semibold" className="text-gray-700">
            Select a chat to start
          </TextAtom>
          <TextAtom variant="text-sm" className="text-gray-400">
            Choose a recent conversation or open a project
          </TextAtom>
          <ButtonAtom
            intent="primary"
            variant="text-icon"
            icon={<FolderIcon />}
            onClick={() => navigate('/projects')}
          >
            Browse Projects
          </ButtonAtom>
        </div>
      )}

      {/* ── Message Input ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-200 bg-white">
        <MessageInput
          onSend={send}
          placeholder={
            activeProjectId
              ? `Chat with ${activeProject?.name ?? 'project'}…`
              : 'Select a project to start chatting…'
          }
          disabled={isBusy || !activeProjectId}
          footerSlot={<ModeToggleHint hint="Enter to send · Shift+Enter for new line" />}
        />
      </div>

      {/* ── Project Context Modal ── */}
      <Modal
        isOpen={showProjectContext}
        onClose={() => setShowProjectContext(false)}
        title="Project Context"
        size="md"
        footer={
          <>
            <ButtonAtom intent="ghost" onClick={() => setShowProjectContext(false)}>
              Cancel
            </ButtonAtom>
            <ButtonAtom intent="primary" onClick={handleSaveContext} disabled={ctxSaving || ctxLoading}>
              {ctxSaving ? 'Saving…' : 'Save context'}
            </ButtonAtom>
          </>
        }
      >
        {ctxLoading ? (
          <TextAtom variant="text-sm" className="text-gray-500">Loading context…</TextAtom>
        ) : (
          <div className="flex flex-col gap-5">
            <TextAtom variant="text-sm" className="text-gray-500">
              This context is sent automatically to the AI assistant with every message in this project.
            </TextAtom>
            <div className="flex flex-col gap-1.5">
              <LabelAtom>Tech Stack</LabelAtom>
              <TagInput
                tags={ctxTechStack}
                onChange={setCtxTechStack}
                placeholder="Python, FastAPI, PostgreSQL…"
              />
              <TextAtom variant="text-xs" className="text-gray-400">
                Press Enter or comma to add a technology
              </TextAtom>
            </div>
            <div className="flex flex-col gap-1.5">
              <LabelAtom htmlFor="ctx-rules">Business Rules</LabelAtom>
              <textarea
                id="ctx-rules"
                rows={4}
                placeholder="E.g. Multi-tenant SaaS. All data access must be tenant-scoped…"
                value={ctxRules}
                onChange={(e) => setCtxRules(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
            {ctxError && (
              <BoxAtom bg="error-50" border="error-300" rounded="md" p="3">
                <TextAtom variant="text-sm" className="text-error-600">{ctxError}</TextAtom>
              </BoxAtom>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
