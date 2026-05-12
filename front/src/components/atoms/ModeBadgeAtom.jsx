/**
 * <ModeBadgeAtom /> — Indicador visual del modo activo
 *
 * Pieza pequeña (chip) que muestra el modo de interacción (Tutor o
 * Profesional) con un icono + label. Diseñada para colocarse al lado
 * de un mensaje, en topbars, o como decoración inline.
 *
 * El componente acepta el `mode` como prop explícito en lugar de
 * leerlo del context — esto permite usarlo en tooltips o snapshots
 * que muestran "lo que sería el otro modo" sin ambigüedad.
 *
 * Props:
 *   mode      — 'tutor' | 'professional'  (requerido)
 *   size      — 'sm' | 'md' | 'lg'        (default: 'md')
 *   showLabel — bool                       (default: true)
 *   className — string                     Clases extra para el wrapper
 *
 * Accesibilidad:
 *   - role="status" + aria-label descriptivo en español.
 *   - El icono lleva aria-hidden (es decorativo; el texto del label
 *     ya describe el estado).
 */

import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'

const SIZE_CLASS = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-md px-3 py-1.5 gap-2',
}

const ICON_PX = {
  sm: 14,
  md: 16,
  lg: 18,
}

const MODE_CONFIG = {
  tutor: {
    Icon: SchoolOutlinedIcon,
    label: 'Tutor',
    style: {
      backgroundColor: 'var(--color-secondary-100)',
      color: 'var(--color-secondary-900)',
      borderColor: 'var(--color-secondary-300)',
    },
  },
  professional: {
    Icon: CodeOutlinedIcon,
    label: 'Profesional',
    style: {
      backgroundColor: 'var(--color-brand-100)',
      color: 'var(--color-brand-900)',
      borderColor: 'var(--color-brand-300)',
    },
  },
}

export default function ModeBadgeAtom({
  mode,
  size = 'md',
  showLabel = true,
  className = '',
  ...props
}) {
  const config = MODE_CONFIG[mode]
  if (!config) return null

  const { Icon, label, style } = config

  return (
    <span
      role="status"
      aria-label={`Modo ${label} activo`}
      style={{ ...style, borderWidth: '1px', borderStyle: 'solid' }}
      className={[
        'inline-flex items-center rounded-full font-medium font-sans whitespace-nowrap',
        SIZE_CLASS[size],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <Icon style={{ fontSize: ICON_PX[size] }} aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </span>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   <ModeBadgeAtom mode="tutor" />
   <ModeBadgeAtom mode="professional" size="sm" />
   <ModeBadgeAtom mode="tutor" size="lg" showLabel={false} />

   // Junto al mensaje del agente:
   <BubbleMessage variant="ai">
     <ModeBadgeAtom mode={msg.mode} size="sm" className="mb-2" />
     <MarkdownRenderer content={msg.content} />
   </BubbleMessage>
---------------------------------------------------------------- */
