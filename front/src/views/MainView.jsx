import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useUserPreference } from '../hooks/useUserPreference'
import { useChatManager } from '../hooks/useChatManager'
import { listChats, deleteChat } from '../services/chatService'

import SmartToyIcon          from '@mui/icons-material/SmartToy'
import AddIcon               from '@mui/icons-material/Add'
import MenuIcon              from '@mui/icons-material/Menu'
import MenuOpenIcon          from '@mui/icons-material/MenuOpen'
import FolderIcon            from '@mui/icons-material/Folder'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import LogoutIcon            from '@mui/icons-material/Logout'
import GridViewIcon          from '@mui/icons-material/GridView'
import SettingsIcon          from '@mui/icons-material/Settings'
import TuneIcon              from '@mui/icons-material/Tune'
import CloseIcon             from '@mui/icons-material/Close'
import ChevronRightIcon      from '@mui/icons-material/ChevronRight'

import TextAtom         from '../components/atoms/TextAtom'
import BoxAtom          from '../components/atoms/BoxAtom'
import ButtonAtom       from '../components/atoms/ButtonAtom'
import TooltipAtom      from '../components/atoms/TooltipAtom'
import LabelAtom        from '../components/atoms/LabelAtom'
import BubbleMessage    from '../components/molecules/BubbleMessage'
import ChatContainer    from '../components/molecules/ChatContainer'
import MessageInput     from '../components/molecules/MessageInput'
import Chips            from '../components/molecules/Chips'
import Modal            from '../components/molecules/Modal'
import ConfirmModal     from '../components/molecules/ConfirmModal'
import Form             from '../components/molecules/Form'
import InputForm        from '../components/molecules/InputForm'
import MarkdownRenderer from '../components/organisms/MarkdownRenderer'

/* ─────────────────────────────────────────────────────────────
   Constantes de dominio
───────────────────────────────────────────────────────────── */
const EXPLANATION_STYLES = [
  { value: 'FORMAL',  label: 'Formal',  desc: 'Terminología técnica precisa' },
  { value: 'ANALOGY', label: 'Analogy', desc: 'Comparaciones con el mundo real' },
  { value: 'CONCISE', label: 'Concise', desc: 'Respuestas cortas y directas' },
]

const VERBOSITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    desc: 'Solo puntos clave' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Detalle equilibrado' },
  { value: 'HIGH',   label: 'High',   desc: 'Explicación completa' },
]

