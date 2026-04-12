/**
 * AtomShowcase — Storybook de revisión para los @Atoms de ArchIA
 *
 * Cada sección muestra todas las variantes, estados y props de un átomo.
 * Los CheckboxAtom son interactivos (controlados con useState).
 */

import { useState } from 'react'

/* MUI Icons — usados en los demos de ButtonAtom */
import SendIcon         from '@mui/icons-material/Send'
import AddIcon          from '@mui/icons-material/Add'
import SearchIcon       from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SettingsIcon     from '@mui/icons-material/Settings'
import DownloadIcon     from '@mui/icons-material/Download'
import CloseIcon        from '@mui/icons-material/Close'
import EditIcon         from '@mui/icons-material/Edit'

/* Atoms */
import TextAtom    from './components/atoms/TextAtom'
import HeaderAtom  from './components/atoms/HeaderAtom'
import LabelAtom   from './components/atoms/LabelAtom'
import InputAtom   from './components/atoms/InputAtom'
import ButtonAtom  from './components/atoms/ButtonAtom'
import CheckboxAtom from './components/atoms/CheckboxAtom'
import TooltipAtom from './components/atoms/TooltipAtom'
import BoxAtom     from './components/atoms/BoxAtom'

/* ================================================================
   NAV — lista de secciones para el sidebar
================================================================ */
const NAV_ITEMS = [
  { id: 'text-atom',     label: 'TextAtom' },
  { id: 'header-atom',   label: 'HeaderAtom' },
  { id: 'label-atom',    label: 'LabelAtom' },
  { id: 'input-atom',    label: 'InputAtom' },
  { id: 'button-atom',   label: 'ButtonAtom' },
  { id: 'checkbox-atom', label: 'CheckboxAtom' },
  { id: 'tooltip-atom',  label: 'TooltipAtom' },
  { id: 'box-atom',      label: 'BoxAtom' },
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

/* Tarjeta contenedora de cada átomo */
function ShowcaseSection({ id, title, description, children }) {
  return (
    <section id={id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden scroll-mt-20">
      {/* Cabecera de la sección */}
      <BoxAtom display="flex" align="start" justify="between" gap="4" px="6" py="4" className="bg-gray-25 border-b border-gray-100">
        <div>
          <TextAtom variant="display-xs" weight="semibold" className="text-gray-900">
            {title}
          </TextAtom>
          {description && (
            <TextAtom variant="text-sm" className="text-gray-500 mt-1">
              {description}
            </TextAtom>
          )}
        </div>
        <span className="text-xs font-mono bg-brand-50 text-brand-700 rounded-md px-2 py-1 border border-brand-100 flex-shrink-0 mt-1">
          @atom
        </span>
      </BoxAtom>
      {/* Contenido de la sección */}
      <BoxAtom p="6" display="flex" direction="col" gap="8">
        {children}
      </BoxAtom>
    </section>
  )
}

/* Grupo de variantes con separador con título */
function VariantGroup({ label, children, direction = 'row' }) {
  return (
    <BoxAtom display="flex" direction="col" gap="4">
      {/* Divisor con etiqueta centrada */}
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
      {/* Contenedor de items */}
      <BoxAtom
        display="flex"
        align="start"
        gap="4"
        direction={direction === 'col' ? 'col' : 'row'}
        wrap={direction !== 'col' ? 'wrap' : undefined}
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
   SECCIÓN: TextAtom
================================================================ */
function TextAtomSection() {
  return (
    <ShowcaseSection
      id="text-atom"
      title="TextAtom"
      description="Componente polimórfico base de tipografía. Consume los tokens display-* y body-* de Figma a través de clases Tailwind."
    >
      <VariantGroup label="Escala Display" direction="col">
        {[
          'display-2xl', 'display-xl', 'display-lg',
          'display-md',  'display-sm', 'display-xs',
        ].map((v) => (
          <ShowcaseItem key={v} label={`variant="${v}" weight="semibold"`}>
            <TextAtom variant={v} weight="semibold" className="text-gray-900">
              ArchIA
            </TextAtom>
          </ShowcaseItem>
        ))}
      </VariantGroup>

      <VariantGroup label="Escala Body" direction="col">
        {[
          'text-xl', 'text-lg', 'text-md', 'text-sm', 'text-xs',
        ].map((v) => (
          <ShowcaseItem key={v} label={`variant="${v}"`}>
            <TextAtom variant={v} className="text-gray-700">
              Arquitectura inteligente para proyectos modernos — Generación de diagramas con IA
            </TextAtom>
          </ShowcaseItem>
        ))}
      </VariantGroup>

      <VariantGroup label="Pesos (weight)">
        {['regular', 'medium', 'semibold', 'bold'].map((w) => (
          <ShowcaseItem key={w} label={`weight="${w}"`}>
            <TextAtom variant="text-xl" weight={w} className="text-gray-800">
              Diseña con precisión
            </TextAtom>
          </ShowcaseItem>
        ))}
      </VariantGroup>

      <VariantGroup label="Familias tipográficas (family)" direction="col">
        <ShowcaseItem label='family="serif" → Roboto Serif'>
          <TextAtom variant="text-xl" weight="medium" family="serif" className="text-gray-800">
            El sereno fluir del diseño — The serene flow of design
          </TextAtom>
        </ShowcaseItem>
        <ShowcaseItem label='family="sans" → Roboto Mono'>
          <TextAtom variant="text-xl" weight="medium" family="sans" className="text-gray-800">
            El sereno fluir del diseño — The serene flow of design
          </TextAtom>
        </ShowcaseItem>
        <ShowcaseItem label='family="mono" → JetBrains Mono'>
          <TextAtom variant="text-xl" weight="medium" family="mono" className="text-gray-800">
            El sereno fluir del diseño — The serene flow of design
          </TextAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Paleta de colores con tokens">
        {[
          { cls: 'text-brand-600',     lbl: 'text-brand-600'     },
          { cls: 'text-brand-800',     lbl: 'text-brand-800'     },
          { cls: 'text-secondary-500', lbl: 'text-secondary-500' },
          { cls: 'text-gray-500',      lbl: 'text-gray-500'      },
          { cls: 'text-gray-800',      lbl: 'text-gray-800'      },
          { cls: 'text-error-600',     lbl: 'text-error-600'     },
          { cls: 'text-success-600',   lbl: 'text-success-600'   },
          { cls: 'text-warning-600',   lbl: 'text-warning-600'   },
        ].map(({ cls, lbl }) => (
          <ShowcaseItem key={cls} label={lbl}>
            <TextAtom variant="text-md" weight="medium" className={cls}>
              Texto de ejemplo
            </TextAtom>
          </ShowcaseItem>
        ))}
      </VariantGroup>

      <VariantGroup label="Polimorfismo (as prop)">
        <ShowcaseItem label='as="h3" (explícito)'>
          <TextAtom variant="display-sm" weight="bold" as="h3" className="text-gray-900">
            Título explícito
          </TextAtom>
        </ShowcaseItem>
        <ShowcaseItem label='as="span"'>
          <TextAtom variant="text-sm" as="span" className="text-gray-600">
            Inline span
          </TextAtom>
        </ShowcaseItem>
        <ShowcaseItem label='as="code" + family="mono"'>
          <TextAtom
            variant="text-sm"
            family="mono"
            as="code"
            className="text-brand-700 bg-brand-50 px-2 py-1 rounded-sm"
          >
            npm run dev
          </TextAtom>
        </ShowcaseItem>
        <ShowcaseItem label='as="p" (default para body)'>
          <TextAtom variant="text-md" className="text-gray-700 max-w-xs">
            Párrafo con sangría automática al ser elemento de bloque.
          </TextAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: HeaderAtom
================================================================ */
function HeaderAtomSection() {
  return (
    <ShowcaseSection
      id="header-atom"
      title="HeaderAtom"
      description="Wrapper sobre TextAtom. Mapea level (1–6) a variant display y tag HTML semántico automáticamente. Sin lógica duplicada."
    >
      <VariantGroup label="Niveles de encabezado (level)" direction="col">
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const variants = ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm', 'display-xs']
          const tags     = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
          return (
            <ShowcaseItem
              key={level}
              label={`level={${level}} → <${tags[level - 1]}> + ${variants[level - 1]}`}
            >
              <HeaderAtom level={level} className="text-gray-900">
                ArchIA — Nivel {level}
              </HeaderAtom>
            </ShowcaseItem>
          )
        })}
      </VariantGroup>

      <VariantGroup label="Familias y pesos" direction="col">
        <ShowcaseItem label='level={1} weight="bold" family="serif"'>
          <HeaderAtom level={1} weight="bold" family="serif" className="text-gray-900">
            Arquitectura inteligente
          </HeaderAtom>
        </ShowcaseItem>
        <ShowcaseItem label='level={3} weight="medium" family="mono"'>
          <HeaderAtom level={3} weight="medium" family="mono" className="text-brand-700">
            generate_diagram()
          </HeaderAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Colores con tokens">
        <ShowcaseItem label="text-gray-900">
          <HeaderAtom level={4} className="text-gray-900">Análisis de requisitos</HeaderAtom>
        </ShowcaseItem>
        <ShowcaseItem label="text-brand-700">
          <HeaderAtom level={4} className="text-brand-700">Análisis de requisitos</HeaderAtom>
        </ShowcaseItem>
        <ShowcaseItem label="text-secondary-600">
          <HeaderAtom level={4} className="text-secondary-600">Análisis de requisitos</HeaderAtom>
        </ShowcaseItem>
        <ShowcaseItem label="text-gray-500">
          <HeaderAtom level={4} className="text-gray-500">Análisis de requisitos</HeaderAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: LabelAtom
================================================================ */
function LabelAtomSection() {
  return (
    <ShowcaseSection
      id="label-atom"
      title="LabelAtom"
      description="Etiqueta semántica <label> para formularios. Soporte de asterisco de campo requerido con aria-hidden para accesibilidad."
    >
      <VariantGroup label="Variantes base">
        <ShowcaseItem label="Default">
          <LabelAtom htmlFor="demo-default">Correo electrónico</LabelAtom>
        </ShowcaseItem>
        <ShowcaseItem label='required={true}'>
          <LabelAtom htmlFor="demo-required" required>Nombre completo</LabelAtom>
        </ShowcaseItem>
        <ShowcaseItem label="className personalizado">
          <LabelAtom htmlFor="demo-custom" className="text-brand-700">
            Organización
          </LabelAtom>
        </ShowcaseItem>
        <ShowcaseItem label="required + className">
          <LabelAtom htmlFor="demo-both" required className="text-gray-900">
            Contraseña
          </LabelAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="En contexto — LabelAtom + InputAtom" direction="col">
        <ShowcaseItem label="Campo simple">
          <BoxAtom display="flex" direction="col" className="gap-1.5 w-80">
            <LabelAtom htmlFor="ctx-email" required>Correo electrónico</LabelAtom>
            <InputAtom id="ctx-email" type="email" placeholder="tu@empresa.com" fullWidth />
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Campo en estado error">
          <BoxAtom display="flex" direction="col" className="gap-1.5 w-80">
            <LabelAtom htmlFor="ctx-err" required>Contraseña</LabelAtom>
            <InputAtom id="ctx-err" type="password" state="error" defaultValue="abc" fullWidth />
            <TextAtom variant="text-xs" className="text-error-600">
              La contraseña debe tener mínimo 8 caracteres.
            </TextAtom>
          </BoxAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Campo deshabilitado">
          <BoxAtom display="flex" direction="col" className="gap-1.5 w-80">
            <LabelAtom htmlFor="ctx-dis">Nombre de usuario</LabelAtom>
            <InputAtom id="ctx-dis" disabled defaultValue="archia_user_01" fullWidth />
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: InputAtom
================================================================ */
function InputAtomSection() {
  return (
    <ShowcaseSection
      id="input-atom"
      title="InputAtom"
      description="Campo de texto base. Tres ejes ortogonales: size (sm / md / lg), state (default / error / disabled) y fullWidth."
    >
      <VariantGroup label="Tamaños (size)">
        <ShowcaseItem label='size="sm"'>
          <InputAtom size="sm" placeholder="Small — 14px" />
        </ShowcaseItem>
        <ShowcaseItem label='size="md" (default)'>
          <InputAtom size="md" placeholder="Medium — 16px" />
        </ShowcaseItem>
        <ShowcaseItem label='size="lg"'>
          <InputAtom size="lg" placeholder="Large — 18px" />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estados (state)">
        <ShowcaseItem label='state="default"'>
          <InputAtom placeholder="Escribe aquí" defaultValue="Valor de ejemplo" />
        </ShowcaseItem>
        <ShowcaseItem label='state="error"'>
          <InputAtom state="error" defaultValue="Dirección inválida" />
        </ShowcaseItem>
        <ShowcaseItem label="disabled (prop nativo)">
          <InputAtom disabled defaultValue="Campo bloqueado" />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Ancho completo (fullWidth)" direction="col">
        <ShowcaseItem label='fullWidth={true} size="md"'>
          <InputAtom fullWidth placeholder="Este input ocupa el 100% del contenedor padre" />
        </ShowcaseItem>
        <ShowcaseItem label='fullWidth size="lg" state="error"'>
          <InputAtom fullWidth size="lg" state="error" defaultValue="URL de repositorio inválida" />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Tipos de input nativos (type)">
        <ShowcaseItem label='type="email"'>
          <InputAtom type="email" placeholder="usuario@email.com" />
        </ShowcaseItem>
        <ShowcaseItem label='type="password"'>
          <InputAtom type="password" defaultValue="contraseña123" />
        </ShowcaseItem>
        <ShowcaseItem label='type="search"'>
          <InputAtom type="search" placeholder="Buscar proyectos…" />
        </ShowcaseItem>
        <ShowcaseItem label='type="number"'>
          <InputAtom type="number" placeholder="0" style={{ width: '100px' }} />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Combinaciones size × state">
        <ShowcaseItem label='sm + error'>
          <InputAtom size="sm" state="error" placeholder="Error pequeño" />
        </ShowcaseItem>
        <ShowcaseItem label='md + default'>
          <InputAtom size="md" placeholder="Mediano default" />
        </ShowcaseItem>
        <ShowcaseItem label='lg + disabled'>
          <InputAtom size="lg" disabled defaultValue="Grande deshabilitado" />
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: ButtonAtom
================================================================ */
function ButtonAtomSection() {
  return (
    <ShowcaseSection
      id="button-atom"
      title="ButtonAtom"
      description="Botón polimórfico. 3 variantes de layout (text / icon / text-icon) × 4 intents (primary / secondary / ghost / danger) × 3 tamaños (sm / md / lg)."
    >
      {/* ── Intents ── */}
      <VariantGroup label='Intents — variant="text" size="md"'>
        <ShowcaseItem label='intent="primary"'>
          <ButtonAtom intent="primary">Crear proyecto</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="secondary"'>
          <ButtonAtom intent="secondary">Cancelar</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="ghost"'>
          <ButtonAtom intent="ghost">Ver más</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="danger"'>
          <ButtonAtom intent="danger">Eliminar</ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Tamaños ── */}
      <VariantGroup label='Tamaños (size) — intent="primary" variant="text"'>
        <ShowcaseItem label='size="xs" (nuevo)'>
          <ButtonAtom intent="primary" size="xs">Compact</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="sm"'>
          <ButtonAtom intent="primary" size="sm">Acción pequeña</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="md" (default)'>
          <ButtonAtom intent="primary" size="md">Acción mediana</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="lg"'>
          <ButtonAtom intent="primary" size="lg">Acción grande</ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── xs icon (sidebar & MessageInput) ── */}
      <VariantGroup label='size="xs" variant="icon" — compacto para sidebar y MessageInput'>
        <ShowcaseItem label='intent="ghost" xs'>
          <ButtonAtom variant="icon" intent="ghost" size="xs" aria-label="Configurar">
            <SettingsIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="primary" xs'>
          <ButtonAtom variant="icon" intent="primary" size="xs" aria-label="Enviar">
            <SendIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="secondary" xs'>
          <ButtonAtom variant="icon" intent="secondary" size="xs" aria-label="Agregar">
            <AddIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="danger" xs'>
          <ButtonAtom variant="icon" intent="danger" size="xs" aria-label="Eliminar">
            <DeleteOutlineIcon />
          </ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Icon only ── */}
      <VariantGroup label='variant="icon" — cuadrado, solo icono'>
        <ShowcaseItem label='intent="primary"'>
          <ButtonAtom variant="icon" intent="primary" aria-label="Agregar">
            <AddIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="secondary"'>
          <ButtonAtom variant="icon" intent="secondary" aria-label="Buscar">
            <SearchIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="ghost"'>
          <ButtonAtom variant="icon" intent="ghost" aria-label="Configurar">
            <SettingsIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="danger"'>
          <ButtonAtom variant="icon" intent="danger" aria-label="Eliminar">
            <DeleteOutlineIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="xs"'>
          <ButtonAtom variant="icon" intent="ghost" size="xs" aria-label="Cerrar">
            <CloseIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="sm"'>
          <ButtonAtom variant="icon" intent="ghost" size="sm" aria-label="Cerrar">
            <CloseIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="md"'>
          <ButtonAtom variant="icon" intent="primary" size="md" aria-label="Descargar">
            <DownloadIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="lg"'>
          <ButtonAtom variant="icon" intent="secondary" size="lg" aria-label="Editar">
            <EditIcon />
          </ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Text + Icon ── */}
      <VariantGroup label='variant="text-icon" — texto con icono'>
        <ShowcaseItem label='iconPosition="leading" intent="primary"'>
          <ButtonAtom variant="text-icon" intent="primary" icon={<SendIcon />}>
            Enviar mensaje
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='iconPosition="trailing" intent="ghost"'>
          <ButtonAtom
            variant="text-icon"
            intent="ghost"
            iconPosition="trailing"
            icon={<ChevronRightIcon />}
          >
            Ver proyectos
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="secondary" + icono'>
          <ButtonAtom variant="text-icon" intent="secondary" icon={<EditIcon />}>
            Editar
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='intent="danger" + icono'>
          <ButtonAtom variant="text-icon" intent="danger" icon={<DeleteOutlineIcon />}>
            Eliminar proyecto
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="sm" intent="primary"'>
          <ButtonAtom variant="text-icon" intent="primary" size="sm" icon={<AddIcon />}>
            Agregar
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='size="lg" intent="secondary"'>
          <ButtonAtom variant="text-icon" intent="secondary" size="lg" icon={<DownloadIcon />}>
            Descargar reporte
          </ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Disabled ── */}
      <VariantGroup label="Estado disabled — todas las variantes">
        <ShowcaseItem label='text + primary + disabled'>
          <ButtonAtom intent="primary" disabled>Procesando…</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='text + secondary + disabled'>
          <ButtonAtom intent="secondary" disabled>No disponible</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='text + ghost + disabled'>
          <ButtonAtom intent="ghost" disabled>Sin acceso</ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='icon + primary + disabled'>
          <ButtonAtom variant="icon" intent="primary" disabled aria-label="Agregar">
            <AddIcon />
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='text-icon + primary + disabled'>
          <ButtonAtom variant="text-icon" intent="primary" icon={<SendIcon />} disabled>
            Enviando…
          </ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Polimorfismo ── */}
      <VariantGroup label='Polimorfismo (as) — renderizado como otro elemento HTML'>
        <ShowcaseItem label='as="a" intent="ghost" → enlace de navegación'>
          <ButtonAtom
            as="a"
            href="#top"
            intent="ghost"
            variant="text-icon"
            iconPosition="trailing"
            icon={<ChevronRightIcon />}
          >
            Volver al inicio
          </ButtonAtom>
        </ShowcaseItem>
        <ShowcaseItem label='as="a" intent="primary" → CTA tipo enlace'>
          <ButtonAtom as="a" href="#button-atom" intent="primary">
            Ancla interna
          </ButtonAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: CheckboxAtom
================================================================ */
function CheckboxAtomSection() {
  /* Estados individuales */
  const [basic,  setBasic]  = useState(false)
  const [terms,  setTerms]  = useState(true)

  /* Patrón Select All */
  const [items, setItems] = useState([false, true, false])
  const allChecked  = items.every(Boolean)
  const someChecked = items.some(Boolean)

  const toggleAll  = () => setItems(items.map(() => !allChecked))
  const toggleItem = (i) => {
    const next = [...items]
    next[i] = !next[i]
    setItems(next)
  }

  return (
    <ShowcaseSection
      id="checkbox-atom"
      title="CheckboxAtom"
      description="Checkbox con overlay Tailwind peer. Input nativo opacity-0 pero completamente interactivo. Soporta checked, indeterminate y disabled. Recomendado: siempre controlado."
    >
      <VariantGroup label="Estados base (interactivos — haz click)">
        <ShowcaseItem label="unchecked → checked al hacer click">
          <CheckboxAtom
            checked={basic}
            onChange={(e) => setBasic(e.target.checked)}
            label="Opción desmarcada"
          />
        </ShowcaseItem>
        <ShowcaseItem label="checked → unchecked al hacer click">
          <CheckboxAtom
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            label="Acepto los términos"
          />
        </ShowcaseItem>
        <ShowcaseItem label="disabled + unchecked">
          <CheckboxAtom
            checked={false}
            onChange={() => {}}
            disabled
            label="No disponible"
          />
        </ShowcaseItem>
        <ShowcaseItem label="disabled + checked">
          <CheckboxAtom
            checked={true}
            onChange={() => {}}
            disabled
            label="Opción bloqueada activa"
          />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Estado indeterminate — patrón Select All" direction="col">
        <ShowcaseItem label="Seleccionar todos / algunos (interactivo)">
          <BoxAtom p="4" display="flex" direction="col" rounded="lg" bg="gray-50" className="gap-3 w-72 border border-gray-200">
            {/* Master checkbox */}
            <CheckboxAtom
              checked={allChecked}
              indeterminate={someChecked && !allChecked}
              onChange={toggleAll}
              label="Seleccionar todos los proyectos"
            />
            {/* Divider */}
            <div className="border-t border-gray-200" />
            {/* Child checkboxes */}
            <BoxAtom display="flex" direction="col" pl="2" gap="2">
              {['Proyecto Alpha', 'Proyecto Beta', 'Proyecto Gamma'].map((name, i) => (
                <CheckboxAtom
                  key={name}
                  checked={items[i]}
                  onChange={() => toggleItem(i)}
                  label={name}
                />
              ))}
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>

        {/* Estado forzado para ver el visual estático */}
        <ShowcaseItem label="indeterminate={true} — visual estático (no interactivo)">
          <CheckboxAtom
            checked={false}
            indeterminate={true}
            onChange={() => {}}
            label="Algunos seleccionados (forzado)"
          />
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Con contenido rico (children en lugar de label)">
        <ShowcaseItem label="children con enlace">
          <CheckboxAtom
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          >
            Acepto la{' '}
            <a href="#checkbox-atom" className="text-brand-600 underline hover:text-brand-700">
              política de privacidad
            </a>
            {' '}y los{' '}
            <a href="#checkbox-atom" className="text-brand-600 underline hover:text-brand-700">
              términos de servicio
            </a>
          </CheckboxAtom>
        </ShowcaseItem>
      </VariantGroup>

      <VariantGroup label="Sin etiqueta — solo el control visual">
        <ShowcaseItem label="aria-label para accesibilidad del lector de pantalla">
          <CheckboxAtom
            checked={basic}
            onChange={(e) => setBasic(e.target.checked)}
            aria-label="Seleccionar fila"
          />
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: TooltipAtom
================================================================ */
function TooltipAtomSection() {
  return (
    <ShowcaseSection
      id="tooltip-atom"
      title="TooltipAtom"
      description="Contenedor flotante CSS-only. Envuelve cualquier hijo y muestra una etiqueta al hacer hover. 4 posiciones: top / right / bottom / left."
    >
      {/* ── Posiciones ── */}
      <VariantGroup label="Posiciones — hover para activar">
        <ShowcaseItem label='position="top" (default)'>
          <TooltipAtom content="Esto es un tooltip top" position="top">
            <ButtonAtom intent="secondary" size="sm">Hover top</ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label='position="right"'>
          <TooltipAtom content="Tooltip a la derecha" position="right">
            <ButtonAtom intent="secondary" size="sm">Hover right</ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label='position="bottom"'>
          <TooltipAtom content="Tooltip abajo" position="bottom">
            <ButtonAtom intent="secondary" size="sm">Hover bottom</ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label='position="left"'>
          <TooltipAtom content="Tooltip a la izquierda" position="left">
            <ButtonAtom intent="secondary" size="sm">Hover left</ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Distintos triggers ── */}
      <VariantGroup label="Triggers variados — polimorfismo">
        <ShowcaseItem label="Sobre ButtonAtom icon">
          <TooltipAtom content="Configuración" position="top">
            <ButtonAtom variant="icon" intent="ghost" size="md" aria-label="Configurar">
              <SettingsIcon />
            </ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sobre ButtonAtom icon xs (sidebar)">
          <TooltipAtom content="Eliminar elemento" position="right">
            <ButtonAtom variant="icon" intent="danger" size="xs" aria-label="Eliminar">
              <DeleteOutlineIcon />
            </ButtonAtom>
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sobre CheckboxAtom">
          <TooltipAtom content="Marcar como completado" position="top">
            <CheckboxAtom checked={false} onChange={() => {}} label="Tarea pendiente" />
          </TooltipAtom>
        </ShowcaseItem>
        <ShowcaseItem label="Sobre TextAtom">
          <TooltipAtom content="Información adicional sobre este texto" position="bottom">
            <TextAtom variant="text-sm" className="text-brand-600 underline cursor-help">
              ¿Qué es Atomic Design?
            </TextAtom>
          </TooltipAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Caso de uso real: sidebar colapsado ── */}
      <VariantGroup label="Caso de uso — simulación sidebar colapsado">
        <ShowcaseItem label="Ítem de nav con solo icono">
          <BoxAtom display="flex" direction="col" gap="2" bg="white" rounded="md" p="3" className="w-14 border border-gray-200">
            {[
              { icon: <SettingsIcon />, label: 'Configuración' },
              { icon: <SearchIcon />,   label: 'Buscar' },
              { icon: <EditIcon />,     label: 'Editar' },
            ].map(({ icon, label }) => (
              <TooltipAtom key={label} content={label} position="right">
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-700 [&_svg]:w-5 [&_svg]:h-5 transition-colors"
                  aria-label={label}
                >
                  {icon}
                </button>
              </TooltipAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   SECCIÓN: BoxAtom
================================================================ */
function BoxSection() {
  return (
    <ShowcaseSection
      id="box-atom"
      title="BoxAtom"
      description="Primitiva universal de layout. Reemplaza contenedores <div> crudos exponiendo display, spacing, sizing y propiedades visuales como props resueltas a clases del design system."
    >
      {/* ── Flex row ── */}
      <VariantGroup label="Flex row — toolbar / header">
        <ShowcaseItem label='display="flex" align="center" justify="between" gap="4"'>
          <BoxAtom
            display="flex"
            align="center"
            justify="between"
            gap="4"
            px="4"
            py="3"
            rounded="md"
            border="gray-200"
            bg="gray-25"
            className="w-80"
          >
            <TextAtom variant="text-sm" weight="medium" className="text-gray-700">
              Proyecto Alpha
            </TextAtom>
            <ButtonAtom intent="primary" size="sm">
              Abrir
            </ButtonAtom>
          </BoxAtom>
        </ShowcaseItem>

        <ShowcaseItem label='display="flex" align="center" gap="3" — fila de chips'>
          <BoxAtom display="flex" align="center" gap="3">
            {['React', 'Tailwind', 'Vite'].map((tag) => (
              <BoxAtom
                key={tag}
                px="3"
                py="1"
                rounded="full"
                bg="brand-50"
                border="brand-300"
              >
                <TextAtom variant="text-xs" weight="medium" className="text-brand-700">
                  {tag}
                </TextAtom>
              </BoxAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Flex column — card ── */}
      <VariantGroup label="Flex column — card wrapper">
        <ShowcaseItem label='direction="col" gap="3" p="6" rounded="lg" shadow="md"'>
          <BoxAtom
            display="flex"
            direction="col"
            gap="3"
            p="6"
            rounded="lg"
            shadow="md"
            bg="white"
            border="gray-200"
            className="w-72"
          >
            <HeaderAtom level={4} className="text-gray-900">
              Diagrama de secuencia
            </HeaderAtom>
            <TextAtom variant="text-sm" className="text-gray-500">
              Generado a partir de la descripción del flujo de autenticación OAuth 2.0.
            </TextAtom>
            <BoxAtom display="flex" justify="end" gap="2" mt="2">
              <ButtonAtom intent="ghost" size="sm">Descartar</ButtonAtom>
              <ButtonAtom intent="primary" size="sm">Guardar</ButtonAtom>
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>

        <ShowcaseItem label='direction="col" gap="2" p="4" rounded="md" bg="gray-25"'>
          <BoxAtom
            display="flex"
            direction="col"
            gap="2"
            p="4"
            rounded="md"
            bg="gray-25"
            border="gray-200"
            className="w-64"
          >
            <TextAtom variant="text-xs" weight="semibold" className="text-gray-500 uppercase">
              Estado del proyecto
            </TextAtom>
            {[
              { label: 'Análisis',    color: 'text-success-600' },
              { label: 'Diseño',      color: 'text-brand-600'   },
              { label: 'Desarrollo',  color: 'text-warning-600' },
            ].map(({ label, color }) => (
              <BoxAtom key={label} display="flex" align="center" justify="between">
                <TextAtom variant="text-sm" className="text-gray-700">{label}</TextAtom>
                <TextAtom variant="text-xs" weight="medium" className={color}>●</TextAtom>
              </BoxAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Scroll container pattern ── */}
      <VariantGroup label="Contenedor scroll — patrón flex-1 min-h-0">
        <ShowcaseItem label='h="full" → flex-1 + overflow="y-auto"'>
          <BoxAtom
            display="flex"
            direction="col"
            border="gray-200"
            rounded="md"
            className="h-48 w-64"
          >
            {/* Header fijo */}
            <BoxAtom
              px="4"
              py="3"
              border="default"
              bg="gray-25"
              className="border-b"
            >
              <TextAtom variant="text-sm" weight="semibold" className="text-gray-700">
                Historial
              </TextAtom>
            </BoxAtom>
            {/* Área scrollable */}
            <BoxAtom flex="1" minH="0" overflow="y-auto" py="2" px="3">
              {Array.from({ length: 8 }, (_, i) => (
                <BoxAtom key={i} py="2" border="default" className="border-b last:border-b-0">
                  <TextAtom variant="text-xs" className="text-gray-600">
                    Mensaje {i + 1} — contenido del chat
                  </TextAtom>
                </BoxAtom>
              ))}
            </BoxAtom>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── Centrado con maxW ── */}
      <VariantGroup label="Centrado con maxW — layout de página" direction="col">
        <ShowcaseItem label='mx="auto" maxW="md" px="6" py="4"'>
          <BoxAtom
            mx="auto"
            maxW="md"
            px="6"
            py="4"
            rounded="lg"
            bg="brand-25"
            border="brand-300"
          >
            <TextAtom variant="text-sm" className="text-brand-700 text-center">
              Contenido centrado con ancho máximo — max-w-md
            </TextAtom>
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>

      {/* ── as semántico ── */}
      <VariantGroup label='Polimorfismo (as) — etiquetas HTML semánticas'>
        <ShowcaseItem label='as="section"'>
          <BoxAtom
            as="section"
            display="flex"
            direction="col"
            gap="2"
            p="4"
            rounded="md"
            border="gray-200"
            className="w-56"
          >
            <TextAtom variant="text-xs" weight="semibold" className="text-gray-500 uppercase">
              section
            </TextAtom>
            <TextAtom variant="text-sm" className="text-gray-700">
              Contenido semántico de sección
            </TextAtom>
          </BoxAtom>
        </ShowcaseItem>

        <ShowcaseItem label='as="nav"'>
          <BoxAtom
            as="nav"
            display="flex"
            direction="col"
            gap="1"
            p="3"
            rounded="md"
            border="gray-200"
            bg="white"
            className="w-40"
          >
            {['Inicio', 'Proyectos', 'Ajustes'].map((item) => (
              <TextAtom key={item} variant="text-sm" className="text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 cursor-pointer">
                {item}
              </TextAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>

        <ShowcaseItem label='as="ul" + li'>
          <BoxAtom
            as="ul"
            display="flex"
            direction="col"
            gap="1"
            p="3"
            rounded="md"
            border="gray-200"
            className="w-48"
          >
            {['Alpha', 'Beta', 'Gamma'].map((name) => (
              <BoxAtom key={name} as="li" display="flex" align="center" gap="2" py="1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                <TextAtom variant="text-sm" className="text-gray-700">{name}</TextAtom>
              </BoxAtom>
            ))}
          </BoxAtom>
        </ShowcaseItem>
      </VariantGroup>
    </ShowcaseSection>
  )
}

/* ================================================================
   COMPONENTE PRINCIPAL: AtomShowcase
================================================================ */
export default function AtomShowcase({ onNavigate }) {
  return (
    <BoxAtom id="top" bg="gray-50" className="min-h-screen">

      {/* ── Barra superior ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-xs h-16 flex items-center px-8 gap-4">
        <div className="flex items-baseline gap-2">
          <TextAtom variant="display-xs" weight="bold" family="serif" className="text-brand-700">
            ArchIA
          </TextAtom>
          <TextAtom variant="text-xs" weight="medium" as="span" className="text-gray-400">
            Design System
          </TextAtom>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <TextAtom variant="text-xs" as="span" className="text-gray-500">
          @Atoms — Storybook de revisión
        </TextAtom>
        <BoxAtom display="flex" align="center" gap="3" className="ml-auto">
          <ButtonAtom
            as="button"
            intent="ghost"
            size="sm"
            onClick={() => onNavigate?.('molecules')}
          >
            Ver Moléculas →
          </ButtonAtom>
        </BoxAtom>
        <BoxAtom display="flex" align="center" gap="3" className="ml-auto">
          <ButtonAtom
            as="button"
            intent="ghost"
            size="sm"
            onClick={() => onNavigate?.('demo')}
          >
            Ver Demo →
          </ButtonAtom>
        </BoxAtom>
      </header>

      <BoxAtom display="flex" mx="auto" className="max-w-screen-xl">

        {/* ── Sidebar nav ── */}
        <aside className="w-56 flex-shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white">
          <nav className="p-4 flex flex-col gap-1">
            <TextAtom
              variant="text-xs"
              weight="semibold"
              as="p"
              className="text-gray-400 uppercase px-3 pt-2 pb-3"
            >
              Átomos
            </TextAtom>
            {NAV_ITEMS.map(({ id, label }) => (
              <NavLink key={id} href={`#${id}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Info de tokens al pie del sidebar */}
          <BoxAtom p="4" className="border-t border-gray-100">
            <TextAtom variant="text-xs" className="text-gray-400 mb-2" weight="semibold">
              Tokens disponibles
            </TextAtom>
            {[
              'gray · 25–900',
              'brand · 25–900',
              'secondary · 25–900',
              'error / warning / success',
              'display-{2xl…xs}',
              'body-{xl…xs}',
              'shadow-{xs…3xl}',
              'rounded-{sm|md|lg|full}',
            ].map((t) => (
              <BoxAtom key={t} display="flex" align="start" className="gap-1.5 mb-1">
                <div className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                <TextAtom variant="text-xs" as="span" className="text-gray-400 font-sans">
                  {t}
                </TextAtom>
              </BoxAtom>
            ))}
            <BoxAtom mt="3">
              <ButtonAtom
                intent="ghost"
                size="sm"
                onClick={() => onNavigate?.('molecules')}
                className="w-full justify-center text-xs"
              >
                Ver Moléculas →
              </ButtonAtom>
            </BoxAtom>
          </BoxAtom>
        </aside>

        {/* ── Contenido principal ── */}
        <main className="flex-1 p-8 flex flex-col gap-8 min-w-0">
          <TextAtomSection />
          <HeaderAtomSection />
          <LabelAtomSection />
          <InputAtomSection />
          <ButtonAtomSection />
          <CheckboxAtomSection />
          <TooltipAtomSection />
          <BoxSection />

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-6 pb-10 text-center">
            <TextAtom variant="text-xs" className="text-gray-400">
              ArchIA Design System — @Atoms · Atomic Design + Tailwind CSS v4 + React 19
            </TextAtom>
          </footer>
        </main>

      </BoxAtom>
    </BoxAtom>
  )
}
