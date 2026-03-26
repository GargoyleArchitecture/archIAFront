import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import SmartToyIcon        from '@mui/icons-material/SmartToy'
import AddIcon             from '@mui/icons-material/Add'
import MenuIcon            from '@mui/icons-material/Menu'
import MenuOpenIcon        from '@mui/icons-material/MenuOpen'
import FolderIcon          from '@mui/icons-material/Folder'
import FolderOpenIcon      from '@mui/icons-material/FolderOpen'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ChevronRightIcon    from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon      from '@mui/icons-material/ExpandMore'
import LogoutIcon          from '@mui/icons-material/Logout'
import GridViewIcon        from '@mui/icons-material/GridView'

import TextAtom      from '../components/atoms/TextAtom'
import BoxAtom       from '../components/atoms/BoxAtom'
import ButtonAtom    from '../components/atoms/ButtonAtom'
import TooltipAtom   from '../components/atoms/TooltipAtom'
import BubbleMessage from '../components/molecules/BubbleMessage'
import ChatContainer from '../components/molecules/ChatContainer'
import MessageInput  from '../components/molecules/MessageInput'
import Chips         from '../components/molecules/Chips'
import MarkdownRenderer from '../components/organisms/MarkdownRenderer'

const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'E-commerce Platform',
    chats: [
      { id: 'c1', title: 'Microservices breakdown' },
      { id: 'c2', title: 'Payment gateway design' },
    ],
  },
  {
    id: 'p2',
    name: 'Data Pipeline',
    chats: [
      { id: 'c3', title: 'Kafka vs RabbitMQ' },
    ],
  },
]

const MOCK_MESSAGES = [
  {
    id: 'm1',
    role: 'USER',
    content: 'How should I structure a microservices architecture for an e-commerce platform?',
  },
  {
    id: 'm2',
    role: 'AI',
    content: `## Microservices for E-commerce\n\nFor an e-commerce platform, I recommend splitting by **business capability**:\n\n- **Product Catalog Service** — manages SKUs, inventory, pricing\n- **Order Service** — order lifecycle, state machine\n- **Payment Service** — integrates with gateways, handles idempotency\n- **User Service** — authentication, profiles, preferences\n\n### Communication Pattern\n\nUse **async messaging** (Kafka) for inter-service events and **sync REST/gRPC** only for real-time queries.\n\n\`\`\`\nOrder Service → (OrderPlaced event) → Kafka → Payment Service\n                                              → Inventory Service\n                                              → Notification Service\n\`\`\``,
  },
]

const FALLBACK_USER = { name: 'User', email: 'user@example.com' }

const AVATAR_AI = (
  <div className="w-full h-full bg-brand-600 flex items-center justify-center">
    <SmartToyIcon style={{ fontSize: 14, color: 'white' }} />
  </div>
)

const MOCK_AI_RESPONSES = [
  '## Great question!\n\nLet me analyze that architecture pattern for you. I would recommend starting with a **modular monolith** and evolving toward microservices as your team grows.\n\n### Key principles\n\n1. Define clear bounded contexts\n2. Use an API gateway for external traffic\n3. Implement circuit breakers for resilience',
  '**Event-driven architecture** works best here.\n\nConsider using:\n- Apache Kafka for event streaming\n- CQRS for read/write separation\n- Saga pattern for distributed transactions',
]

