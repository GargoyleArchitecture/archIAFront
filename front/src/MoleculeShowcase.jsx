/**
 * MoleculeShowcase — Storybook de revisión para las @Molecules de ArchIA
 *
 * Cada sección muestra todas las variantes, estados y props de una molécula.
 * Los componentes interactivos (Table, Modal, AlertDialog, Chips, ChatHistory,
 * Sidebar) usan useState local para demos funcionales.
 *
 * Props:
 *   onNavigate — function('atoms')   Callback para volver al storybook de átomos
 */

import { useState } from 'react'

/* MUI Icons */
import AddIcon          from '@mui/icons-material/Add'
import ArchitectureIcon from '@mui/icons-material/Architecture'
import ChatIcon         from '@mui/icons-material/Chat'
import FolderOpenIcon   from '@mui/icons-material/FolderOpen'
import HomeIcon         from '@mui/icons-material/Home'
import SettingsIcon     from '@mui/icons-material/Settings'
import LogoutIcon       from '@mui/icons-material/Logout'
import SmartToyIcon     from '@mui/icons-material/SmartToy'
import StarIcon         from '@mui/icons-material/Star'
import EditIcon         from '@mui/icons-material/Edit'
import CodeIcon         from '@mui/icons-material/Code'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SendIcon         from '@mui/icons-material/Send'
import StorageIcon      from '@mui/icons-material/Storage'

/* Atoms */
import TextAtom    from './components/atoms/TextAtom'
import ButtonAtom  from './components/atoms/ButtonAtom'
import BoxAtom     from './components/atoms/BoxAtom'

/* Molecules */
import SectionHeader from './components/molecules/SectionHeader'
import InputForm     from './components/molecules/InputForm'
import Form          from './components/molecules/Form'
import Chips         from './components/molecules/Chips'
import Column        from './components/molecules/Column'
import Cards         from './components/molecules/Cards'
import ChatHistory   from './components/molecules/ChatHistory'
import BubbleMessage from './components/molecules/BubbleMessage'
import DropzoneFile  from './components/molecules/DropzoneFile'
import MessageInput  from './components/molecules/MessageInput'
import Sidebar         from './components/molecules/Sidebar'
import ChatContainer  from './components/molecules/ChatContainer'
import RowTable      from './components/molecules/RowTable'
import Table         from './components/molecules/Table'
import Modal         from './components/molecules/Modal'
import AlertDialog   from './components/molecules/AlertDialog'
import CodeBlock          from './components/molecules/CodeBlock'

/* Organisms */
import MarkdownRenderer from './components/organisms/MarkdownRenderer'

/* ================================================================
   NAV — lista de secciones para el sidebar
================================================================ */
const NAV_ITEMS = [
  { id: 'section-header', label: 'SectionHeader' },
  { id: 'input-form',     label: 'InputForm'     },
  { id: 'form',           label: 'Form'          },
  { id: 'chips',          label: 'Chips'         },
  { id: 'column',         label: 'Column'        },
  { id: 'cards',          label: 'Cards'         },
  { id: 'chat-history',   label: 'ChatHistory'   },
  { id: 'bubble-message', label: 'BubbleMessage' },
  { id: 'dropzone-file',  label: 'DropzoneFile'  },
  { id: 'message-input',   label: 'MessageInput'   },
  { id: 'chat-container',  label: 'ChatContainer'  },
  { id: 'sidebar',         label: 'Sidebar'        },
  { id: 'row-table',      label: 'RowTable'      },
  { id: 'table',          label: 'Table'         },
  { id: 'modal',          label: 'Modal'         },
  { id: 'alert-dialog',   label: 'AlertDialog'   },
  { id: 'code-block',          label: 'CodeBlock'          },
  { id: 'markdown-renderer',   label: 'MarkdownRenderer ✦', type: 'organism' },
]

/* ================================================================
   HELPERS DE PRESENTACIÓN
   Componentes internos del showcase — no forman parte del design
   system, solo sirven para estructurar la pantalla de revisión.
================================================================ */

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="block text-body-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-md px-3 py-2 transition-colors duration-150"
    >
      {children}
    </a>
  )
}

