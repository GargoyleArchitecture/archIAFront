import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'

import AddIcon       from '@mui/icons-material/Add'
import FolderIcon    from '@mui/icons-material/Folder'
import DeleteIcon    from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'

import TextAtom    from '../components/atoms/TextAtom'
import ButtonAtom  from '../components/atoms/ButtonAtom'
import HeaderAtom  from '../components/atoms/HeaderAtom'
import LabelAtom   from '../components/atoms/LabelAtom'
import TooltipAtom from '../components/atoms/TooltipAtom'
import Modal        from '../components/molecules/Modal'
import Form         from '../components/molecules/Form'
import InputForm    from '../components/molecules/InputForm'
import ConfirmModal from '../components/molecules/ConfirmModal'

export default function ProjectsView() {
  const navigate = useNavigate()
  const { projects, isLoading, load, create, remove } = useProjects()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName]             = useState('')
  const [desc, setDesc]             = useState('')
  const [errors, setErrors]         = useState({})
  const [isSaving, setIsSaving]     = useState(false)
  const [deletingId,      setDeletingId]      = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setName('')
    setDesc('')
    setErrors({})
    setShowCreate(true)
  }

  const handleCreate = async () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required'
    else if (name.trim().length < 2) errs.name = 'Min. 2 characters'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSaving(true)
    try {
      const created = await create({ name: name.trim(), description: desc.trim() || undefined })
      setShowCreate(false)
      navigate(`/projects/${created.id}`)
    } catch (err) {
      setErrors({ name: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try { await remove(id) } catch {}
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowBackIcon style={{ fontSize: 20 }} />
            </button>
            <HeaderAtom level={3} weight="semibold" className="text-gray-900">
              My Projects
            </HeaderAtom>
          </div>
          <ButtonAtom intent="primary" variant="text-icon" icon={<AddIcon />} onClick={openCreate}>
            New Project
          </ButtonAtom>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <TextAtom variant="text-sm" className="text-gray-400">Loading projects…</TextAtom>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <FolderIcon style={{ fontSize: 32, color: '#7c5cfc' }} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <TextAtom variant="text-lg" weight="semibold" className="text-gray-700">
                No projects yet
              </TextAtom>
              <TextAtom variant="text-sm" className="text-gray-400">
                Create your first project to start chatting with ArchIA
              </TextAtom>
            </div>
            <ButtonAtom intent="primary" variant="text-icon" icon={<AddIcon />} onClick={openCreate}>
              New Project
            </ButtonAtom>
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-150 cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Colored top strip */}
                <div className="h-1.5 bg-gradient-to-r from-brand-600 to-brand-400 flex-shrink-0" />

                {/* Card body */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderIcon style={{ fontSize: 18 }} className="text-brand-400 flex-shrink-0" />
                      <TextAtom variant="text-md" weight="semibold" className="text-gray-900 truncate">
                        {project.name}
                      </TextAtom>
                    </div>
                    <TooltipAtom content="Delete project" position="top">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id) }}
                        disabled={deletingId === project.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 disabled:opacity-40"
                      >
                        <DeleteIcon style={{ fontSize: 16 }} />
                      </button>
                    </TooltipAtom>
                  </div>

                  {project.description ? (
                    <TextAtom variant="text-sm" className="text-gray-500 line-clamp-2">
                      {project.description}
                    </TextAtom>
                  ) : (
                    <TextAtom variant="text-sm" className="text-gray-300 italic">
                      No description
                    </TextAtom>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <TextAtom variant="text-xs" className="text-gray-400">
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })
                      : ''}
                  </TextAtom>
                  <span className="text-xs font-medium text-brand-500 group-hover:text-brand-700 flex items-center gap-1">
                    <ChatBubbleOutlineIcon style={{ fontSize: 14 }} />
                    Open
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm: delete project ── */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que quieres eliminar "${projects.find((p) => p.id === confirmDeleteId)?.name}"?`}
        warning="Todos los chats y mensajes asociados a este proyecto también serán eliminados permanentemente."
        isLoading={deletingId === confirmDeleteId}
      />

      {/* ── Modal: Create project ── */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Project"
        size="sm"
        footer={
          <>
            <ButtonAtom intent="ghost" onClick={() => setShowCreate(false)}>Cancel</ButtonAtom>
            <ButtonAtom intent="primary" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? 'Creating…' : 'Create project'}
            </ButtonAtom>
          </>
        }
      >
        <Form gap="md">
          <InputForm
            id="proj-name"
            label="Project name"
            required
            placeholder="E.g. E-commerce Platform"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({}) }}
            error={errors.name}
          />
          <div className="flex flex-col gap-1">
            <LabelAtom htmlFor="proj-desc">Description</LabelAtom>
            <textarea
              id="proj-desc"
              rows={3}
              placeholder="Briefly describe the project…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            />
          </div>
        </Form>
      </Modal>
    </div>
  )
}
