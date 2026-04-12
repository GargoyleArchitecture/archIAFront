/**
 * <SectionHeader /> — Cabecera de sección o página
 *
 * Agrupa un título (HeaderAtom), una descripción opcional (TextAtom)
 * y un slot de acción alineado a la derecha (cualquier ReactNode).
 *
 * Props:
 *   title     — string     Texto del encabezado (obligatorio)
 *   subtitle  — string     Texto descriptivo debajo del título
 *   action    — ReactNode  Elemento a la derecha (ej: ButtonAtom)
 *   level     — 1–6        Nivel del heading (default 2)
 *   className — string     Clases adicionales para el wrapper
 */

import BoxAtom    from '../atoms/BoxAtom'
import HeaderAtom from '../atoms/HeaderAtom'
import TextAtom   from '../atoms/TextAtom'

export default function SectionHeader({
  title,
  subtitle,
  action,
  level     = 2,
  className = '',
  ...props
}) {
  return (
    <BoxAtom display="flex" align="start" justify="between" gap="4" className={className} {...props}>
      {/* Columna de texto */}
      <BoxAtom display="flex" direction="col" gap="1" className="min-w-0">
        <HeaderAtom level={level} weight="semibold" className="text-gray-900">
          {title}
        </HeaderAtom>
        {subtitle && (
          <TextAtom variant="text-md" className="text-gray-500">
            {subtitle}
          </TextAtom>
        )}
      </BoxAtom>

      {/* Slot de acción */}
      {action && (
        <BoxAtom display="flex" align="center" shrink="0" mt="1">
          {action}
        </BoxAtom>
      )}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Sección simple sin acción
   <SectionHeader
     title="Proyectos recientes"
     subtitle="Tus últimos 10 proyectos de arquitectura"
   />

   // Con botón de acción
   import AddIcon from '@mui/icons-material/Add'
   <SectionHeader
     title="Diagrama de microservicios"
     subtitle="Vista general del sistema"
     action={
       <ButtonAtom variant="text-icon" intent="primary" icon={<AddIcon />}>
         Nuevo nodo
       </ButtonAtom>
     }
   />

   // Como h1 en una página
   <SectionHeader
     level={1}
     title="Panel de control"
     subtitle="Gestiona tus proyectos y conversaciones"
   />
---------------------------------------------------------------- */
