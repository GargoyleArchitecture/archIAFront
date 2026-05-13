import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { listChats, createChat, deleteChat } from '../services/chatService'

import ArrowBackIcon         from '@mui/icons-material/ArrowBack'
import FolderOpenIcon        from '@mui/icons-material/FolderOpen'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import AddIcon               from '@mui/icons-material/Add'
import DeleteIcon            from '@mui/icons-material/Delete'
import CloseIcon             from '@mui/icons-material/Close'
import SettingsIcon          from '@mui/icons-material/Settings'

import TextAtom      from '../components/atoms/TextAtom'
import ButtonAtom     from '../components/atoms/ButtonAtom'
import HeaderAtom     from '../components/atoms/HeaderAtom'
import LabelAtom      from '../components/atoms/LabelAtom'
import ConfirmModal   from '../components/molecules/ConfirmModal'

/* ─────────────────────────────────────────────────────────────
   Tag input (same pattern as MainView)
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
   Helpers
───────────────────────────────────────────────────────────── */
const timeAgo = (ts) => {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

/* ─────────────────────────────────────────────────────────────
   View
───────────────────────────────────────────────────────────── */
export default function ProjectDetailView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, load: loadProjects, remove: removeProject, getContext, saveContext } = useProjects()

  const project = projects.find((p) => p.id === projectId)

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState('chats')

  /* ── Chats ── */
  const [chats, setChats]               = useState([])
  const [chatsLoading, setChatsLoading] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState(null)

  /* ── Project deletion ── */
  const [deletingProject,      setDeletingProject]      = useState(false)
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false)
  const [confirmDeleteChatId,  setConfirmDeleteChatId]  = useState(null)

  /* ── Project Context ── */
  const [techStack, setTechStack]         = useState([])
  const [businessRules, setBusinessRules] = useState('')
  const [ctxLoading, setCtxLoading]       = useState(false)
  const [ctxSaving, setCtxSaving]         = useState(false)
  const [ctxError, setCtxError]           = useState(null)
  const [ctxSuccess, setCtxSuccess]       = useState(false)

  /* ── Bootstrap ── */
  useEffect(() => { loadProjects() }, [loadProjects])

  useEffect(() => {
    if (!projectId) return
    setChatsLoading(true)
    listChats({ projectId, limit: 100 })
      .then((list) => {
        const sorted = [...list].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        )
        setChats(sorted)
      })
      .catch(() => {})
      .finally(() => setChatsLoading(false))
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    setCtxLoading(true)
    getContext(projectId)
      .then((ctx) => {
        setTechStack(Array.isArray(ctx?.techStack) ? ctx.techStack : [])
        setBusinessRules(ctx?.businessRules ?? '')
      })
      .catch((err) => {
        if (!err.message?.includes('404')) setCtxError(err.message)
      })
      .finally(() => setCtxLoading(false))
  }, [projectId, getContext])

  /* ── Actions ── */
  const handleNewChat = async () => {
    setCreatingChat(true)
    try {
      const chat = await createChat({ projectId, title: 'New chat' })
      navigate('/', { state: { chatId: chat.id, projectId } })
    } catch {}
    setCreatingChat(false)
  }

  const handleOpenChat = (chat) => {
    navigate('/', { state: { chatId: chat.id, projectId } })
  }

  const handleDeleteChat = async (chatId) => {
    setDeletingChatId(chatId)
    try {
      await deleteChat(chatId)
      setChats((prev) => prev.filter((c) => c.id !== chatId))
    } catch {}
    setDeletingChatId(null)
    setConfirmDeleteChatId(null)
  }

  const handleDeleteProject = async () => {
    setDeletingProject(true)
    try {
      await removeProject(projectId)
      navigate('/projects')
    } catch {
      setDeletingProject(false)
    }
  }

  const handleSaveContext = async () => {
    setCtxSaving(true)
    setCtxError(null)
    setCtxSuccess(false)
    try {
      await saveContext(projectId, {
        techStack,
        businessRules: businessRules.trim() || undefined,
      })
      setCtxSuccess(true)
      setTimeout(() => setCtxSuccess(false), 3000)
    } catch (err) {
      setCtxError(err.message)
    } finally {
      setCtxSaving(false)
    }
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowBackIcon style={{ fontSize: 20 }} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderOpenIcon style={{ fontSize: 20, color: '#7c5cfc' }} className="flex-shrink-0" />
            <HeaderAtom level={3} weight="semibold" className="text-gray-900 truncate">
              {project?.name ?? 'Project'}
            </HeaderAtom>
          </div>
          {project?.description && (
            <TextAtom variant="text-sm" className="text-gray-400 truncate hidden md:block max-w-xs">
              {project.description}
            </TextAtom>
          )}
          <button
            type="button"
            onClick={() => setConfirmDeleteProject(true)}
            disabled={deletingProject}
            className="ml-2 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 flex-shrink-0"
            title="Delete project"
          >
            <DeleteIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 flex">
          {[
            { id: 'chats',   label: 'Chats',           icon: <ChatBubbleOutlineIcon style={{ fontSize: 16 }} /> },
            { id: 'context', label: 'Project Context',  icon: <SettingsIcon          style={{ fontSize: 16 }} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ].join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">

        {/* ════ CHATS TAB ════ */}
        {activeTab === 'chats' && (
          <div className="flex flex-col gap-4">

            {/* Action row */}
            <div className="flex items-center justify-between">
              <TextAtom variant="text-sm" className="text-gray-500">
                {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
              </TextAtom>
              <ButtonAtom
                intent="primary"
                variant="text-icon"
                icon={<AddIcon />}
                size="sm"
                onClick={handleNewChat}
                disabled={creatingChat}
              >
                {creatingChat ? 'Creating…' : 'New Chat'}
              </ButtonAtom>
            </div>

            {/* Loading */}
            {chatsLoading && (
              <div className="py-12 flex items-center justify-center">
                <TextAtom variant="text-sm" className="text-gray-400">Loading chats…</TextAtom>
              </div>
            )}

            {/* Empty */}
            {!chatsLoading && chats.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ChatBubbleOutlineIcon style={{ fontSize: 28, color: '#d1d5db' }} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <TextAtom variant="text-md" weight="medium" className="text-gray-600">
                    No conversations yet
                  </TextAtom>
                  <TextAtom variant="text-sm" className="text-gray-400">
                    Start a new chat to work with ArchIA on this project
                  </TextAtom>
                </div>
                <ButtonAtom intent="primary" variant="text-icon" icon={<AddIcon />} onClick={handleNewChat} disabled={creatingChat}>
                  {creatingChat ? 'Creating…' : 'New Chat'}
                </ButtonAtom>
              </div>
            )}

            {/* Chat list */}
            {!chatsLoading && chats.length > 0 && (
              <div className="flex flex-col gap-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:border-brand-200 hover:shadow-sm transition-all group cursor-pointer"
                    onClick={() => handleOpenChat(chat)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <ChatBubbleOutlineIcon style={{ fontSize: 18, color: '#7c5cfc' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <TextAtom variant="text-sm" weight="medium" className="text-gray-800 truncate">
                        {chat.title || 'Untitled chat'}
                      </TextAtom>
                      <TextAtom variant="text-xs" className="text-gray-400">
                        {timeAgo(chat.updatedAt || chat.createdAt)}
                      </TextAtom>
                    </div>
                    <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Open →
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteChatId(chat.id) }}
                      disabled={deletingChatId === chat.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 disabled:opacity-40"
                      title="Delete chat"
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ CONTEXT TAB ════ */}
        {activeTab === 'context' && (
          <div className="max-w-xl flex flex-col gap-6">
            <TextAtom variant="text-sm" className="text-gray-500">
              This context is automatically sent to the AI with every message in this project.
              Use it to describe the tech stack and key business rules the AI should be aware of.
            </TextAtom>

            {ctxLoading ? (
              <TextAtom variant="text-sm" className="text-gray-400">Loading context…</TextAtom>
            ) : (
              <>
                {/* Tech Stack */}
                <div className="flex flex-col gap-1.5">
                  <LabelAtom>Tech Stack</LabelAtom>
                  <TagInput
                    tags={techStack}
                    onChange={setTechStack}
                    placeholder="Python, FastAPI, PostgreSQL…"
                  />
                  <TextAtom variant="text-xs" className="text-gray-400">
                    Press Enter or comma to add a technology. Backspace to remove the last one.
                  </TextAtom>
                </div>

                {/* Business Rules */}
                <div className="flex flex-col gap-1.5">
                  <LabelAtom htmlFor="ctx-rules">Business Rules</LabelAtom>
                  <textarea
                    id="ctx-rules"
                    rows={6}
                    placeholder="E.g. Multi-tenant SaaS. All data access must be tenant-scoped. Authentication via OAuth 2.0…"
                    value={businessRules}
                    onChange={(e) => setBusinessRules(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                  />
                </div>

                {/* Feedback */}
                {ctxError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 border border-red-200">
                    {ctxError}
                  </p>
                )}
                {ctxSuccess && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2 border border-green-200">
                    Context saved successfully.
                  </p>
                )}

                <div>
                  <ButtonAtom intent="primary" onClick={handleSaveContext} disabled={ctxSaving}>
                    {ctxSaving ? 'Saving…' : 'Save Context'}
                  </ButtonAtom>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm: delete project ── */}
      <ConfirmModal
        isOpen={confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(false)}
        onConfirm={handleDeleteProject}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que quieres eliminar "${project?.name}"?`}
        warning="Todos los chats y mensajes asociados a este proyecto también serán eliminados permanentemente."
        isLoading={deletingProject}
      />

      {/* ── Confirm: delete chat ── */}
      <ConfirmModal
        isOpen={confirmDeleteChatId !== null}
        onClose={() => setConfirmDeleteChatId(null)}
        onConfirm={() => handleDeleteChat(confirmDeleteChatId)}
        title="Eliminar chat"
        message="¿Estás seguro de que quieres eliminar este chat? Todos los mensajes también serán eliminados."
        isLoading={deletingChatId === confirmDeleteChatId}
      />
    </div>
  )
}
