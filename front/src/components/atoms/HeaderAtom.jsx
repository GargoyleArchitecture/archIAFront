/**
 * <HeaderAtom /> — Tipografía de display semántica para títulos
 *
 * Delegación total a <TextAtom />: deriva la variante de display
 * a partir del nivel de encabezado (level), manteniendo la fuente
 * de verdad tipográfica en un único lugar.
 *
 * Props:
 *   level     — Nivel del heading: 1 | 2 | 3 | 4 | 5 | 6
 *               Determina el tag HTML (h1–h6) y el tamaño de texto
 *   weight    — 'regular' | 'medium' | 'semibold' | 'bold'
 *   family    — 'serif' | 'sans' | 'mono'
 *   className — Clases Tailwind adicionales (color, margin, etc.)
 *   children  — Contenido del encabezado
 */

import TextAtom from './TextAtom'

/* ----------------------------------------------------------------
   Mapeo nivel → variante de TextAtom
   h1 y h2: display-2xl/xl para heroes y page titles
   h3-h6:   escalas menores de display
---------------------------------------------------------------- */
const LEVEL_VARIANT = {
  1: 'display-2xl',
  2: 'display-xl',
  3: 'display-lg',
  4: 'display-md',
  5: 'display-sm',
  6: 'display-xs',
}

/* ----------------------------------------------------------------
   Mapeo nivel → tag HTML semántico
---------------------------------------------------------------- */
const LEVEL_TAG = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
}

export default function HeaderAtom({
  level     = 2,
  weight    = 'semibold',
  family    = 'sans',
  className = '',
  children,
  ...props
}) {
  const variant = LEVEL_VARIANT[level] ?? 'display-md'
  const tag     = LEVEL_TAG[level]    ?? 'h2'

  return (
    <TextAtom
      as={tag}
      variant={variant}
      weight={weight}
      family={family}
      className={className}
      {...props}
    >
      {children}
    </TextAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Hero principal (h1) con serif bold
   <HeaderAtom level={1} weight="bold" family="serif" className="text-gray-900">
     Arquitectura inteligente
   </HeaderAtom>

   // Título de sección (h2) con color brand
   <HeaderAtom level={2} className="text-brand-700">
     Análisis de requisitos
   </HeaderAtom>

   // Subtítulo de tarjeta (h3) con acento secundario
   <HeaderAtom level={3} weight="medium" className="text-secondary-600">
     Patrón Microservicios
   </HeaderAtom>

   // Encabezado de formulario (h4)
   <HeaderAtom level={4} className="text-gray-800 mb-4">
     Configuración del proyecto
   </HeaderAtom>
---------------------------------------------------------------- */
