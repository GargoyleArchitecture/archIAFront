/**
 * <Form /> — Contenedor semántico de formulario
 *
 * Envuelve campos en un <form> con espaciado consistente entre grupos.
 * Llama a e.preventDefault() antes de propagar onSubmit.
 *
 * Props:
 *   gap       — 'sm' | 'md' | 'lg'  Espacio vertical entre campos
 *   onSubmit  — function(e)          Handler del submit
 *   className — string               Clases adicionales
 *   children  — ReactNode            Campos del formulario
 */

/* ----------------------------------------------------------------
   Mapeo gap → clase Tailwind
---------------------------------------------------------------- */
const GAP_CLASS = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

const BASE_CLASSES = 'flex flex-col w-full'

export default function Form({
  gap       = 'md',
  onSubmit,
  className = '',
  children,
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  const classes = [
    BASE_CLASSES,
    GAP_CLASS[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <form onSubmit={handleSubmit} className={classes} {...props}>
      {children}
    </form>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Formulario de login
   <Form onSubmit={(e) => console.log('submit')} gap="md">
     <InputForm id="email" label="Correo" type="email" required />
     <InputForm id="pass"  label="Contraseña" type="password" required />
     <ButtonAtom intent="primary" type="submit" className="w-full">
       Iniciar sesión
     </ButtonAtom>
   </Form>

   // Formulario de configuración con mayor espaciado
   <Form gap="lg" onSubmit={handleSave}>
     <InputForm id="name"    label="Nombre del proyecto" required />
     <InputForm id="desc"    label="Descripción" hint="Máx. 200 caracteres" />
     <InputForm id="url"     label="URL del repositorio" type="url" />
   </Form>
---------------------------------------------------------------- */