export default function MainView() {
  const navigate = useNavigate()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [expandedProjects, setExpandedProjects]     = useState(new Set(['p1']))
  const [activeProjectId, setActiveProjectId]       = useState(null)
  const [activeChatId, setActiveChatId]             = useState(null)

  const [messages, setMessages]     = useState([])
  const [isBusy, setIsBusy]         = useState(false)
  const messagesEndRef              = useRef(null)

  const { user: authUser, logout } = useAuth()
  const user = authUser || FALLBACK_USER

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const selectChat = (projectId, chatId) => {
    setActiveProjectId(projectId)
    setActiveChatId(chatId)
    setMessages(MOCK_MESSAGES)
  }

  const handleNewChat = () => {
    setActiveProjectId(null)
    setActiveChatId(null)
    setMessages([])
  }

  const handleSend = (text) => {
    if (isBusy) return
    const userMsg = { id: `u-${Date.now()}`, role: 'USER', content: text }
    const pendingId = `ai-${Date.now()}`
    const pending = { id: pendingId, role: 'AI', content: '', pending: true }

    setMessages((prev) => [...prev, userMsg, pending])
    setIsBusy(true)

    setTimeout(() => {
      const pick = MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)]
      setMessages((prev) =>
        prev.map((m) => m.id === pendingId ? { ...m, content: pick, pending: false } : m)
      )
      setIsBusy(false)
    }, 800)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeProject = MOCK_PROJECTS.find((p) => p.id === activeProjectId)
  const activeChat    = activeProject?.chats.find((c) => c.id === activeChatId)

  return (
    <BoxAtom display="flex" h="screen" className="overflow-hidden">

      {/* ════════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════════ */}
      <aside
        className={[
          'h-screen flex flex-col bg-brand-900 overflow-x-hidden flex-shrink-0',
          'transition-[width] duration-200 ease-in-out',
          'border-r border-brand-800',
          isSidebarCollapsed ? 'w-14' : 'w-64',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="h-16 flex items-center px-4 border-b border-brand-800 flex-shrink-0">
          {!isSidebarCollapsed ? (
            <>
              <TextAtom variant="text-lg" weight="bold" family="serif" className="text-white flex-1">
                ArchIA
              </TextAtom>
              <ButtonAtom
                variant="icon" intent="ghost" size="xs"
                onClick={() => setIsSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                className="text-white border-transparent hover:bg-brand-600/20"
              >
                <MenuOpenIcon />
              </ButtonAtom>
            </>
          ) : (
            <ButtonAtom
              variant="icon" intent="ghost" size="xs"
              onClick={() => setIsSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              className="text-white border-transparent hover:bg-brand-600/20 mx-auto"
            >
              <MenuIcon />
            </ButtonAtom>
          )}
        </div>

        {/* ── New Chat ── */}
        <div className="px-3 py-2 flex-shrink-0">
          {!isSidebarCollapsed ? (
            <ButtonAtom
              variant="text-icon"
              intent="secondary"
              size="sm"
              icon={<AddIcon />}
              onClick={handleNewChat}
              className="w-full justify-center bg-brand-800 text-brand-50 border-brand-700 hover:bg-brand-700 hover:border-brand-600"
            >
              New Chat
            </ButtonAtom>
          ) : (
            <TooltipAtom content="New Chat" position="right">
              <ButtonAtom
                variant="icon" intent="ghost" size="sm"
                onClick={handleNewChat}
                aria-label="New Chat"
                className="text-brand-300 border-transparent hover:text-white hover:bg-brand-800 mx-auto block"
              >
                <AddIcon />
              </ButtonAtom>
            </TooltipAtom>
          )}
        </div>

        {/* ── Projects Nav ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          {!isSidebarCollapsed && (
            <div className="px-4 pt-4 pb-1">
              <TextAtom variant="text-xs" weight="semibold" className="text-brand-400 uppercase tracking-wider">
                Projects
              </TextAtom>
            </div>
          )}

          {MOCK_PROJECTS.map((project) => {
            const isExpanded = expandedProjects.has(project.id)
            const isActive   = project.id === activeProjectId

            return (
              <div key={project.id}>
                {/* Project row */}
                {!isSidebarCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    className={[
                      'w-full px-3 py-1.5 flex items-center gap-2 cursor-pointer rounded-md',
                      'transition-colors duration-150 text-body-sm font-medium font-sans',
                      isActive
                        ? 'text-brand-200 bg-brand-800'
                        : 'text-brand-100 hover:bg-brand-800 hover:text-brand-50',
                    ].join(' ')}
                  >
                    <span className="flex-shrink-0 [&_svg]:w-4 [&_svg]:h-4">
                      {isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                    </span>
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    <span className="flex-shrink-0 [&_svg]:w-4 [&_svg]:h-4 text-brand-400">
                      {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </span>
                  </button>
                ) : (
                  <TooltipAtom content={project.name} position="right">
                    <button
                      type="button"
                      onClick={() => toggleProject(project.id)}
                      className={[
                        'flex items-center justify-center w-10 h-10 rounded-md mx-auto',
                        'transition-colors duration-150',
                        '[&_svg]:w-5 [&_svg]:h-5',
                        isActive
                          ? 'text-brand-200 bg-brand-800'
                          : 'text-brand-300 hover:bg-brand-800 hover:text-brand-50',
                      ].join(' ')}
                      aria-label={project.name}
                    >
                      <FolderIcon />
                    </button>
                  </TooltipAtom>
                )}

                {/* Chat sub-items */}
                {isExpanded && !isSidebarCollapsed && project.chats.map((chat) => {
                  const isChatActive = chat.id === activeChatId
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => selectChat(project.id, chat.id)}
                      className={[
                        'w-full pl-9 pr-3 py-1 flex items-center gap-2 rounded-md',
                        'transition-colors duration-150 text-body-xs font-sans',
                        isChatActive
                          ? 'text-brand-100 bg-brand-800'
                          : 'text-brand-300 hover:text-brand-50 hover:bg-brand-800',
                      ].join(' ')}
                    >
                      <span className="flex-shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5">
                        <ChatBubbleOutlineIcon />
                      </span>
                      <span className="truncate">{chat.title}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* ── User Card ── */}
        <div className="mt-auto border-t border-brand-800 px-3 py-3 flex-shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-brand-800 cursor-pointer transition-colors">
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
              <ButtonAtom
                variant="icon" intent="ghost" size="xs"
                onClick={handleLogout}
                aria-label="Log out"
                className="text-white border-transparent hover:bg-brand-600/20"
              >
                <LogoutIcon />
              </ButtonAtom>
            </div>
          ) : (
            <TooltipAtom content={user.name} position="right">
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center cursor-pointer">
                  <TextAtom variant="text-xs" weight="semibold" as="span" className="text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </TextAtom>
                </div>
              </div>
            </TooltipAtom>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">

        {/* ── Top Bar (only when chat active) ── */}
        {activeChatId && (
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white flex-shrink-0">
            <TextAtom variant="text-sm" weight="semibold" className="text-gray-800">
              {activeChat?.title}
            </TextAtom>
            {activeProject && (
              <Chips label={activeProject.name} variant="brand" size="sm" />
            )}
          </div>
        )}

        {/* ── Chat Content ── */}
        {activeChatId ? (
          <ChatContainer className="flex-1">
            {messages.map((msg) => {
              if (msg.role === 'USER') {
                return (
                  <BubbleMessage key={msg.id} variant="user">
                    {msg.content}
                  </BubbleMessage>
                )
              }
              return (
                <BubbleMessage
                  key={msg.id}
                  variant="ai"
                  isLoading={msg.pending}
                  avatar={AVATAR_AI}
                  noTextWrap
                >
                  <MarkdownRenderer content={msg.content} />
                </BubbleMessage>
              )
            })}
            <div ref={messagesEndRef} />
          </ChatContainer>
        ) : (
          /* ── Empty State ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="text-brand-200 [&_svg]:w-16 [&_svg]:h-16">
              <GridViewIcon style={{ fontSize: 64 }} />
            </span>
            <TextAtom variant="display-xs" weight="semibold" className="text-gray-700">
              Select a chat or start a new one
            </TextAtom>
            <TextAtom variant="text-sm" className="text-gray-400">
              Your architecture conversations will appear here
            </TextAtom>
            <ButtonAtom
              intent="primary"
              variant="text-icon"
              icon={<AddIcon />}
              onClick={handleNewChat}
            >
              New Chat
            </ButtonAtom>
          </div>
        )}

        {/* ── Message Input (always visible) ── */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-200 bg-white">
          <MessageInput
            onSend={handleSend}
            placeholder="Describe your architecture challenge…"
            hint="Enter to send · Shift+Enter for new line"
            disabled={isBusy}
          />
        </div>
      </div>
    </BoxAtom>
  )
}