/* Tarjeta contenedora de cada molécula / organismo */
function ShowcaseSection({ id, title, description, children, type = 'molecule' }) {
  const badge =
    type === 'organism'
      ? 'bg-brand-50 text-brand-700 border-brand-100'
      : 'bg-secondary-50 text-secondary-700 border-secondary-100'

  return (
    <section id={id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden scroll-mt-20">
      <BoxAtom
        display="flex"
        align="start"
        justify="between"
        gap="4"
        bg="gray-25"
        px="6"
        py="4"
        className="border-b border-gray-100"
      >
        <BoxAtom>
          <TextAtom variant="display-xs" weight="semibold" className="text-gray-900">
            {title}
          </TextAtom>
          {description && (
            <TextAtom variant="text-sm" className="text-gray-500 mt-1">
              {description}
            </TextAtom>
          )}
        </BoxAtom>
        <span className={`text-xs font-mono rounded-md px-2 py-1 border flex-shrink-0 mt-1 ${badge}`}>
          @{type}
        </span>
      </BoxAtom>
      <BoxAtom display="flex" direction="col" gap="8" p="6">
        {children}
      </BoxAtom>
    </section>
  )
}

/* Grupo de variantes con separador con título */
function VariantGroup({ label, children, direction = 'row' }) {
  return (
    <BoxAtom display="flex" direction="col" gap="4">
      <BoxAtom display="flex" align="center" gap="3">
        <div className="h-px flex-1 bg-gray-100" />
        <TextAtom
          variant="text-xs"
          weight="semibold"
          as="span"
          className="text-gray-400 uppercase"
        >
          {label}
        </TextAtom>
        <div className="h-px flex-1 bg-gray-100" />
      </BoxAtom>
      <BoxAtom
        display="flex"
        align="start"
        gap="4"
        className={direction === 'col' ? 'flex-col' : 'flex-row flex-wrap'}
      >
        {children}
      </BoxAtom>
    </BoxAtom>
  )
}

/* Item individual con su etiqueta de prop */
function ShowcaseItem({ label, children }) {
  return (
    <BoxAtom display="flex" direction="col" className="gap-1.5 min-w-0">
      {label && (
        <code className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded-sm px-1.5 py-0.5 w-fit">
          {label}
        </code>
      )}
      {children}
    </BoxAtom>
  )
}

/* ================================================================
   SECCIÓN 1: SectionHeader
================================================================ */
function SectionHeaderSection() {
  return (
    <ShowcaseSection
      id="section-header"
      title="SectionHeader"
      description="Cabecera de sección: título + subtítulo opcional + slot de acción alineado a la derecha. Compone HeaderAtom + TextAtom."
    >
      <VariantGroup label="Variantes base" direction="col">
        <ShowcaseItem label='title solo'>
          <BoxAtom w="full" maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader title="Proyectos recientes" />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='title + subtitle'>
          <BoxAtom w="full" maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader
              title="Proyectos recientes"
              subtitle="Tus últimos 10 proyectos de arquitectura"
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='title + subtitle + action'>
          <BoxAtom w="full" maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader
              title="Proyectos recientes"
              subtitle="Tus últimos 10 proyectos de arquitectura"
              action={
                <ButtonAtom variant="text-icon" intent="primary" size="sm" icon={<AddIcon />}>
                  Nuevo proyecto
                </ButtonAtom>
              }
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Niveles de heading (level)" direction="col">
        <ShowcaseItem label='level={1} → h1 + display-2xl'>
          <BoxAtom maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader level={1} title="Panel de control" subtitle="Gestiona tus proyectos y conversaciones" />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='level={3} → h3 + display-lg'>
          <BoxAtom maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader level={3} title="Microservicios" subtitle="Vista de componentes del sistema" />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='level={4} (default=2) → h4 + display-md'>
          <BoxAtom maxW="2xl" p="4" bg="gray-50" rounded="lg">
            <SectionHeader level={4} title="Configuración del proyecto" />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Acciones en slot derecho">
        <ShowcaseItem label='action con ButtonAtom ghost'>
          <BoxAtom p="4" bg="gray-50" rounded="lg" className="w-80">
            <SectionHeader
              level={3}
              title="Historial"
              action={<ButtonAtom intent="ghost" size="sm">Ver todo</ButtonAtom>}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='action con botón icon'>
          <BoxAtom p="4" bg="gray-50" rounded="lg" className="w-80">
            <SectionHeader
              level={3}
              title="Diagrama"
              action={
                <ButtonAtom variant="icon" intent="ghost" size="sm" aria-label="Editar">
                  <EditIcon />
                </ButtonAtom>
              }
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 2: InputForm
================================================================ */
function InputFormSection() {
  return (
    <ShowcaseSection
      id="input-form"
      title="InputForm"
      description="Unidad mínima de formulario: LabelAtom + InputAtom + mensaje de error o hint. Estado derivado automáticamente del prop error/disabled."
    >
      <VariantGroup label="Variantes base" direction="col">
        <ShowcaseItem label="Default (label + input)">
          <BoxAtom className="w-80">
            <InputForm id="if-default" label="Nombre del proyecto" placeholder="Ej: Microservicios Alpha" />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='required={true} — asterisco en la etiqueta'>
          <BoxAtom className="w-80">
            <InputForm id="if-req" label="Correo electrónico" type="email" placeholder="tu@empresa.com" required />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='hint — texto de ayuda bajo el campo'>
          <BoxAtom className="w-80">
            <InputForm
              id="if-hint"
              label="URL del repositorio"
              type="url"
              placeholder="https://github.com/..."
              hint="Solo repositorios públicos son compatibles."
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='error — fuerza state="error" en el input'>
          <BoxAtom className="w-80">
            <InputForm
              id="if-err"
              label="URL del repositorio"
              type="url"
              defaultValue="http://github.com/..."
              error="La URL debe comenzar con https://"
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='disabled={true}'>
          <BoxAtom className="w-80">
            <InputForm
              id="if-dis"
              label="Usuario"
              disabled
              defaultValue="archia_user_01"
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Tamaños (size)">
        <ShowcaseItem label='size="sm"'>
          <InputForm id="if-sm" label="Pequeño" size="sm" placeholder="Small input" className="w-64" />
        </ShowcaseItem>
        <ShowcaseItem label='size="md" (default)'>
          <InputForm id="if-md" label="Mediano" size="md" placeholder="Medium input" className="w-64" />
        </ShowcaseItem>
        <ShowcaseItem label='size="lg"'>
          <InputForm id="if-lg" label="Grande" size="lg" placeholder="Large input" className="w-64" />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Sin label (aria-label para accesibilidad)" direction="col">
        <ShowcaseItem label="Buscador sin label visible">
          <BoxAtom className="w-80">
            <InputForm
              id="if-search"
              placeholder="Buscar proyectos…"
              aria-label="Buscador de proyectos"
              size="sm"
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 3: Form
================================================================ */
function FormSection() {
  return (
    <ShowcaseSection
      id="form"
      title="Form"
      description="Contenedor semántico <form>. Gestiona e.preventDefault() + prop onSubmit. El espaciado entre campos se controla con gap (sm/md/lg)."
    >
      <VariantGroup label="Espaciado entre campos (gap)">
        <ShowcaseItem label='gap="sm" — gap-3 (12px)'>
          <BoxAtom p="4" bg="gray-50" rounded="lg" className="w-72">
            <Form gap="sm">
              <InputForm id="fsm-name" label="Nombre" placeholder="Juan" />
              <InputForm id="fsm-mail" label="Correo" type="email" placeholder="juan@..." />
            </Form>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='gap="md" (default) — gap-4 (16px)'>
          <BoxAtom p="4" bg="gray-50" rounded="lg" className="w-72">
            <Form gap="md">
              <InputForm id="fmd-name" label="Nombre" placeholder="Juan" />
              <InputForm id="fmd-mail" label="Correo" type="email" placeholder="juan@..." />
            </Form>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='gap="lg" — gap-6 (24px)'>
          <BoxAtom p="4" bg="gray-50" rounded="lg" className="w-72">
            <Form gap="lg">
              <InputForm id="flg-name" label="Nombre" placeholder="Juan" />
              <InputForm id="flg-mail" label="Correo" type="email" placeholder="juan@..." />
            </Form>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Formulario completo con submit" direction="col">
        <ShowcaseItem label="Formulario de login — gap=md + botón submit">
          <BoxAtom p="5" bg="gray-50" rounded="lg" border="gray-200" className="w-80">
            <Form gap="md" onSubmit={() => {}}>
              <InputForm id="flog-email" label="Correo electrónico" type="email" placeholder="tu@empresa.com" required />
              <InputForm id="flog-pass" label="Contraseña" type="password" placeholder="••••••••" required />
              <ButtonAtom intent="primary" type="submit" className="w-full justify-center">
                Iniciar sesión
              </ButtonAtom>
            </Form>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Formulario de proyecto — gap=lg + 3 campos">
          <BoxAtom p="5" bg="gray-50" rounded="lg" border="gray-200" className="w-80">
            <Form gap="lg">
              <InputForm id="fproj-name" label="Nombre del proyecto" placeholder="Alpha v2" required />
              <InputForm
                id="fproj-url"
                label="URL del repositorio"
                type="url"
                placeholder="https://github.com/..."
                hint="Solo repositorios públicos."
              />
              <InputForm
                id="fproj-err"
                label="Token de acceso"
                type="password"
                error="Token inválido o expirado"
                defaultValue="tok_abc..."
              />
            </Form>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 4: Chips
================================================================ */
function ChipsSection() {
  /* Demo de filtros seleccionables */
  const FILTER_OPTIONS = ['Todos', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'TypeScript']
  const [activeFilters, setActiveFilters] = useState(new Set(['React']))
  const toggleFilter = (f) =>
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })

  /* Demo de chips removibles */
  const [tags, setTags] = useState(['arquia-v2', 'microservicios', 'diagrama', 'DDD'])
  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag))

  return (
    <ShowcaseSection
      id="chips"
      title="Chips"
      description="Badge / tag versátil. Funciona como etiqueta estática, chip de filtro seleccionable o chip removible. 6 variantes semánticas × 2 tamaños."
    >
      <VariantGroup label="Variantes (variant) — estáticas">
        {['default', 'brand', 'success', 'warning', 'error', 'secondary'].map((v) => (
          <ShowcaseItem key={v} label={`variant="${v}"`}>
            <Chips label={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} />
          </ShowcaseItem>
        ))}
      </VariantGroup>

      <VariantGroup label="Tamaños (size)">
        <ShowcaseItem label='size="sm"'>
          <BoxAtom display="flex" gap="2" wrap="wrap">
            {['default', 'brand', 'success', 'warning', 'error', 'secondary'].map((v) => (
              <Chips key={v} label={v} variant={v} size="sm" />
            ))}
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="md" (default)'>
          <BoxAtom display="flex" gap="2" wrap="wrap">
            {['default', 'brand', 'success', 'warning', 'error', 'secondary'].map((v) => (
              <Chips key={v} label={v} variant={v} size="md" />
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Chip con icono (icon prop)">
        <ShowcaseItem label='icon={<StarIcon />} variant="warning"'>
          <Chips label="Favorito" variant="warning" icon={<StarIcon />} />
        </ShowcaseItem>
        <ShowcaseItem label='icon={<CodeIcon />} variant="brand" size="sm"'>
          <Chips label="TypeScript" variant="brand" icon={<CodeIcon />} size="sm" />
        </ShowcaseItem>
        <ShowcaseItem label='icon + size="sm" — stack de tecnologías'>
          <BoxAtom display="flex" wrap="wrap" className="gap-1.5">
            <Chips label="React"      variant="brand"     icon={<CodeIcon />} size="sm" />
            <Chips label="Node.js"    variant="success"   icon={<StorageIcon />} size="sm" />
            <Chips label="Docker"     variant="secondary" size="sm" />
            <Chips label="AWS"        variant="warning"   size="sm" />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estado selected (visual)">
        <ShowcaseItem label='selected={false} — normal'>
          <Chips label="Microservicios" variant="brand" />
        </ShowcaseItem>
        <ShowcaseItem label='selected={true} — fondo más oscuro'>
          <Chips label="Microservicios" variant="brand" selected />
        </ShowcaseItem>
        <ShowcaseItem label='disabled={true}'>
          <Chips label="No disponible" variant="default" disabled />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Chips de filtro — interactivos (haz click)" direction="col">
        <ShowcaseItem label="onClick + selected → patrón multi-filtro">
          <BoxAtom display="flex" gap="2" wrap="wrap">
            {FILTER_OPTIONS.map((f) => (
              <Chips
                key={f}
                label={f}
                variant="brand"
                size="sm"
                selected={activeFilters.has(f)}
                onClick={() => toggleFilter(f)}
              />
            ))}
          </BoxAtom>
          <TextAtom variant="text-xs" className="text-gray-400 mt-1">
            Activos: {activeFilters.size === 0 ? 'ninguno' : [...activeFilters].join(', ')}
          </TextAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Chips removibles — interactivos (haz click en ×)" direction="col">
        <ShowcaseItem label="removable + onRemove → tags añadidos">
          <BoxAtom display="flex" gap="2" wrap="wrap" className="min-h-[32px]">
            {tags.length === 0 ? (
              <TextAtom variant="text-xs" className="text-gray-400">Sin tags</TextAtom>
            ) : (
              tags.map((tag) => (
                <Chips
                  key={tag}
                  label={tag}
                  variant="secondary"
                  removable
                  onRemove={() => removeTag(tag)}
                />
              ))
            )}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 5: Column
================================================================ */
function ColumnSection() {
  const [sortDir, setSortDir] = useState('asc')
  const cycleSort = () => setSortDir((d) => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc')

  return (
    <ShowcaseSection
      id="column"
      title="Column"
      description="Celda de encabezado de tabla (<th>). Sortable con indicadores Unicode ↑↓↕. Soporta align y width. Debe usarse dentro de <thead><tr>."
    >
      <VariantGroup label="Columnas no sortables (variantes de align)" direction="col">
        <ShowcaseItem label='align="left" (default) / align="center" / align="right"'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Column label="Nombre del proyecto" />
                  <Column label="Estado" align="center" width="120px" />
                  <Column label="Fecha" align="right" width="110px" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-body-sm text-gray-400 border-b border-gray-100">
                    (datos de RowTable van aquí)
                  </td>
                  <td className="px-4 py-3 text-center text-body-sm text-gray-400 border-b border-gray-100">—</td>
                  <td className="px-4 py-3 text-right text-body-sm text-gray-400 border-b border-gray-100">—</td>
                </tr>
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Columnas sortables (sortDirection + onSort)" direction="col">
        <ShowcaseItem label='sortable — haz click en "Nombre" para ciclar asc → desc → null'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Column label="Nombre" sortable sortDirection={sortDir} onSort={cycleSort} />
                  <Column label="Proyecto" sortable sortDirection={null} />
                  <Column label="Estado" align="center" width="120px" />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-body-sm text-gray-400 border-b border-gray-100">
                    sortDirection actual: <code className="font-mono">{sortDir ?? 'null'}</code>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-gray-400 border-b border-gray-100">↕ inactivo</td>
                  <td className="px-4 py-3 text-center text-body-sm text-gray-400 border-b border-gray-100">—</td>
                </tr>
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>

        <ShowcaseItem label='sortDirection="asc" — ↑ en azul | sortDirection="desc" — ↓ en azul'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Column label='Asc (↑)'  sortable sortDirection="asc"  />
                  <Column label='Desc (↓)' sortable sortDirection="desc" />
                  <Column label='Null (↕)' sortable sortDirection={null} />
                </tr>
              </thead>
            </table>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 6: Cards
================================================================ */
function CardsSection() {
  return (
    <ShowcaseSection
      id="cards"
      title="Cards"
      description="Tarjeta de contenido con 3 sub-layouts: titled (banda de gradiente), text (solo contenido) e image (imagen aspect-video + fallback). Prop onClick hace la tarjeta clicable."
    >
      <VariantGroup label='variant="titled" — banda de gradiente brand + icono'>
        <ShowcaseItem label="Con icono + tag + description + actions">
          <BoxAtom className="w-64">
            <Cards
              variant="titled"
              title="Microservicios"
              description="Patrón de arquitectura distribuida basado en servicios independientes."
              icon={<ArchitectureIcon />}
              tag="Patrón"
              actions={
                <ButtonAtom intent="secondary" size="sm">Ver más</ButtonAtom>
              }
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Con icono, sin tag — clicable">
          <BoxAtom className="w-56">
            <Cards
              variant="titled"
              title="Generación de código"
              description="Exporta tu diagrama como boilerplate de microservicio."
              icon={<CodeIcon />}
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Solo tag, sin icono">
          <BoxAtom className="w-56">
            <Cards
              variant="titled"
              title="Event Sourcing"
              tag="Avanzado"
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label='variant="text" — solo contenido textual'>
        <ShowcaseItem label="Con tag + title + description + actions">
          <BoxAtom className="w-64">
            <Cards
              variant="text"
              tag="Tutorial"
              title="Introducción a Domain-Driven Design"
              description="Aprende los principios fundamentales del DDD y cómo aplicarlos a proyectos reales."
              actions={<ButtonAtom intent="ghost" size="sm">Leer →</ButtonAtom>}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sin tag, clicable">
          <BoxAtom className="w-56">
            <Cards
              variant="text"
              title="Arquitectura hexagonal"
              description="Aísla el núcleo de negocio de los detalles de infraestructura."
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Solo título">
          <BoxAtom className="w-48">
            <Cards variant="text" title="CQRS Pattern" />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label='variant="image" — imagen aspect-video + fallback letra'>
        <ShowcaseItem label="Sin image → fallback gradiente con inicial">
          <BoxAtom className="w-64">
            <Cards
              variant="image"
              title="Proyecto E-commerce"
              description="Arquitectura de microservicios con API Gateway y servicio de autenticación."
              tag="En progreso"
              actions={<ButtonAtom intent="ghost" size="sm">Abrir</ButtonAtom>}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sin image, clicable — hover:shadow-md">
          <BoxAtom className="w-56">
            <Cards
              variant="image"
              title="API Gateway"
              description="Enrutamiento centralizado y autenticación."
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 7: ChatHistory
================================================================ */
const DEMO_CHATS = [
  { id: 'c1', title: 'Diagrama de microservicios', projectName: 'Proyecto Alpha', timestamp: 'Hace 2h' },
  { id: 'c2', title: 'Análisis de requisitos del módulo de pagos', projectName: 'Proyecto Beta', timestamp: 'Ayer', unread: true },
  { id: 'c3', title: 'Arquitectura hexagonal', projectName: 'Proyecto Gamma', timestamp: 'Lun' },
  { id: 'c4', title: 'Event sourcing con CQRS — patrones de diseño avanzados', timestamp: '12 feb' },
]

function ChatHistorySection() {
  const [activeChat, setActiveChat] = useState('c1')

  return (
    <ShowcaseSection
      id="chat-history"
      title="ChatHistory"
      description="Fila de lista de conversaciones. Estados: activo (border-l brand), sin leer (negrita + punto azul) e inactivo. Interactivo: click + teclado."
    >
      <VariantGroup label="Estados individuales" direction="col">
        <ShowcaseItem label='isActive={true} — borde izquierdo brand, texto brand-700'>
          <BoxAtom bg="gray-50" rounded="lg" overflow="hidden" className="w-80">
            <ChatHistory
              title="Diagrama de microservicios"
              projectName="Proyecto Alpha"
              timestamp="Hace 2h"
              isActive
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='unread={true} — título en bold + punto azul'>
          <BoxAtom bg="gray-50" rounded="lg" overflow="hidden" className="w-80">
            <ChatHistory
              title="Análisis de requisitos del módulo de pagos"
              projectName="Proyecto Beta"
              timestamp="Ayer"
              unread
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Inactivo normal — sin project, sin timestamp">
          <BoxAtom bg="gray-50" rounded="lg" overflow="hidden" className="w-80">
            <ChatHistory title="Arquitectura hexagonal" onClick={() => {}} />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Título largo truncado — max-w del contenedor">
          <BoxAtom bg="gray-50" rounded="lg" overflow="hidden" className="w-64">
            <ChatHistory
              title="Event sourcing con CQRS — patrones de diseño avanzados en sistemas distribuidos"
              projectName="Proyecto Gamma"
              timestamp="12 feb"
              onClick={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Lista interactiva — haz click para activar" direction="col">
        <ShowcaseItem label="Lista de 4 chats con estado activo controlado">
          <BoxAtom bg="white" rounded="lg" border="gray-200" shadow="xs" overflow="hidden" className="w-80 divide-y divide-gray-100">
            {DEMO_CHATS.map((chat) => (
              <ChatHistory
                key={chat.id}
                title={chat.title}
                projectName={chat.projectName}
                timestamp={chat.timestamp}
                isActive={activeChat === chat.id}
                unread={chat.unread}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 8: BubbleMessage
================================================================ */
function BubbleMessageSection() {
  return (
    <ShowcaseSection
      id="bubble-message"
      title="BubbleMessage"
      description="Burbuja de mensaje de chat. Dos variantes: user (derecha, brand-100) y ai (izquierda, blanco + borde). Soporta isLoading (TypingDots), avatar y timestamp."
    >
      <VariantGroup label='Variantes (variant)' direction="col">
        <ShowcaseItem label='variant="user" + timestamp'>
          <BoxAtom display="flex" justify="end" w="full" maxW="md">
            <BubbleMessage variant="user">
              Genera un diagrama de microservicios para un e-commerce con API Gateway.
            </BubbleMessage>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='variant="ai" + timestamp'>
          <BoxAtom w="full" maxW="md">
            <BubbleMessage variant="ai">
              Aquí tienes una arquitectura de microservicios con API Gateway, servicio de autenticación y catálogo de productos.
            </BubbleMessage>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estado de carga (isLoading)">
        <ShowcaseItem label='variant="ai" isLoading={true} — TypingDots animados'>
          <BubbleMessage variant="ai" isLoading />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label='Avatar (solo variant="ai")' direction="col">
        <ShowcaseItem label='avatar={<SmartToyIcon />} — icono de IA en círculo brand'>
          <BoxAtom w="full" maxW="md">
            <BubbleMessage
              variant="ai"
              timestamp="14:24"
              avatar={
                <BoxAtom display="flex" align="center" justify="center" w="full" h="full" bg="brand-600">
                  <SmartToyIcon style={{ fontSize: 16, color: 'white' }} />
                </BoxAtom>
              }
            >
              Claro, voy a analizar la arquitectura actual y proponer mejoras de escalabilidad.
            </BubbleMessage>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Conversación completa simulada" direction="col">
        <ShowcaseItem label="User → AI → isLoading — flujo real del chat">
          <BoxAtom display="flex" direction="col" gap="4" p="4" bg="gray-50" rounded="lg" w="full" maxW="lg">
            <BubbleMessage variant="user">
              ¿Qué es Domain-Driven Design?
            </BubbleMessage>
            <BubbleMessage variant="ai">
              Domain-Driven Design (DDD) es una metodología de desarrollo de software que centra el diseño en el dominio del negocio y su lógica, promoviendo una colaboración profunda entre expertos del dominio y desarrolladores.
            </BubbleMessage>
            <BubbleMessage variant="user">
              ¿Cómo se aplica en microservicios?
            </BubbleMessage>
            <BubbleMessage variant="ai" isLoading />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 9: DropzoneFile
================================================================ */
function DropzoneFileSection() {
  return (
    <ShowcaseSection
      id="dropzone-file"
      title="DropzoneFile"
      description="Área de carga de archivos con drag & drop. Estados visuales: idle (hover brand), dragging (border sólido brand), error (border error) y disabled. Input nativo oculto activable con click."
    >
      <VariantGroup label="Estado idle — sin restricciones" direction="col">
        <ShowcaseItem label="Dropzone básico — todos los formatos">
          <BoxAtom maxW="sm">
            <DropzoneFile
              onDrop={(files) => console.log('dropped:', files)}
              onFileSelect={(files) => console.log('selected:', files)}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Con accept y maxSizeMB" direction="col">
        <ShowcaseItem label='accept=".pdf" maxSizeMB={10}'>
          <BoxAtom maxW="sm">
            <DropzoneFile accept=".pdf" maxSizeMB={10} />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='accept="image/*" multiple'>
          <BoxAtom maxW="sm">
            <DropzoneFile accept="image/*" multiple maxSizeMB={5} />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estado error" direction="col">
        <ShowcaseItem label='error="El archivo supera el tamaño máximo permitido."'>
          <BoxAtom maxW="sm">
            <DropzoneFile
              accept="image/*"
              error="El archivo supera el tamaño máximo permitido (10 MB)."
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estado disabled" direction="col">
        <ShowcaseItem label='disabled={true} — sin interacción, opacidad reducida'>
          <BoxAtom maxW="sm">
            <DropzoneFile disabled accept=".zip,.tar.gz" />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 10: MessageInput
================================================================ */
function MessageInputSection() {
  return (
    <ShowcaseSection
      id="message-input"
      title="MessageInput"
      description="Textarea auto-resize con botón de envío integrado. Enter envía, Shift+Enter añade línea. Estado interno uncontrolled. onSend recibe el string."
    >
      <VariantGroup label="Variantes base" direction="col">
        <ShowcaseItem label='Default — placeholder + hint por defecto'>
          <BoxAtom maxW="lg">
            <MessageInput onSend={(msg) => console.log('send:', msg)} />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='placeholder y hint personalizados'>
          <BoxAtom maxW="lg">
            <MessageInput
              placeholder="Describe tu diagrama de arquitectura…"
              hint="Sé específico sobre los componentes y sus relaciones."
              onSend={(msg) => console.log('send:', msg)}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='maxRows={3} — limita la altura antes de scroll'>
          <BoxAtom maxW="lg">
            <MessageInput
              maxRows={3}
              placeholder="Máximo 3 líneas visibles antes de scroll…"
              onSend={(msg) => console.log('send:', msg)}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='disabled={true} — campo y botón bloqueados'>
          <BoxAtom maxW="lg">
            <MessageInput
              disabled
              placeholder="La IA está respondiendo…"
              onSend={() => {}}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 11: ChatContainer
================================================================ */
function ChatContainerSection() {
  return (
    <ShowcaseSection
      id="chat-container"
      title="ChatContainer"
      description="Contenedor de conversación. Garantiza que BubbleMessage user se alinee al borde derecho y AI al borde izquierdo. w-full + flex flex-col → hijos heredan el ancho completo por align-items:stretch."
    >
      {/* ── Conversación completa ── */}
      <VariantGroup label="Conversación completa — user + ai + loading" direction="col">
        <ShowcaseItem label="ChatContainer con 4 mensajes (h-80, overflow-y-auto)">
          <BoxAtom display="flex" direction="col" overflow="hidden" rounded="lg" border="gray-200" bg="gray-50" w="full" maxW="lg" className="h-80">
            <ChatContainer className="flex-1">
              <BubbleMessage variant="user">
                ¿Qué es Domain-Driven Design y cómo lo aplico en un proyecto real?
              </BubbleMessage>
              <BubbleMessage
                variant="ai"
                timestamp="14:22"
                avatar={
                  <BoxAtom display="flex" align="center" justify="center" w="full" h="full" bg="brand-600">
                    <SmartToyIcon style={{ fontSize: 16, color: 'white' }} />
                  </BoxAtom>
                }
              >
                Domain-Driven Design (DDD) es una metodología que centra el diseño en el dominio del negocio. Se estructura en entidades, value objects, aggregates y bounded contexts para mantener la lógica cohesionada.
              </BubbleMessage>
              <BubbleMessage variant="user">
                ¿Y cómo encaja con microservicios?
              </BubbleMessage>
              <BubbleMessage variant="ai" isLoading />
            </ChatContainer>
          </BoxAtom>
          <TextAtom variant="text-xs" className="text-gray-400 mt-1">
            Los mensajes <code className="font-mono">user</code> llegan al borde derecho y los <code className="font-mono">ai</code> al izquierdo sin espacio sobrante.
          </TextAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Contenedor vacío ── */}
      <VariantGroup label="Contenedor vacío">
        <ShowcaseItem label="Sin mensajes — solo el área de scroll">
          <BoxAtom display="flex" direction="col" overflow="hidden" rounded="lg" border="gray-200" bg="gray-50" w="full" maxW="lg" className="h-32">
            <ChatContainer className="flex-1 items-center justify-center">
              <TextAtom variant="text-sm" className="text-gray-400">
                No hay mensajes aún.
              </TextAtom>
            </ChatContainer>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 12: Sidebar
================================================================ */
function SidebarSection() {
  const [activeId, setActiveId] = useState('chats')

  const mainItems = [
    { id: 'home',     label: 'Inicio',    icon: <HomeIcon />,     href: '#sidebar', isActive: activeId === 'home' },
    { id: 'chats',    label: 'Chats',     icon: <ChatIcon />,     href: '#sidebar', isActive: activeId === 'chats' },
    { id: 'projects', label: 'Proyectos', icon: <FolderOpenIcon />,href: '#sidebar', isActive: activeId === 'projects' },
  ]
  const bottomItems = [
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon />, onClick: () => setActiveId('settings'), isActive: activeId === 'settings' },
    { id: 'logout',   label: 'Cerrar sesión',  icon: <LogoutIcon />,  onClick: () => {} },
  ]

  return (
    <ShowcaseSection
      id="sidebar"
      title="Sidebar"
      description="Menú lateral vertical. Items principales con <a href> o <button>. Items inferiores en zona separada. Item activo: borde izquierdo brand + fondo brand-50."
    >
      <VariantGroup label="Demo interactiva — haz click para cambiar item activo" direction="col">
        <ShowcaseItem label="Sidebar completo (h-96) — main items + bottom items + footer">
          <BoxAtom rounded="lg" overflow="hidden" border="gray-200" shadow="xs" className="h-96 w-64">
            <Sidebar
              items={mainItems.map((item) => ({ ...item, onClick: () => setActiveId(item.id) }))}
              bottomItems={bottomItems}
              footer={
                <TextAtom variant="text-xs" className="text-gray-400 px-3">
                  ArchIA v0.1 · Atomic Design
                </TextAtom>
              }
            />
          </BoxAtom>
          <TextAtom variant="text-xs" className="text-gray-400 mt-1">
            Item activo: <code className="font-mono">{activeId}</code>
          </TextAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Sidebar mínimo — sin bottom items">
        <ShowcaseItem label="Solo main items, sin footer">
          <BoxAtom rounded="lg" overflow="hidden" border="gray-200" shadow="xs" className="h-48 w-56">
            <Sidebar
              items={[
                { id: 'a', label: 'Inicio',    icon: <HomeIcon />,     isActive: true },
                { id: 'b', label: 'Proyectos', icon: <FolderOpenIcon />, isActive: false },
              ]}
            />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sin iconos — solo labels">
          <BoxAtom rounded="lg" overflow="hidden" border="gray-200" shadow="xs" className="h-40 w-48">
            <Sidebar
              items={[
                { id: 'x', label: 'Documentación', isActive: false },
                { id: 'y', label: 'API Reference',  isActive: true },
                { id: 'z', label: 'Ejemplos',        isActive: false },
              ]}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Estado colapsado ── */}
      <VariantGroup label="collapsed={true} — solo iconos + TooltipAtom en hover" direction="col">
        <ShowcaseItem label="Sidebar colapsado (w-14) — hover sobre los iconos para ver el tooltip">
          <BoxAtom display="flex" gap="6" align="start">
            {/* Collapsed */}
            <BoxAtom rounded="lg" overflow="hidden" border="gray-200" shadow="xs" className="h-80 flex-shrink-0">
              <Sidebar
                collapsed
                items={mainItems.map((item) => ({ ...item, onClick: () => setActiveId(item.id) }))}
                bottomItems={bottomItems}
              />
            </BoxAtom>
            {/* Toggle demo: expandido vs colapsado */}
            <BoxAtom display="flex" direction="col" gap="4">
              <TextAtom variant="text-xs" className="text-gray-500">
                El estado colapsado se controla externamente con la prop <code className="font-mono">collapsed</code>. El sidebar anima el ancho con <code className="font-mono">transition-all duration-200</code>.
              </TextAtom>
              <CollapsibleSidebarDemo />
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* Demo interactivo de toggle collapsed — subcomponente local */
function CollapsibleSidebarDemo() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeId,  setActiveId]  = useState('chats')

  const items = [
    { id: 'home',     label: 'Inicio',    icon: <HomeIcon />,      isActive: activeId === 'home',     onClick: () => setActiveId('home') },
    { id: 'chats',    label: 'Chats',     icon: <ChatIcon />,      isActive: activeId === 'chats',    onClick: () => setActiveId('chats') },
    { id: 'projects', label: 'Proyectos', icon: <FolderOpenIcon />,isActive: activeId === 'projects', onClick: () => setActiveId('projects') },
  ]
  const bottomItems = [
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon />, onClick: () => {} },
  ]

  return (
    <BoxAtom display="flex" direction="col" gap="2">
      <ButtonAtom intent="secondary" size="sm" onClick={() => setCollapsed((v) => !v)}>
        {collapsed ? 'Expandir sidebar →' : '← Colapsar sidebar'}
      </ButtonAtom>
      <BoxAtom rounded="lg" overflow="hidden" border="gray-200" shadow="xs" className="h-56">
        <Sidebar
          collapsed={collapsed}
          items={items}
          bottomItems={bottomItems}
          className={collapsed ? '' : 'w-52'}
        />
      </BoxAtom>
    </BoxAtom>
  )
}

/* ================================================================
   SECCIÓN 12: RowTable
================================================================ */
function RowTableSection() {
  const [selected, setSelected] = useState(false)

  return (
    <ShowcaseSection
      id="row-table"
      title="RowTable"
      description="Fila de cuerpo de tabla (<tr>). Soporta selección con CheckboxAtom, striped alternado y click en fila completa. Jerarquía de fondo: selected > striped > default."
    >
      <VariantGroup label="Estados de fondo" direction="col">
        <ShowcaseItem label="Estado normal (bg-white)">
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <tbody>
                <RowTable cells={['Microservices API', 'Proyecto Alpha', '12 feb 2026']} />
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='selected={true} — bg-brand-25'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <tbody>
                <RowTable cells={['Auth Service', 'Proyecto Beta', '10 feb 2026']} selected />
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='striped={true} isOdd={true} — bg-gray-50'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <tbody>
                <RowTable cells={['Fila par', 'normal', '—']} striped isOdd={false} />
                <RowTable cells={['Fila impar', 'bg-gray-50', '—']} striped isOdd={true} />
                <RowTable cells={['Fila par', 'normal', '—']} striped isOdd={false} />
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Fila seleccionable (checkbox) — interactiva" direction="col">
        <ShowcaseItem label='selectable={true} — haz click en el checkbox'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <tbody>
                <RowTable
                  selectable
                  selected={selected}
                  onSelect={(e) => setSelected(e.target.checked)}
                  cells={['Diagrama hexagonal', 'Proyecto Gamma', '8 feb 2026']}
                />
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Fila clicable (onClick)" direction="col">
        <ShowcaseItem label='onClick — cursor-pointer + hover:bg-gray-50'>
          <BoxAtom overflow="x-hidden" rounded="lg" border="gray-200" shadow="xs">
            <table className="w-full border-collapse">
              <tbody>
                <RowTable
                  cells={['Event Sourcing', 'Proyecto Delta', '5 feb 2026']}
                  onClick={() => alert('Fila clicada')}
                />
              </tbody>
            </table>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 13: Table
================================================================ */
const TABLE_COLUMNS = [
  { id: 'name',    label: 'Nombre',    sortable: true },
  { id: 'project', label: 'Proyecto',  sortable: false },
  { id: 'status',  label: 'Estado',    sortable: false, align: 'center', width: '120px' },
  { id: 'date',    label: 'Fecha',     sortable: true,  align: 'right',  width: '110px' },
]

const TABLE_ROWS = [
  {
    id: 1,
    cells: [
      'Microservices API',
      'Proyecto Alpha',
      <Chips key="s1" label="Activo"    variant="success" size="sm" />,
      '12 feb 2026',
    ],
  },
  {
    id: 2,
    cells: [
      'Auth Service',
      'Proyecto Beta',
      <Chips key="s2" label="Pendiente" variant="warning" size="sm" />,
      '10 feb 2026',
    ],
  },
  {
    id: 3,
    cells: [
      'API Gateway',
      'Proyecto Alpha',
      <Chips key="s3" label="Activo"    variant="success" size="sm" />,
      '8 feb 2026',
    ],
  },
  {
    id: 4,
    cells: [
      'Event Bus',
      'Proyecto Gamma',
      <Chips key="s4" label="Error"     variant="error"   size="sm" />,
      '5 feb 2026',
    ],
  },
]

function TableSection() {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState(null)

  const toggleRow = (id) =>
    setSelectedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = (all) =>
    setSelectedRows(all ? new Set(TABLE_ROWS.map((r) => r.id)) : new Set())

  const handleSort = (col) => {
    if (sortCol !== col) { setSortCol(col); setSortDir('asc'); return }
    if (sortDir === 'asc')  { setSortDir('desc'); return }
    setSortCol(null); setSortDir(null)
  }

  const columnsWithSort = TABLE_COLUMNS.map((col) => ({
    ...col,
    sortDirection: sortCol === col.id ? sortDir : null,
    onSort:        col.sortable ? () => handleSort(col.id) : undefined,
  }))

  return (
    <ShowcaseSection
      id="table"
      title="Table"
      description="Tabla de datos completa. Compone Column (thead) + RowTable (tbody). Soporta selección global/por fila, ordenamiento, striped, estado de carga y estado vacío."
    >
      <VariantGroup label="Tabla básica — sin selección" direction="col">
        <ShowcaseItem label="columns + rows — layout estático">
          <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Tabla interactiva — selectable + sortable" direction="col">
        <ShowcaseItem label="selectable + selectedRows (useState) + onSort — haz click">
          <Table
            columns={columnsWithSort}
            rows={TABLE_ROWS}
            selectable
            selectedRows={selectedRows}
            onSelectRow={toggleRow}
            onSelectAll={toggleAll}
          />
          {selectedRows.size > 0 && (
            <BoxAtom display="flex" align="center" gap="2" mt="2">
              <TextAtom variant="text-xs" className="text-gray-500">
                {selectedRows.size} fila{selectedRows.size > 1 ? 's' : ''} seleccionada{selectedRows.size > 1 ? 's' : ''}
              </TextAtom>
              <ButtonAtom
                variant="text-icon"
                intent="danger"
                size="sm"
                icon={<DeleteOutlineIcon />}
                onClick={() => setSelectedRows(new Set())}
              >
                Eliminar selección
              </ButtonAtom>
            </BoxAtom>
          )}
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Tabla con striped" direction="col">
        <ShowcaseItem label="striped={true} — filas alternas bg-gray-50">
          <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} striped />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estados especiales">
        <ShowcaseItem label='loading={true} — "Cargando datos…"'>
          <BoxAtom className="w-80">
            <Table columns={TABLE_COLUMNS} rows={[]} loading />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='rows=[] — estado vacío por defecto'>
          <BoxAtom className="w-80">
            <Table columns={TABLE_COLUMNS} rows={[]} />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='emptyState personalizado'>
          <BoxAtom className="w-96">
            <Table
              columns={TABLE_COLUMNS}
              rows={[]}
              emptyState={
                <BoxAtom display="flex" direction="col" align="center" gap="3" py="4">
                  <TextAtom variant="text-sm" weight="medium" className="text-gray-500">
                    No hay proyectos todavía
                  </TextAtom>
                  <ButtonAtom variant="text-icon" intent="primary" size="sm" icon={<AddIcon />}>
                    Crear primer proyecto
                  </ButtonAtom>
                </BoxAtom>
              }
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 14: Modal
================================================================ */
function ModalSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSize, setModalSize] = useState('md')

  const SIZES = ['sm', 'md', 'lg', 'xl']

  return (
    <ShowcaseSection
      id="modal"
      title="Modal"
      description="Overlay fijo con panel centrado. Se cierra con Escape o click fuera del panel. Prop title activa la cabecera con botón X. Prop footer para acciones. Sin React Portal."
    >
      <VariantGroup label="Demo interactiva — elige tamaño y abre el modal" direction="col">
        <ShowcaseItem label="size selector + botón de apertura">
          <BoxAtom display="flex" direction="col" gap="4">
            {/* Selector de tamaño */}
            <BoxAtom display="flex" align="center" gap="2" wrap="wrap">
              <TextAtom variant="text-sm" weight="medium" className="text-gray-700">
                Tamaño:
              </TextAtom>
              {SIZES.map((s) => (
                <ButtonAtom
                  key={s}
                  intent={modalSize === s ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setModalSize(s)}
                >
                  {s}
                </ButtonAtom>
              ))}
            </BoxAtom>
            {/* Botón para abrir */}
            <BoxAtom>
              <ButtonAtom intent="primary" onClick={() => setModalOpen(true)}>
                Abrir modal ({modalSize})
              </ButtonAtom>
            </BoxAtom>
          </BoxAtom>

          {/* Modal */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Nuevo proyecto"
            size={modalSize}
            footer={
              <>
                <ButtonAtom intent="ghost"   onClick={() => setModalOpen(false)}>Cancelar</ButtonAtom>
                <ButtonAtom intent="primary" onClick={() => setModalOpen(false)}>Crear proyecto</ButtonAtom>
              </>
            }
          >
            <Form gap="md">
              <InputForm
                id="modal-name"
                label="Nombre del proyecto"
                placeholder="Ej: Microservicios Alpha"
                required
              />
              <InputForm
                id="modal-url"
                label="URL del repositorio"
                type="url"
                placeholder="https://github.com/..."
                hint="Solo repositorios públicos."
              />
              <InputForm
                id="modal-desc"
                label="Descripción"
                placeholder="Describe brevemente el proyecto…"
              />
            </Form>
          </Modal>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Variantes de size (max-width del panel)" direction="col">
        <ShowcaseItem label='size="sm" → max-w-sm | "md" → max-w-lg | "lg" → max-w-2xl | "xl" → max-w-4xl'>
          <BoxAtom display="flex" align="center" gap="2" wrap="wrap">
            {SIZES.map((s) => (
              <ButtonAtom
                key={s}
                intent="secondary"
                size="sm"
                onClick={() => { setModalSize(s); setModalOpen(true) }}
              >
                Abrir {s}
              </ButtonAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 15: AlertDialog
================================================================ */
function AlertDialogSection() {
  const [alertOpen,   setAlertOpen]   = useState(false)
  const [alertIntent, setAlertIntent] = useState('warning')
  const [isLoading,   setIsLoading]   = useState(false)

  const INTENTS = ['warning', 'danger', 'info', 'success']

  const DEMO_CONTENT = {
    warning: { title: '¿Descartar cambios?', description: 'Perderás todos los cambios no guardados. Esta acción no se puede deshacer.', confirm: 'Descartar' },
    danger:  { title: 'Eliminar proyecto',   description: '¿Estás seguro de que deseas eliminar este proyecto? Esta acción es irreversible.', confirm: 'Eliminar' },
    info:    { title: 'Nueva actualización', description: 'La versión 2.0 incluye mejoras de rendimiento y nuevas funciones de generación.', confirm: 'Ver novedades' },
    success: { title: '¡Exportación lista!', description: 'Tu diagrama fue exportado correctamente en formato PNG y SVG.', confirm: 'Abrir archivo' },
  }

  const handleConfirm = () => {
    if (alertIntent === 'danger') {
      /* Simula una operación async */
      setIsLoading(true)
      setTimeout(() => { setIsLoading(false); setAlertOpen(false) }, 1500)
    } else {
      setAlertOpen(false)
    }
  }

  const demo = DEMO_CONTENT[alertIntent]

  return (
    <ShowcaseSection
      id="alert-dialog"
      title="AlertDialog"
      description="Diálogo de confirmación que compone Modal (size=sm). Intent controla el ícono MUI, colores del círculo y estilo del botón de confirmación (primary o danger)."
    >
      <VariantGroup label="Demo interactiva — elige un intent y abre el diálogo" direction="col">
        <ShowcaseItem label="intent selector + botón de apertura">
          <BoxAtom display="flex" direction="col" gap="4">
            {/* Selector de intent */}
            <BoxAtom display="flex" align="center" gap="2" wrap="wrap">
              <TextAtom variant="text-sm" weight="medium" className="text-gray-700">
                Intent:
              </TextAtom>
              {INTENTS.map((i) => (
                <ButtonAtom
                  key={i}
                  intent={alertIntent === i ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setAlertIntent(i)}
                >
                  {i}
                </ButtonAtom>
              ))}
            </BoxAtom>
            {/* Botón para abrir */}
            <BoxAtom>
              <ButtonAtom intent="secondary" onClick={() => setAlertOpen(true)}>
                Abrir AlertDialog ({alertIntent})
              </ButtonAtom>
            </BoxAtom>
          </BoxAtom>

          <AlertDialog
            isOpen={alertOpen}
            onClose={() => { setAlertOpen(false); setIsLoading(false) }}
            onConfirm={handleConfirm}
            intent={alertIntent}
            title={demo.title}
            description={demo.description}
            confirmLabel={demo.confirm}
            cancelLabel="Cancelar"
            isLoading={isLoading}
          />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Los 4 intents (visuales estáticos)" direction="col">
        <ShowcaseItem label='intent="warning" — WarningAmberIcon amarillo, btn primary'>
          <BoxAtom display="flex" align="center" gap="3" p="4" rounded="lg" className="bg-warning-50 border border-warning-200">
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
              <TextAtom variant="text-lg" as="span">⚠️</TextAtom>
            </div>
            <BoxAtom>
              <TextAtom variant="text-sm" weight="semibold" className="text-warning-800">warning</TextAtom>
              <TextAtom variant="text-xs" className="text-warning-600">WarningAmberIcon · btn intent="primary"</TextAtom>
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="danger" — ErrorOutlineIcon rojo, btn intent="danger"'>
          <BoxAtom display="flex" align="center" gap="3" p="4" rounded="lg" className="bg-error-50 border border-error-200">
            <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
              <TextAtom variant="text-lg" as="span">🚨</TextAtom>
            </div>
            <BoxAtom>
              <TextAtom variant="text-sm" weight="semibold" className="text-error-800">danger</TextAtom>
              <TextAtom variant="text-xs" className="text-error-600">ErrorOutlineIcon · btn intent="danger"</TextAtom>
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="info" — InfoOutlinedIcon azul, btn intent="primary"'>
          <BoxAtom display="flex" align="center" gap="3" p="4" rounded="lg" className="bg-brand-50 border border-brand-200">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <TextAtom variant="text-lg" as="span">ℹ️</TextAtom>
            </div>
            <BoxAtom>
              <TextAtom variant="text-sm" weight="semibold" className="text-brand-800">info</TextAtom>
              <TextAtom variant="text-xs" className="text-brand-600">InfoOutlinedIcon · btn intent="primary"</TextAtom>
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="success" — CheckCircleOutlineIcon verde, btn intent="primary"'>
          <BoxAtom display="flex" align="center" gap="3" p="4" rounded="lg" className="bg-success-50 border border-success-200">
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
              <TextAtom variant="text-lg" as="span">✅</TextAtom>
            </div>
            <BoxAtom>
              <TextAtom variant="text-sm" weight="semibold" className="text-success-800">success</TextAtom>
              <TextAtom variant="text-xs" className="text-success-600">CheckCircleOutlineIcon · btn intent="primary"</TextAtom>
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 17: CodeBlock
================================================================ */
const JS_SAMPLE = `// Servicio de arquitectura con patrón Repository
import { ArchitectureRepository } from './repositories'

export class ArchitectureService {
  constructor(private repo: ArchitectureRepository) {}

  async analyzePattern(projectId: string) {
    const project = await this.repo.findById(projectId)
    if (!project) throw new Error(\`Project \${projectId} not found\`)

    return {
      patterns:    project.detectPatterns(),
      suggestions: this.generateSuggestions(project),
    }
  }

  private generateSuggestions(project) {
    // Lógica de recomendación basada en métricas
    return project.metrics.complexity > 0.7
      ? ['Considerar microservicios', 'Aplicar CQRS']
      : ['Arquitectura monolítica suficiente']
  }
}`.trim()

const PY_SAMPLE = `def fibonacci(n: int) -> int:
    """Calcula el n-ésimo número de Fibonacci."""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Ejemplo de uso
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`.trim()

const JSON_SAMPLE = `{
  "project": "ArchIA",
  "version": "0.1.0",
  "architecture": {
    "pattern": "Hexagonal",
    "layers": ["Domain", "Application", "Infrastructure"],
    "bounded_contexts": ["Chat", "Projects", "Users"]
  },
  "tech_stack": {
    "frontend": "React 19 + Tailwind CSS v4",
    "backend":  "Node.js + Express",
    "database": "PostgreSQL + Redis"
  }
}`.trim()

const BASH_SAMPLE = `# Iniciar el entorno de desarrollo de ArchIA
git clone https://github.com/GargoyleArchitecture/archIA.git
cd archIA

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local

# Arrancar frontend
npm run dev`.trim()

function CodeBlockSection() {
  return (
    <ShowcaseSection
      id="code-block"
      title="CodeBlock"
      description="Bloque de código con syntax highlighting Prism. Tema oscuro (vscDarkPlus) adaptado a la paleta ArchIA. Fuente JetBrains Mono. Botón Copiar con feedback visual. Scroll horizontal para líneas largas."
    >
      {/* ── TypeScript/JavaScript ── */}
      <VariantGroup label='language="typescript" — con números de línea' direction="col">
        <ShowcaseItem label='showLineNumbers={true}'>
          <CodeBlock language="typescript" code={JS_SAMPLE} showLineNumbers />
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Python ── */}
      <VariantGroup label='language="python"' direction="col">
        <ShowcaseItem label='showLineNumbers={false} (default)'>
          <CodeBlock language="python" code={PY_SAMPLE} />
        </ShowcaseItem>
      </VariantGroup>

      {/* ── JSON ── */}
      <VariantGroup label='language="json"' direction="col">
        <ShowcaseItem label="Configuración de proyecto">
          <CodeBlock language="json" code={JSON_SAMPLE} />
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Bash ── */}
      <VariantGroup label='language="bash" — comandos de terminal' direction="col">
        <ShowcaseItem label="Setup del proyecto">
          <CodeBlock language="bash" code={BASH_SAMPLE} />
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Línea larga (scroll horizontal) ── */}
      <VariantGroup label="Línea larga — scroll horizontal" direction="col">
        <ShowcaseItem label="Una sola línea que desborda el contenedor">
          <BoxAtom maxW="sm">
            <CodeBlock
              language="javascript"
              code={`const result = await architectureService.analyzePattern({ projectId: 'proj_abc123', depth: 'full', includeMetrics: true, includeSuggestions: true })`}
            />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN 18: MarkdownRenderer
================================================================ */
const MD_SAMPLE_FULL = `
# Arquitectura Hexagonal

La **Arquitectura Hexagonal** (también llamada *Ports & Adapters*) es un patrón que busca aislar el núcleo de la aplicación de sus dependencias externas.

## Principios clave

1. El **dominio** nunca conoce la infraestructura
2. La comunicación ocurre a través de **puertos** (interfaces)
3. Los **adaptadores** conectan el exterior con los puertos

## Ejemplo en TypeScript

\`\`\`typescript
// Puerto de salida — definido en el dominio
interface ProjectRepository {
  findById(id: string): Promise<Project | null>
  save(project: Project): Promise<void>
}

// Adaptador — vive en la capa de infraestructura
class PostgresProjectRepository implements ProjectRepository {
  async findById(id: string) {
    return db.query('SELECT * FROM projects WHERE id = $1', [id])
  }
  async save(project: Project) {
    await db.query('INSERT INTO projects VALUES ($1, $2)', [project.id, project.name])
  }
}
\`\`\`

## Capas del sistema

| Capa          | Responsabilidad                        | Tecnología         |
|---------------|----------------------------------------|--------------------|
| Dominio       | Lógica de negocio pura                 | TypeScript / DDD   |
| Aplicación    | Casos de uso y orquestación            | Services / CQRS    |
| Infraestructura | Persistencia, HTTP, mensajería       | Postgres, Express  |

## Ventajas

- **Testeabilidad**: el dominio se testea sin base de datos
- **Flexibilidad**: cambiar de PostgreSQL a MongoDB sin tocar el dominio
- **Mantenibilidad**: dependencias explícitas y unidireccionales

> "Make the implicit explicit" — el contrato entre capas es siempre una interfaz tipada.

Para más detalles ver la [documentación oficial de Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/).

---

El comando para instalar las dependencias del proyecto es \`npm install\`, seguido de \`npm run dev\`.
`.trim()

const MD_SAMPLE_INLINE = `
Usa \`useState\` y \`useEffect\` para manejar el estado local. La función \`async/await\` simplifica el manejo de promesas. Recuerda limpiar los efectos con \`return () => cleanup()\`.
`.trim()

const MD_SAMPLE_LIST = `
### Patrones de diseño más usados

**Creacionales:**
- Factory Method
- Abstract Factory
- Builder — útil cuando el objeto tiene muchos parámetros opcionales
- ~~Singleton~~ (evitar en código testeable)

**Estructurales:**
1. Adapter
2. Decorator
3. Facade

**Comportamiento:**
- Observer
- Strategy
- Command
`.trim()

function MarkdownRendererSection() {
  return (
    <ShowcaseSection
      id="markdown-renderer"
      title="MarkdownRenderer"
      description="Organismo: motor visual de respuestas IA. Parsea Markdown con react-markdown + remark-gfm. Cada elemento HTML está mapeado a los design tokens de ArchIA sin @tailwindcss/typography. Los bloques de código delegan en CodeBlock."
      type="organism"
    >
      <VariantGroup label="Demo completa — h1-h3, párrafos, listas, tabla, blockquote, code block, hr, inline code" direction="col">
        <ShowcaseItem label="Respuesta IA típica con múltiples elementos Markdown">
          <BoxAtom bg="gray-50" rounded="lg" p="6" maxW="3xl">
            <MarkdownRenderer content={MD_SAMPLE_FULL} />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Inline code — dentro de párrafo fluido" direction="col">
        <ShowcaseItem label="Código inline mezclado con texto">
          <BoxAtom bg="gray-50" rounded="lg" p="4" maxW="2xl">
            <MarkdownRenderer content={MD_SAMPLE_INLINE} />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Listas mixtas — ul, ol, strikethrough (GFM)" direction="col">
        <ShowcaseItem label="Listas con énfasis y tachado">
          <BoxAtom bg="gray-50" rounded="lg" p="4" maxW="xl">
            <MarkdownRenderer content={MD_SAMPLE_LIST} />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Contenido vacío — sin crash" direction="col">
        <ShowcaseItem label='content=""'>
          <BoxAtom bg="gray-50" rounded="lg" p="4" maxW="sm" className="text-center">
            <MarkdownRenderer content="" />
            <span className="text-body-xs text-gray-400 font-sans">(sin contenido)</span>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   COMPONENTE PRINCIPAL: MoleculeShowcase
================================================================ */
export default function MoleculeShowcase({ onNavigate }) {
  return (
    <BoxAtom id="top" minH="screen" bg="gray-50">

      {/* ── Barra superior ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-xs h-16 flex items-center px-8 gap-4">
        <BoxAtom display="flex" align="baseline" gap="2">
          <TextAtom variant="display-xs" weight="bold" family="serif" className="text-brand-700">
            ArchIA
          </TextAtom>
          <TextAtom variant="text-xs" weight="medium" as="span" className="text-gray-400">
            Design System
          </TextAtom>
        </BoxAtom>
        <div className="h-4 w-px bg-gray-200" />
        <TextAtom variant="text-xs" as="span" className="text-gray-500">
          @Molecules — Storybook de revisión
        </TextAtom>
        <BoxAtom display="flex" align="center" gap="3" className="ml-auto">
          <ButtonAtom
            as="button"
            intent="ghost"
            size="sm"
            onClick={() => onNavigate?.('atoms')}
          >
            ← Ver Átomos
          </ButtonAtom>
          <span className="text-xs font-mono text-gray-400">v0.1 · Atomic Design + Tailwind CSS v4</span>
        </BoxAtom>
      </header>

      <BoxAtom display="flex" className="max-w-screen-xl mx-auto">

        {/* ── Sidebar nav ── */}
        <aside className="w-56 flex-shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white">
          <nav className="p-4 flex flex-col gap-1">
            <TextAtom
              variant="text-xs"
              weight="semibold"
              as="p"
              className="text-gray-400 uppercase px-3 pt-2 pb-3"
            >
              Moléculas (17) · Organismos (1)
            </TextAtom>
            {NAV_ITEMS.map(({ id, label }) => (
              <NavLink key={id} href={`#${id}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Info al pie del sidebar */}
          <BoxAtom p="4" className="border-t border-gray-100">
            <TextAtom variant="text-xs" className="text-gray-400 mb-2" weight="semibold">
              Átomos usados
            </TextAtom>
            {['TextAtom', 'HeaderAtom', 'LabelAtom', 'InputAtom', 'ButtonAtom', 'CheckboxAtom', 'TooltipAtom'].map((t) => (
              <BoxAtom key={t} display="flex" align="start" mb="1" className="gap-1.5">
                <div className="w-1 h-1 rounded-full bg-secondary-400 mt-1.5 flex-shrink-0" />
                <TextAtom variant="text-xs" as="span" className="text-gray-400 font-sans">
                  {t}
                </TextAtom>
              </BoxAtom>
            ))}
            <BoxAtom mt="3">
              <ButtonAtom
                intent="ghost"
                size="sm"
                onClick={() => onNavigate?.('atoms')}
                className="w-full justify-center text-xs"
              >
                ← Ver Átomos
              </ButtonAtom>
            </BoxAtom>
          </BoxAtom>
        </aside>

        {/* ── Contenido principal ── */}
        <main className="flex-1 p-8 flex flex-col gap-8 min-w-0">
          <SectionHeaderSection />
          <InputFormSection />
          <FormSection />
          <ChipsSection />
          <ColumnSection />
          <CardsSection />
          <ChatHistorySection />
          <BubbleMessageSection />
          <DropzoneFileSection />
          <MessageInputSection />
          <ChatContainerSection />
          <SidebarSection />
          <RowTableSection />
          <TableSection />
          <ModalSection />
          <AlertDialogSection />
          <CodeBlockSection />
          <MarkdownRendererSection />

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-6 pb-10 text-center">
            <TextAtom variant="text-xs" className="text-gray-400">
              ArchIA Design System — @Molecules (17) · @Organisms (1) · Atomic Design + Tailwind CSS v4 + React 19
            </TextAtom>
          </footer>
        </main>

      </BoxAtom>
    </BoxAtom>
  )
}
