/**
 * <InputForm /> — Campo de formulario completo
 *
 * Combina LabelAtom + InputAtom + mensaje de error/hint.
 * La unidad mínima de un formulario: una sola fila de campo.
 *
 * Props:
 *   id        — string   Vincula LabelAtom.htmlFor con InputAtom.id
 *   label     — string   Texto de la etiqueta (omitir si no hay label)
 *   required  — bool     Muestra asterisco en la etiqueta
 *   error     — string   Mensaje de error (fuerza state="error" en InputAtom)
 *   hint      — string   Texto de ayuda (solo se muestra si no hay error)
 *   size      — 'sm' | 'md' | 'lg'
 *   fullWidth — bool     (default true) Pasa al InputAtom
 *   disabled  — bool     Deshabilita el campo
 *   className — string   Clases para el wrapper externo
 *   ...rest              Todos los demás props pasan directamente al InputAtom
 *                        (type, placeholder, value, onChange, defaultValue, etc.)
 */

import BoxAtom   from '../atoms/BoxAtom'
import LabelAtom from '../atoms/LabelAtom'
import InputAtom from '../atoms/InputAtom'
import TextAtom  from '../atoms/TextAtom'

export default function InputForm({
  id,
  label,
  required  = false,
  error,
  hint,
  size      = 'md',
  fullWidth = true,
  disabled  = false,
  className = '',
  ...rest
}) {
  /* El estado del input se deriva automáticamente */
  const resolvedState = error
    ? 'error'
    : disabled
      ? 'disabled'
      : 'default'

  return (
    <BoxAtom display="flex" direction="col" className={['gap-1.5', className].filter(Boolean).join(' ')}>
      {label && (
        <LabelAtom htmlFor={id} required={required}>
          {label}
        </LabelAtom>
      )}

      <InputAtom
        id={id}
        size={size}
        state={resolvedState}
        fullWidth={fullWidth}
        disabled={disabled}
        {...rest}
      />

      {/* Mensaje de error — tiene prioridad sobre el hint */}
      {error && (
        <TextAtom variant="text-xs" className="text-error-600">
          {error}
        </TextAtom>
      )}

      {/* Hint — solo visible si no hay error activo */}
      {!error && hint && (
        <TextAtom variant="text-xs" className="text-gray-500">
          {hint}
        </TextAtom>
      )}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Campo básico con hint
   <InputForm
     id="email"
     label="Correo electrónico"
     type="email"
     placeholder="tu@empresa.com"
     hint="Usaremos este correo para notificaciones."
     required
   />

   // Campo con error de validación
   <InputForm
     id="url"
     label="URL del repositorio"
     type="url"
     error="La URL debe comenzar con https://"
     defaultValue="http://github.com/..."
   />

   // Campo deshabilitado
   <InputForm
     id="username"
     label="Usuario"
     disabled
     defaultValue="archia_user_01"
   />

   // Sin label (accesibilidad via aria-label)
   <InputForm
     id="search"
     placeholder="Buscar proyectos..."
     aria-label="Buscador de proyectos"
     size="sm"
   />
---------------------------------------------------------------- */
