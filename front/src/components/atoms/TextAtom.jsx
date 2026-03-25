/**
 * <TextAtom /> — Componente polimórfico de tipografía
 *
 * Consume los design tokens de tipografía definidos en tokens.css
 * a través de las clases de Tailwind configuradas en tailwind.config.js.
 *
 * Props:
 *   variant  — escala de Figma: 'display-2xl' | 'display-xl' | 'display-lg' |
 *              'display-md' | 'display-sm' | 'display-xs' |
 *              'text-xl' | 'text-lg' | 'text-md' | 'text-sm' | 'text-xs'
 *   weight   — 'regular' | 'medium' | 'semibold' | 'bold'
 *   family   — 'serif' | 'sans' | 'mono'
 *   as       — elemento HTML a renderizar (polimorfismo)
 *   className — clases adicionales de Tailwind (color, margin, etc.)
 *   children  — contenido del nodo
 */

/* ----------------------------------------------------------------
   Mapeo variant → clase Tailwind fontSize
   Los nombres de variante siguen la nomenclatura de Figma.
   Los body-* evitan colisión con las clases text-{xl,lg,...}
   nativas de Tailwind.
---------------------------------------------------------------- */
const VARIANT_CLASS = {
  'display-2xl': 'text-display-2xl',
  'display-xl':  'text-display-xl',
  'display-lg':  'text-display-lg',
  'display-md':  'text-display-md',
  'display-sm':  'text-display-sm',
  'display-xs':  'text-display-xs',
  'text-xl':     'text-body-xl',
  'text-lg':     'text-body-lg',
  'text-md':     'text-body-md',
  'text-sm':     'text-body-sm',
  'text-xs':     'text-body-xs',
}

/* ----------------------------------------------------------------
   Mapeo weight → clase Tailwind fontWeight
---------------------------------------------------------------- */
const WEIGHT_CLASS = {
  regular:  'font-regular',
  medium:   'font-medium',
  semibold: 'font-semibold',
  bold:     'font-bold',
}

/* ----------------------------------------------------------------
   Mapeo family → clase Tailwind fontFamily
---------------------------------------------------------------- */
const FAMILY_CLASS = {
  serif: 'font-serif',
  sans:  'font-sans',
  mono:  'font-mono',
}

/* ----------------------------------------------------------------
   Tag semántico por defecto según la variante
---------------------------------------------------------------- */
const DEFAULT_TAG = {
  'display-2xl': 'h1',
  'display-xl':  'h1',
  'display-lg':  'h2',
  'display-md':  'h2',
  'display-sm':  'h3',
  'display-xs':  'h3',
  'text-xl':     'p',
  'text-lg':     'p',
  'text-md':     'p',
  'text-sm':     'p',
  'text-xs':     'span',
}

export default function TextAtom({
  as,
  variant  = 'text-md',
  weight   = 'regular',
  family   = 'sans',
  className = '',
  children,
  ...props
}) {
  const Tag = as ?? DEFAULT_TAG[variant] ?? 'p'

  const classes = [
    VARIANT_CLASS[variant],
    WEIGHT_CLASS[weight],
    FAMILY_CLASS[family],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Título hero con Roboto Serif bold
   <TextAtom variant="display-2xl" weight="bold" family="serif">
     Arquitectura inteligente
   </TextAtom>

   // Subtítulo semibold con color de token
   <TextAtom variant="display-md" weight="semibold" className="text-brand-700">
     Diseña con precisión
   </TextAtom>

   // Párrafo de cuerpo
   <TextAtom variant="text-md" weight="regular">
     Genera diagramas a partir de lenguaje natural.
   </TextAtom>

   // Código en JetBrains Mono
   <TextAtom variant="text-sm" family="mono" as="code" className="text-brand-500">
     npm run dev
   </TextAtom>

   // Etiqueta pequeña personalizada como <span>
   <TextAtom variant="text-xs" weight="medium" as="span" className="text-gray-500 uppercase">
     Versión beta
   </TextAtom>
---------------------------------------------------------------- */
