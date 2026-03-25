/**
 * <Cards /> — Tarjeta de contenido con 3 variantes de layout
 *
 * Props:
 *   variant     — 'titled' | 'text' | 'image'
 *   title       — string    Título de la tarjeta
 *   description — string    Texto descriptivo
 *   image       — string    URL de imagen (solo variant="image")
 *   imageAlt    — string    Alt text de la imagen
 *   icon        — ReactNode Icono en la banda de cabecera (solo "titled")
 *   tag         — string    Etiqueta pequeña sobre el título
 *   actions     — ReactNode Slot de acciones en el pie de la tarjeta
 *   onClick     — function  Hace la tarjeta clicable (sombra en hover)
 *   className   — string    Clases adicionales
 *
 * Variantes:
 *   titled — Banda de gradiente con icono + contenido + acciones
 *   text   — Solo contenido textual, sin cabecera visual
 *   image  — Imagen aspect-video en la parte superior
 */

import BoxAtom    from '../atoms/BoxAtom'
import HeaderAtom from '../atoms/HeaderAtom'
import TextAtom   from '../atoms/TextAtom'

/* ----------------------------------------------------------------
   Clases base compartidas por las 3 variantes
---------------------------------------------------------------- */
const BASE_CARD   = 'bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col shadow-sm transition-shadow duration-150'
const INTERACTIVE = 'cursor-pointer hover:shadow-md'

/* ================================================================
   Sub-componentes internos (no exportados)
================================================================ */

function TitledCard({ title, description, icon, tag, actions, onClick, className }) {
  return (
    <div
      className={[BASE_CARD, onClick ? INTERACTIVE : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {/* Banda de cabecera con gradiente brand */}
      <BoxAtom display="flex" align="center" gap="3" px="6" py="5" className="bg-gradient-linear-90-600-500">
        {icon && (
          <BoxAtom display="flex" align="center" justify="center" rounded="md" shrink="0" className="w-10 h-10 bg-white/20 text-white [&_svg]:w-5 [&_svg]:h-5">
            {icon}
          </BoxAtom>
        )}
        {tag && (
          <span className="text-body-xs font-medium text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">
            {tag}
          </span>
        )}
      </BoxAtom>

      {/* Contenido */}
      <BoxAtom p="6" display="flex" direction="col" gap="2" className="flex-1">
        {title && (
          <HeaderAtom level={4} weight="semibold" className="text-gray-900 hyphens-auto break-words">
            {title}
          </HeaderAtom>
        )}
        {description && (
          <TextAtom variant="text-sm" className="text-gray-500 break-words">
            {description}
          </TextAtom>
        )}
      </BoxAtom>

      {/* Footer de acciones */}
      {actions && (
        <BoxAtom display="flex" align="center" gap="2" px="5" pb="5" pt="3" className="border-t border-gray-100">
          {actions}
        </BoxAtom>
      )}
    </div>
  )
}

function TextCard({ title, description, tag, actions, onClick, className }) {
  return (
    <div
      className={[BASE_CARD, onClick ? INTERACTIVE : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <BoxAtom p="6" display="flex" direction="col" gap="2" className="flex-1">
        {tag && (
          <span className="text-body-xs font-semibold text-brand-600 uppercase">
            {tag}
          </span>
        )}
        {title && (
          <HeaderAtom level={4} weight="semibold" className="text-gray-900 hyphens-auto break-words">
            {title}
          </HeaderAtom>
        )}
        {description && (
          <TextAtom variant="text-sm" className="text-gray-500 break-words">
            {description}
          </TextAtom>
        )}
      </BoxAtom>

      {actions && (
        <BoxAtom display="flex" align="center" gap="2" px="6" pb="6" pt="4" className="border-t border-gray-100">
          {actions}
        </BoxAtom>
      )}
    </div>
  )
}

function ImageCard({ title, description, image, imageAlt = '', tag, actions, onClick, className }) {
  return (
    <div
      className={[BASE_CARD, onClick ? INTERACTIVE : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {/* Imagen con fallback de gradiente */}
      <BoxAtom overflow="hidden" bg="gray-100" shrink="0" className="aspect-video w-full">
        {image
          ? <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
          : (
            <BoxAtom display="flex" align="center" justify="center" className="w-full h-full bg-gradient-linear-90-600-500">
              <TextAtom variant="display-md" weight="bold" className="text-white opacity-40 select-none">
                {title?.[0]?.toUpperCase() ?? '?'}
              </TextAtom>
            </BoxAtom>
          )
        }
      </BoxAtom>

      {/* Contenido */}
      <BoxAtom p="5" display="flex" direction="col" gap="2" className="flex-1">
        {tag && (
          <TextAtom variant="text-xs" weight="semibold" className="text-brand-600 uppercase">
            {tag}
          </TextAtom>
        )}
        {title && (
          <HeaderAtom level={4} weight="semibold" className="text-gray-900 hyphens-auto break-words">
            {title}
          </HeaderAtom>
        )}
        {description && (
          <TextAtom variant="text-sm" className="text-gray-500 break-words">
            {description}
          </TextAtom>
        )}
      </BoxAtom>

      {actions && (
        <BoxAtom display="flex" align="center" gap="2" px="5" pb="5" pt="3" className="border-t border-gray-100">
          {actions}
        </BoxAtom>
      )}
    </div>
  )
}

/* ================================================================
   Componente principal — despacha al sub-componente correcto
================================================================ */
export default function Cards({ variant = 'text', ...props }) {
  if (variant === 'titled') return <TitledCard {...props} />
  if (variant === 'image')  return <ImageCard  {...props} />
  return <TextCard {...props} />
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Tarjeta titled con icono
   import ArchitectureIcon from '@mui/icons-material/Architecture'
   <Cards
     variant="titled"
     title="Microservicios"
     description="Patrón de arquitectura distribuida basado en servicios independientes."
     icon={<ArchitectureIcon />}
     tag="Patrón"
     actions={<ButtonAtom intent="secondary" size="sm">Ver más</ButtonAtom>}
     onClick={() => navigate('/patterns/microservices')}
   />

   // Tarjeta de texto con acción
   <Cards
     variant="text"
     tag="Tutorial"
     title="Introducción a Domain-Driven Design"
     description="Aprende los principios fundamentales del DDD y cómo aplicarlos."
     actions={<ButtonAtom intent="ghost" size="sm">Leer</ButtonAtom>}
   />

   // Tarjeta de imagen
   <Cards
     variant="image"
     title="Proyecto E-commerce"
     description="Arquitectura basada en microservicios con API Gateway."
     image="https://example.com/diagram.png"
     tag="En progreso"
     onClick={() => openProject(id)}
   />
---------------------------------------------------------------- */
