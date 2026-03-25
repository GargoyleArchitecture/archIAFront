/**
 * <AlertDialog /> — Diálogo de confirmación con intent semántico
 *
 * Compone <Modal size="sm"> con un cuerpo centrado (ícono + título +
 * descripción) y un footer con botones Cancelar / Confirmar.
 * El intent controla el ícono, los colores y el estilo del botón de
 * confirmación.
 *
 * Props:
 *   isOpen        — bool        Controla la visibilidad
 *   onClose       — function    Llamado al cancelar o cerrar
 *   onConfirm     — function    Llamado al confirmar
 *   intent        — 'warning' | 'danger' | 'info' | 'success'
 *   title         — string      Título del diálogo
 *   description   — string      Texto de apoyo bajo el título
 *   confirmLabel  — string      Texto del botón de confirmación  (default: 'Confirmar')
 *   cancelLabel   — string      Texto del botón de cancelación   (default: 'Cancelar')
 *   isLoading     — bool        Deshabilita botones durante operación async
 */

import WarningAmberIcon      from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon      from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import Modal      from './Modal'
import BoxAtom    from '../atoms/BoxAtom'
import ButtonAtom from '../atoms/ButtonAtom'
import TextAtom   from '../atoms/TextAtom'

/* ----------------------------------------------------------------
   Mapeo intent → apariencia
---------------------------------------------------------------- */
const ICON_BG = {
  warning: 'bg-warning-100',
  danger:  'bg-error-100',
  info:    'bg-brand-100',
  success: 'bg-success-100',
}

const ICON_COLOR = {
  warning: 'text-warning-600',
  danger:  'text-error-600',
  info:    'text-brand-600',
  success: 'text-success-600',
}

const BTN_INTENT = {
  warning: 'primary',
  danger:  'danger',
  info:    'primary',
  success: 'primary',
}

const ICON_COMPONENT = {
  warning: WarningAmberIcon,
  danger:  ErrorOutlineIcon,
  info:    InfoOutlinedIcon,
  success: CheckCircleOutlineIcon,
}

export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  intent       = 'warning',
  title        = '¿Estás seguro?',
  description  = '',
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  isLoading    = false,
}) {
  const Icon       = ICON_COMPONENT[intent] ?? WarningAmberIcon
  const iconBg     = ICON_BG[intent]    ?? ICON_BG.warning
  const iconColor  = ICON_COLOR[intent] ?? ICON_COLOR.warning
  const btnIntent  = BTN_INTENT[intent] ?? 'primary'

  const footer = (
    <>
      <ButtonAtom
        intent="ghost"
        size="md"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelLabel}
      </ButtonAtom>
      <ButtonAtom
        intent={btnIntent}
        size="md"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'Cargando…' : confirmLabel}
      </ButtonAtom>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <BoxAtom display="flex" direction="col" align="center" gap="4" py="4" className="text-center">

        {/* Ícono con círculo de color */}
        <BoxAtom display="flex" align="center" justify="center" rounded="full" className={['w-12 h-12', iconBg].join(' ')}>
          <Icon className={['[&]:text-2xl', iconColor].join(' ')} />
        </BoxAtom>

        {/* Título */}
        <TextAtom variant="text-lg" weight="semibold" className="text-gray-900">
          {title}
        </TextAtom>

        {/* Descripción */}
        {description && (
          <TextAtom variant="text-sm" className="text-gray-500 max-w-xs">
            {description}
          </TextAtom>
        )}
      </BoxAtom>
    </Modal>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   const [open, setOpen] = useState(false)

   // Diálogo de advertencia (warning)
   <AlertDialog
     isOpen={open}
     onClose={() => setOpen(false)}
     onConfirm={handleAction}
     intent="warning"
     title="¿Descartar cambios?"
     description="Perderás todos los cambios no guardados. Esta acción no se puede deshacer."
     confirmLabel="Descartar"
   />

   // Diálogo de peligro (danger)
   <AlertDialog
     isOpen={open}
     onClose={() => setOpen(false)}
     onConfirm={handleDelete}
     intent="danger"
     title="Eliminar proyecto"
     description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción es irreversible."
     confirmLabel="Eliminar"
   />

   // Diálogo informativo (info)
   <AlertDialog
     isOpen={open}
     onClose={() => setOpen(false)}
     onConfirm={() => setOpen(false)}
     intent="info"
     title="Nueva actualización disponible"
     description="La versión 2.0 incluye mejoras de rendimiento y nuevas funciones."
     confirmLabel="Ver novedades"
     cancelLabel="Ahora no"
   />

   // Diálogo de éxito (success)
   <AlertDialog
     isOpen={open}
     onClose={() => setOpen(false)}
     onConfirm={() => setOpen(false)}
     intent="success"
     title="¡Exportación completada!"
     description="Tu diagrama fue exportado correctamente."
     confirmLabel="Abrir archivo"
     cancelLabel="Cerrar"
   />

   // Con estado de carga async
   <AlertDialog
     isOpen={open}
     onClose={() => setOpen(false)}
     onConfirm={handleAsyncAction}
     intent="danger"
     title="Eliminar cuenta"
     isLoading={isDeleting}
   />
---------------------------------------------------------------- */