const AVATAR_AI = (
  <div className="w-full h-full bg-brand-600 flex items-center justify-center">
    <SmartToyIcon style={{ fontSize: 14, color: 'white' }} />
  </div>
)

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const timeAgo = (ts) => {
  if (!ts) return ''
  const diff  = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days  = Math.floor(hours / 24)
  if (days < 7)   return `${days}d`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ─────────────────────────────────────────────────────────────
   Componente de selección por botones (radio-group visual)
───────────────────────────────────────────────────────────── */
function OptionGroup({ options, value, onChange, label }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <LabelAtom className="text-gray-700 font-medium">{label}</LabelAtom>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <TooltipAtom key={opt.value} content={opt.desc} position="top">
              <button
                type="button"
                onClick={() => onChange(opt.value)}
                className={[
                  'px-3 py-1.5 rounded-md border text-sm font-medium transition-all',
                  isSelected
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-600',
                ].join(' ')}
              >
                {opt.label}
              </button>
            </TooltipAtom>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tag input para tech stack
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
   Vista principal
───────────────────────────────────────────────────────────── */
export default function MainView() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user: authUser, logout } = useAuth()
  const user = authUser || { name: 'User', email: 'user@example.com', id: null }

  const { projects, load: loadProjects, getContext, saveContext } = useProjects()
  const { preference, load: loadPreference, save: savePreference } = useUserPreference(user?.id)

  /* ── UI state ── */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeProjectId, setActiveProjectId]       = useState(null)
  const [pendingChatId, setPendingChatId]           = useState(null)
  const messagesEndRef = useRef(null)

  /* ── Recent chats (sidebar) ── */
  const [recentChats, setRecentChats]               = useState([])
  const [recentChatsLoading, setRecentChatsLoading] = useState(false)
  const [confirmDeleteChat, setConfirmDeleteChat]   = useState(null)

  /* ── Chat hook ── */
  const {
    sessions,
    sessionId,
    messages,
    isBusy,
    send,
    createSession,
    deleteSession,
    setSessionId,
  } = useChatManager({ projectId: activeProjectId })

  /* ── Modal state ── */
  const [showProjectContext, setShowProjectContext] = useState(false)
  const [showPreferences, setShowPreferences]       = useState(false)

  /* ── Project context form ── */
  const [ctxProjectId, setCtxProjectId] = useState(null)
  const [ctxTechStack, setCtxTechStack] = useState([])
  const [ctxRules, setCtxRules]         = useState('')
  const [ctxLoading, setCtxLoading]     = useState(false)
  const [ctxSaving, setCtxSaving]       = useState(false)
  const [ctxError, setCtxError]         = useState(null)

  /* ── Preferences form ── */
  const [prefStyle, setPrefStyle]         = useState(null)
  const [prefVerbosity, setPrefVerbosity] = useState(null)
  const [prefSaving, setPrefSaving]       = useState(false)
  const [prefError, setPrefError]         = useState(null)

  /* ── Bootstrap ── */
  useEffect(() => {
    loadProjects()
    loadPreference()
  }, [loadProjects, loadPreference])

  /* ── Sync preference form when data loads ── */
  useEffect(() => {
    setPrefStyle(preference.explanationStyle)
    setPrefVerbosity(preference.verbosity)
  }, [preference])

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ── Load recent chats ── */
  const loadRecentChats = useCallback(async () => {
    setRecentChatsLoading(true)
    try {
      const list = await listChats({ limit: 50 })
      setRecentChats(
        [...list].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        )
      )
    } catch {}
    setRecentChatsLoading(false)
  }, [])

  useEffect(() => { loadRecentChats() }, [loadRecentChats])

  /* Refresh when sessions change (catches new & renamed chats) */
  useEffect(() => {
    if (sessions.length > 0) loadRecentChats()
  }, [sessions, loadRecentChats])

  /* ── Handle navigation state from ProjectDetailView ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const { chatId, projectId } = location.state || {}
    if (chatId && projectId) {
      setPendingChatId(chatId)
      setActiveProjectId(projectId)
      navigate('/', { replace: true, state: {} })
    }
  }, []) // intentionally on mount only

  /* ── Consume pendingChatId once sessions load for the new project ── */
  useEffect(() => {
    if (!pendingChatId || sessions.length === 0) return
    const found = sessions.find((s) => s.id === pendingChatId)
    if (found) {
      setSessionId(found.id)
      setPendingChatId(null)
    }
  }, [sessions, pendingChatId, setSessionId])

  /* ─────────────────────────────────────────────────────────
     Chat helpers
  ───────────────────────────────────────────────────────── */
  const handleNewChat = () => {
    if (activeProjectId) createSession()
    else navigate('/projects')
  }

  const handleOpenChat = (chat) => {
    if (chat.projectId === activeProjectId) {
      setSessionId(chat.id)
    } else {
      setPendingChatId(chat.id)
      setActiveProjectId(chat.projectId)
    }
  }

  const handleDeleteRecentChat = (e, chat) => {
    e.stopPropagation()
    setConfirmDeleteChat(chat)
  }

  const executeDeleteRecentChat = async () => {
    const chat = confirmDeleteChat
    if (!chat) return
    setConfirmDeleteChat(null)
    if (chat.projectId === activeProjectId) {
      deleteSession(chat.id)
    } else {
      try { await deleteChat(chat.id) } catch {}
    }
    setRecentChats((prev) => prev.filter((c) => c.id !== chat.id))
  }

  /* ─────────────────────────────────────────────────────────
     Modal: contexto de proyecto
  ───────────────────────────────────────────────────────── */
  const openProjectContext = async (projId, e) => {
    e?.stopPropagation()
    setCtxProjectId(projId)
    setCtxTechStack([])
    setCtxRules('')
    setCtxError(null)
    setShowProjectContext(true)
    setCtxLoading(true)
    try {
      const ctx = await getContext(projId)
      setCtxTechStack(Array.isArray(ctx?.techStack) ? ctx.techStack : [])
      setCtxRules(ctx?.businessRules ?? '')
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

  /* ─────────────────────────────────────────────────────────
     Modal: preferencias de usuario
  ───────────────────────────────────────────────────────── */
  const openPreferences = () => {
    setPrefStyle(preference.explanationStyle)
    setPrefVerbosity(preference.verbosity)
    setPrefError(null)
    setShowPreferences(true)
  }

  const handleSavePreferences = async () => {
    setPrefSaving(true)
    setPrefError(null)
    try {
      await savePreference({ explanationStyle: prefStyle, verbosity: prefVerbosity })
      setShowPreferences(false)
    } catch (err) {
      setPrefError(err.message)
    } finally {
      setPrefSaving(false)
    }
  }

  /* ─────────────────────────────────────────────────────────
     Logout
  ───────────────────────────────────────────────────────── */
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeSession = sessions.find((s) => s.id === sessionId)

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <BoxAtom display="flex" h="screen" className="overflow-hidden">

      {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside
        className={[
          'h-screen flex flex-col bg-brand-900 overflow-x-hidden flex-shrink-0',
          'transition-[width] duration-200 ease-in-out',
          'border-r border-brand-800',
          isSidebarCollapsed ? 'w-14' : 'w-64',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="h-16 flex items-center border-b border-brand-800 flex-shrink-0 px-4">
          {!isSidebarCollapsed ? (
            <>
              <TextAtom variant="text-lg" weight="bold" family="serif" className="text-white flex-1">
                ArchIA
              </TextAtom>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
              >
                <MenuOpenIcon style={{ fontSize: 20 }} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-10 h-10 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors mx-auto"
            >
              <MenuIcon style={{ fontSize: 20 }} />
            </button>
          )}
        </div>

        {/* ── New Chat ── */}
        <div className={isSidebarCollapsed ? 'py-2 flex items-center justify-center flex-shrink-0' : 'px-3 py-2 flex-shrink-0'}>
          {!isSidebarCollapsed ? (
            <ButtonAtom
              variant="text-icon" intent="secondary" size="sm"
              icon={<AddIcon />}
              onClick={handleNewChat}
              className="w-full justify-center bg-brand-800 text-brand-50 border-brand-700 hover:bg-brand-700 hover:border-brand-600"
            >
              New Chat
            </ButtonAtom>
          ) : (
            <TooltipAtom content="New Chat" position="right">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-10 h-10 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
              >
                <AddIcon style={{ fontSize: 20 }} />
              </button>
            </TooltipAtom>
          )}
        </div>

        {/* ── Projects nav link ── */}
        <div className={isSidebarCollapsed ? 'pb-2 flex items-center justify-center flex-shrink-0' : 'px-3 pb-2 flex-shrink-0'}>
          {!isSidebarCollapsed ? (
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-md text-brand-200 hover:bg-brand-800 hover:text-brand-50 transition-colors"
            >
              <FolderIcon style={{ fontSize: 18 }} />
              <span className="flex-1 text-left text-sm font-medium">Projects</span>
              <ChevronRightIcon style={{ fontSize: 16 }} className="text-brand-500" />
            </button>
          ) : (
            <TooltipAtom content="Projects" position="right">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="w-10 h-10 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
              >
                <FolderIcon style={{ fontSize: 20 }} />
              </button>
            </TooltipAtom>
          )}
        </div>

        {/* ── Divider ── */}
        {!isSidebarCollapsed && (
          <div className="mx-3 mb-1 border-t border-brand-800 flex-shrink-0" />
        )}

        {/* ── Recent Chats ── */}
        <nav className="flex-1 overflow-y-auto min-h-0">
          {!isSidebarCollapsed && (
            <div className="px-4 pt-3 pb-1.5">
              <TextAtom variant="text-xs" weight="semibold" className="text-brand-400 uppercase tracking-wider">
                Recent Chats
              </TextAtom>
            </div>
          )}

          {recentChatsLoading && !isSidebarCollapsed && (
            <div className="px-4 py-2">
              <TextAtom variant="text-xs" className="text-brand-600">Loading…</TextAtom>
            </div>
          )}

          {recentChats.map((chat) => {
            const isActive    = chat.id === sessionId
            const projectName = projects.find((p) => p.id === chat.projectId)?.name

            return !isSidebarCollapsed ? (
              /* Expanded: title + project + time + hover-delete */
              <div key={chat.id} className="group relative">
                <button
                  type="button"
                  onClick={() => handleOpenChat(chat)}
                  className={[
                    'w-full pl-3 pr-8 py-2 flex items-start gap-2.5 text-left transition-colors',
                    isActive
                      ? 'bg-brand-800 text-brand-50'
                      : 'text-brand-200 hover:bg-brand-800/60 hover:text-brand-50',
                  ].join(' ')}
                >
                  <ChatBubbleOutlineIcon
                    style={{ fontSize: 15 }}
                    className="mt-0.5 flex-shrink-0 text-brand-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-snug">
                      {chat.title || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {projectName && (
                        <p className="text-xs text-brand-500 truncate flex-1">{projectName}</p>
                      )}
                      <p className="text-xs text-brand-600 flex-shrink-0">
                        {timeAgo(chat.updatedAt || chat.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
                {/* Delete on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteRecentChat(e, chat)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-brand-500 hover:text-white hover:bg-brand-700 transition-all"
                >
                  <CloseIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            ) : (
              /* Collapsed: icon only */
              <TooltipAtom key={chat.id} content={chat.title || 'Untitled'} position="right">
                <div className="flex items-center justify-center py-0.5">
                  <button
                    type="button"
                    onClick={() => handleOpenChat(chat)}
                    className={[
                      'w-10 h-8 flex items-center justify-center rounded-md transition-colors',
                      isActive
                        ? 'bg-brand-800 text-white'
                        : 'text-brand-500 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    <ChatBubbleOutlineIcon style={{ fontSize: 16 }} />
                  </button>
                </div>
              </TooltipAtom>
            )
          })}

          {!recentChatsLoading && recentChats.length === 0 && !isSidebarCollapsed && (
            <div className="px-4 py-3">
              <TextAtom variant="text-xs" className="text-brand-600 italic">No recent chats</TextAtom>
            </div>
          )}
        </nav>

        {/* ── User Card ── */}
        <div className="mt-auto border-t border-brand-800 px-3 py-3 flex-shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-brand-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <TextAtom variant="text-xs" weight="semibold" as="span" className="text-white">
                  {user.name.charAt(0).toUpperCase()}
                </TextAtom>
              </div>
              <div className="flex-1 min-w-0">
                <TextAtom variant="text-sm" weight="medium" as="div" className="text-brand-50 truncate">
                  {user.name}
                </TextAtom>
                <TextAtom variant="text-xs" as="div" className="text-brand-400 truncate">
                  {user.email}
                </TextAtom>
              </div>
              <div className="flex items-center gap-0.5">
                <TooltipAtom content="Preferences" position="top">
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
                  >
                    <TuneIcon style={{ fontSize: 16 }} />
                  </button>
                </TooltipAtom>
                <TooltipAtom content="Log out" position="top">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
                  >
                    <LogoutIcon style={{ fontSize: 16 }} />
                  </button>
                </TooltipAtom>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <TooltipAtom content={user.name} position="right">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center hover:ring-2 hover:ring-white/20 transition-all"
                >
                  <TextAtom variant="text-xs" weight="semibold" as="span" className="text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </TextAtom>
                </button>
              </TooltipAtom>
              <TooltipAtom content="Log out" position="right">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-white/10 transition-colors"
                >
                  <LogoutIcon style={{ fontSize: 14 }} />
                </button>
              </TooltipAtom>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">

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
                <BubbleMessage
                  key={msg.id}
                  variant="ai"
                  isLoading={msg.pending}
                  avatar={AVATAR_AI}
                  noTextWrap
                >
                  <MarkdownRenderer content={msg.text} />
                </BubbleMessage>
              )
            )}
            <div ref={messagesEndRef} />
          </ChatContainer>
        ) : (
          /* ── Empty State ── */
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
            hint="Enter to send · Shift+Enter for new line"
            disabled={isBusy || !activeProjectId}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL: Contexto del proyecto
      ══════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════
          MODAL: Preferencias del usuario
      ══════════════════════════════════════════════════ */}
      <Modal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        title="Communication Preferences"
        size="sm"
        footer={
          <>
            <ButtonAtom intent="ghost" onClick={() => setShowPreferences(false)}>
              Cancel
            </ButtonAtom>
            <ButtonAtom intent="primary" onClick={handleSavePreferences} disabled={prefSaving}>
              {prefSaving ? 'Saving…' : 'Save preferences'}
            </ButtonAtom>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <TextAtom variant="text-sm" className="text-gray-500">
            These preferences tell the AI assistant how to explain and format its responses for you.
          </TextAtom>

          <OptionGroup
            label="Explanation Style"
            options={EXPLANATION_STYLES}
            value={prefStyle}
            onChange={setPrefStyle}
          />

          <OptionGroup
            label="Verbosity"
            options={VERBOSITY_OPTIONS}
            value={prefVerbosity}
            onChange={setPrefVerbosity}
          />

          {prefError && (
            <BoxAtom bg="error-50" border="error-300" rounded="md" p="3">
              <TextAtom variant="text-sm" className="text-error-600">{prefError}</TextAtom>
            </BoxAtom>
          )}
        </div>
      </Modal>

      {/* ── Confirm: delete recent chat ── */}
      <ConfirmModal
        isOpen={confirmDeleteChat !== null}
        onClose={() => setConfirmDeleteChat(null)}
        onConfirm={executeDeleteRecentChat}
        title="Eliminar chat"
        message="¿Estás seguro de que quieres eliminar este chat? Todos los mensajes también serán eliminados."
      />

    </BoxAtom>
  )
}
