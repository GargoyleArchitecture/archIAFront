import Modal           from './Modal'
import ButtonAtom      from '../atoms/ButtonAtom'
import TextAtom        from '../atoms/TextAtom'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

/**
 * <ConfirmModal /> — Diálogo de confirmación para acciones destructivas
 *
 * Props:
 *   isOpen        — bool      Controla visibilidad
 *   onClose       — fn        Cancela y cierra
 *   onConfirm     — fn        Ejecuta la acción destructiva
 *   title         — string    Título del modal (default: 'Confirmar')
 *   message       — string    Párrafo principal explicativo
 *   warning       — string    Bloque de advertencia ámbar (p.ej. borrado en cascada)
 *   confirmLabel  — string    Texto del botón de confirmación (default: 'Eliminar')
 *   isLoading     — bool      Deshabilita botones y muestra "Eliminando…"
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title        = 'Confirmar',
  message,
  warning,
  confirmLabel = 'Eliminar',
  isLoading    = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      title={title}
      size="sm"
      footer={
        <>
          <ButtonAtom intent="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </ButtonAtom>
          <ButtonAtom intent="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Eliminando…' : confirmLabel}
          </ButtonAtom>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {message && (
          <TextAtom variant="text-sm" className="text-gray-600">{message}</TextAtom>
        )}
        {warning && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <WarningAmberIcon style={{ fontSize: 16, color: '#d97706', marginTop: 2 }} className="flex-shrink-0" />
            <TextAtom variant="text-sm" className="text-amber-800">{warning}</TextAtom>
          </div>
        )}
      </div>
    </Modal>
  )
}
