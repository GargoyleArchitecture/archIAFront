/**
 * AppLayout — Shell de la aplicación autenticada.
 *
 * Monta la sidebar persistente y un <Outlet> donde se renderizan los paneles
 * de cada ruta (`ChatHomePanel`, `ProjectsView`, `ProjectDetailView`,
 * `ProfileView`). La sidebar y todo el estado de chat sobreviven a la
 * navegación entre rutas — solo el contenido del outlet cambia.
 *
 * El estado de chat (`activeProjectId`, sesiones, mensajes…) y la lista de
 * proyectos vive aquí y se expone a los paneles vía `useOutletContext()`.
 * Cada panel decide qué consumir.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProjects } from '../../hooks/useProjects'
import { useChatManager } from '../../hooks/useChatManager'
import { useFeatures } from '../../contexts/FeaturesContext'
import { listChats, deleteChat } from '../../services/chatService'

import AddIcon               from '@mui/icons-material/Add'
import MenuIcon              from '@mui/icons-material/Menu'
import MenuOpenIcon          from '@mui/icons-material/MenuOpen'
import FolderIcon            from '@mui/icons-material/Folder'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import LogoutIcon            from '@mui/icons-material/Logout'
import TuneIcon              from '@mui/icons-material/Tune'
import CloseIcon             from '@mui/icons-material/Close'
import ChevronRightIcon      from '@mui/icons-material/ChevronRight'

import TextAtom      from '../atoms/TextAtom'
import BoxAtom       from '../atoms/BoxAtom'
import ButtonAtom    from '../atoms/ButtonAtom'
import TooltipAtom   from '../atoms/TooltipAtom'
import ConfirmModal  from '../molecules/ConfirmModal'

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
   AppLayout
───────────────────────────────────────────────────────────── */
export default function AppLayout() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const user = authUser || { name: 'User', email: 'user@example.com', id: null }
  const { features } = useFeatures()

  const { projects, load: loadProjects, getContext, saveContext } = useProjects()

  /* ── UI state ── */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeProjectId, setActiveProjectId]       = useState(null)
  const [pendingChatId, setPendingChatId]           = useState(null)
  const [activeRoutine, setActiveRoutine]           = useState(null)

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

  /* ── Bootstrap ── */
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  /* ── Recent chats ── */
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
    } catch { /* noop */ }
    setRecentChatsLoading(false)
  }, [])

  useEffect(() => { loadRecentChats() }, [loadRecentChats])
  useEffect(() => {
    if (sessions.length > 0) loadRecentChats()
  }, [sessions, loadRecentChats])

  /* ── Consume pendingChatId once sessions load ── */
  useEffect(() => {
    if (!pendingChatId || sessions.length === 0) return
    const found = sessions.find((s) => s.id === pendingChatId)
    if (found) {
      setSessionId(found.id)
      setPendingChatId(null)
    }
  }, [sessions, pendingChatId, setSessionId])

  /* ─────────── Sidebar actions ─────────── */
  // "New Chat" siempre regresa al estado inicial de la app (sin proyecto
  // ni sesión activa). El usuario decide a qué proyecto entrar desde el
  // empty state. Evita crear sesiones colgadas en el último proyecto que
  // se tocó.
  const handleNewChat = () => {
    setActiveProjectId(null)
    setSessionId(null)
    setPendingChatId(null)
    setActiveRoutine(null)
    navigate('/')
  }

  const handleOpenChat = (chat) => {
    if (chat.projectId === activeProjectId) {
      setSessionId(chat.id)
    } else {
      setPendingChatId(chat.id)
      setActiveProjectId(chat.projectId)
    }
    navigate('/')
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
      try { await deleteChat(chat.id) } catch { /* noop */ }
    }
    setRecentChats((prev) => prev.filter((c) => c.id !== chat.id))
  }

  /* ─────────── Logout ─────────── */
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const activeSession = sessions.find((s) => s.id === sessionId)

  /* ─────────── Outlet context para los paneles ─────────── */
  const outletContext = {
    user,
    features,
    // Project state
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    getContext,
    saveContext,
    // Chat state
    sessions,
    sessionId,
    setSessionId,
    messages,
    isBusy,
    send,
    createSession,
    deleteSession,
    activeSession,
    pendingChatId,
    setPendingChatId,
    // Routines
    activeRoutine,
    setActiveRoutine,
  }

  return (
    <BoxAtom display="flex" h="screen" className="overflow-hidden">

      {/* ══════════════════════════════════════════════════ SIDEBAR */}
      <aside
        className={[
          'h-screen flex flex-col bg-brand-900 overflow-x-hidden flex-shrink-0',
          'transition-[width] duration-200 ease-in-out',
          'border-r border-brand-800',
          isSidebarCollapsed ? 'w-14' : 'w-64',
        ].join(' ')}
      >
        {/* Header */}
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

        {/* New Chat */}
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

        {/* Projects */}
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

        {/* Divider */}
        {!isSidebarCollapsed && (
          <div className="mx-3 mb-1 border-t border-brand-800 flex-shrink-0" />
        )}

        {/* Recent Chats */}
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
                <button
                  type="button"
                  onClick={(e) => handleDeleteRecentChat(e, chat)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-brand-500 hover:text-white hover:bg-brand-700 transition-all"
                >
                  <CloseIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            ) : (
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

        {/* User Card */}
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
                <TooltipAtom content="Profile · Preferences" position="top">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
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
                  onClick={() => navigate('/profile')}
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

      {/* ══════════════════════════════════════════════════ MAIN AREA (Outlet) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <Outlet context={outletContext} />
      </div>

      {/* Confirm: delete recent chat */}
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
