/**
 * <LabelAtom /> — Etiqueta semántica para campos de formulario
 *
 * Props:
 *   htmlFor   — ID del input al que se vincula (accesibilidad)
 *   required  — Si es true, muestra un asterisco rojo '*' al final del texto
 *   className — Clases Tailwind adicionales
 *   children  — Texto de la etiqueta
 */

/* ----------------------------------------------------------------
   Clases base de la etiqueta
   text-body-sm  → 14px con leading 20px (token --text-sm)
   font-medium   → peso 500
   text-gray-700 → color neutro oscuro legible
---------------------------------------------------------------- */
const BASE_CLASSES = 'block text-body-sm font-medium text-gray-700'

export default function LabelAtom({
  htmlFor,
  required  = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    BASE_CLASSES,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label htmlFor={htmlFor} className={classes} {...props}>
      {children}
      {required && (
        <span className="text-error-500 ml-1" aria-hidden="true">*</span>
      )}
    </label>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   <LabelAtom htmlFor="email">Correo electrónico</LabelAtom>

   <LabelAtom htmlFor="name" required>
     Nombre completo
   </LabelAtom>

   <LabelAtom htmlFor="org" className="text-brand-700">
     Organización
   </LabelAtom>
---------------------------------------------------------------- */
