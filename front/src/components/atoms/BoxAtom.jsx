
//  * <BoxAtom /> — Primitiva universal de layout del design system
//  *
//  * Reemplaza contenedores <div> crudos en toda la base de código exponiendo
//  * layout, espaciado, tamaño y propiedades visuales como props explícitas,
//  * siempre resueltas a clases Tailwind del design system.
//  *
//  * Props:
//  *   as        — elemento HTML a renderizar. Default: 'div'
//  *               Ej: 'section' | 'article' | 'main' | 'aside' | 'header' |
//  *               'footer' | 'nav' | 'span' | 'ul' | 'li' | etc.
//  *
//  *   display   — 'flex' | 'grid' | 'block' | 'inline-flex' | 'inline-block' |
//  *               'inline' | 'hidden'
//  *   direction — 'row' | 'col' | 'row-reverse' | 'col-reverse'
//  *               Mapea a flex-{value}
//  *   wrap      — 'wrap' | 'nowrap' | 'wrap-reverse'
//  *               Mapea a flex-{value}
//  *   align     — 'start' | 'center' | 'end' | 'stretch' | 'baseline'
//  *               Mapea a items-{value}
//  *   justify   — 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
//  *               Mapea a justify-{value}
//  *
//  *   gap       — '0'|'1'|'2'|'3'|'4'|'6'|'8'|'10'|'12' → gap-{value}
//  *   gapX      — Mismos valores → gap-x-{value}
//  *   gapY      — Mismos valores → gap-y-{value}
//  *
//  *   p         — '0'|'1'|'2'|'3'|'4'|'5'|'6'|'8'|'10'|'12' → p-{value}
//  *   px        — Mismos valores → px-{value}
//  *   py        — Mismos valores → py-{value}
//  *   pt/pr/pb/pl — Mismos valores → pt-{v}|pr-{v}|pb-{v}|pl-{v}
//  *
//  *   m         — '0'|'1'|'2'|'3'|'4'|'5'|'6'|'8'|'10'|'12'|'auto' → m-{value}
//  *   mx        — Mismos valores → mx-{value}
//  *   my        — Mismos valores → my-{value}
//  *   mt/mr/mb/ml — Mismos valores → mt-{v}|mr-{v}|mb-{v}|ml-{v}
//  *
//  *   w         — 'full'|'screen'|'fit'|'min'|'max'|'auto'|'1/2'|'1/3'|
//  *               '2/3'|'1/4'|'3/4' → w-{value}
//  *   h         — 'full'|'screen'|'fit'|'auto'|'min'|'max' → h-{value}
//  *   minH      — '0'|'full'|'screen' → min-h-{value}
//  *   maxW      — 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'full'|'screen' → max-w-{value}
//  *
//  *   overflow  — 'hidden'|'auto'|'scroll'|'visible'|'x-hidden'|'y-auto'|'y-scroll'
//  *               Los prefijos x-/y- mapean a overflow-x-*/overflow-y-*
//  *   position  — 'relative'|'absolute'|'fixed'|'sticky'|'static'
//  *
//  *   rounded   — 'sm'|'md'|'lg'|'full'|'none' → tokens de border-radius del DS
//  *   shadow    — 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'none' → tokens shadow DS
//  *   bg        — token de color background, ej: 'gray-50'|'brand-25'|'white'|
//  *               'transparent' → bg-{value}
//  *   border    — 'none'|'default'|'gray-200'|'gray-300'|'brand-300'|'error-500'
//  *               'none' → border-0; otros → border + border-{value}
//  *               'default' → solo border (sin clase de color extra)
//  *
//  *   flex      — '1'|'auto'|'none'|'initial' → flex-{value}
//  *   shrink    — '0'|'1' → shrink-{value} (shrink-0 | shrink)
//  *   grow      — '0'|'1' → grow-0 | grow
//  *
//  *   className — clases Tailwind adicionales para lo no cubierto por las props
//  *   children  — contenido del nodo

/* ----------------------------------------------------------------
   Mapeos prop → clase Tailwind
---------------------------------------------------------------- */

const DISPLAY_CLASS = {
  'flex':         'flex',
  'grid':         'grid',
  'block':        'block',
  'inline-flex':  'inline-flex',
  'inline-block': 'inline-block',
  'inline':       'inline',
  'hidden':       'hidden',
}

const DIRECTION_CLASS = {
  'row':         'flex-row',
  'col':         'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
}

const WRAP_CLASS = {
  'wrap':         'flex-wrap',
  'nowrap':       'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
}

const ALIGN_CLASS = {
  'start':    'items-start',
  'center':   'items-center',
  'end':      'items-end',
  'stretch':  'items-stretch',
  'baseline': 'items-baseline',
}

const JUSTIFY_CLASS = {
  'start':   'justify-start',
  'center':  'justify-center',
  'end':     'justify-end',
  'between': 'justify-between',
  'around':  'justify-around',
  'evenly':  'justify-evenly',
}

const ROUNDED_CLASS = {
  'sm':   'rounded-sm',
  'md':   'rounded-md',
  'lg':   'rounded-lg',
  'full': 'rounded-full',
  'none': 'rounded-none',
}

const SHADOW_CLASS = {
  'xs':   'shadow-xs',
  'sm':   'shadow-sm',
  'md':   'shadow-md',
  'lg':   'shadow-lg',
  'xl':   'shadow-xl',
  '2xl':  'shadow-2xl',
  '3xl':  'shadow-3xl',
  'none': 'shadow-none',
}

const POSITION_CLASS = {
  'relative': 'relative',
  'absolute': 'absolute',
  'fixed':    'fixed',
  'sticky':   'sticky',
  'static':   'static',
}

const FLEX_CLASS = {
  '1':       'flex-1',
  'auto':    'flex-auto',
  'none':    'flex-none',
  'initial': 'flex-initial',
}

/* ----------------------------------------------------------------
   Helpers inline para clases con prefijo uniforme
   Solo emite la clase si el valor no es undefined.
---------------------------------------------------------------- */
function p(prefix, value) {
  return value !== undefined ? `${prefix}-${value}` : ''
}

/* ----------------------------------------------------------------
   Resolución de overflow (maneja shorthands x- / y-)
---------------------------------------------------------------- */
function resolveOverflow(value) {
  if (!value) return ''
  if (value === 'x-hidden') return 'overflow-x-hidden'
  if (value === 'y-auto')   return 'overflow-y-auto'
  if (value === 'y-scroll') return 'overflow-y-scroll'
  return `overflow-${value}`
}

/* ----------------------------------------------------------------
   Resolución de border
   'none'    → 'border-0'
   'default' → 'border'
   other     → 'border border-{value}'
---------------------------------------------------------------- */
function resolveBorder(value) {
  if (!value) return ''
  if (value === 'none')    return 'border-0'
  if (value === 'default') return 'border'
  return `border border-${value}`
}

/* ----------------------------------------------------------------
   Resolución de grow / shrink
---------------------------------------------------------------- */
function resolveGrow(value) {
  if (!value) return ''
  return value === '1' ? 'grow' : 'grow-0'
}

function resolveShrink(value) {
  if (!value) return ''
  return value === '1' ? 'shrink' : 'shrink-0'
}

/* ================================================================
   BoxAtom
================================================================ */
export default function BoxAtom({
  as        = 'div',
  /* display */
  display,
  direction,
  wrap,
  align,
  justify,
  /* gap */
  gap,
  gapX,
  gapY,
  /* padding */
  p: pProp,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  /* margin */
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  /* sizing */
  w,
  h,
  minH,
  maxW,
  /* misc layout */
  overflow,
  position,
  /* visual */
  rounded,
  shadow,
  bg,
  border,
  /* flex item */
  flex,
  shrink,
  grow,
  /* rest */
  className = '',
  children,
  ...rest
}) {
  const Tag = as

  const classes = [
    DISPLAY_CLASS[display],
    DIRECTION_CLASS[direction],
    WRAP_CLASS[wrap],
    ALIGN_CLASS[align],
    JUSTIFY_CLASS[justify],
    /* gap */
    p('gap',   gap),
    p('gap-x', gapX),
    p('gap-y', gapY),
    /* padding */
    p('p',  pProp),
    p('px', px),
    p('py', py),
    p('pt', pt),
    p('pr', pr),
    p('pb', pb),
    p('pl', pl),
    /* margin */
    p('m',  m),
    p('mx', mx),
    p('my', my),
    p('mt', mt),
    p('mr', mr),
    p('mb', mb),
    p('ml', ml),
    /* sizing */
    p('w',     w),
    p('h',     h),
    p('min-h', minH),
    p('max-w', maxW),
    /* misc layout */
    resolveOverflow(overflow),
    POSITION_CLASS[position],
    /* visual */
    ROUNDED_CLASS[rounded],
    SHADOW_CLASS[shadow],
    bg ? `bg-${bg}` : '',
    resolveBorder(border),
    /* flex item */
    FLEX_CLASS[flex],
    resolveGrow(grow),
    resolveShrink(shrink),
    /* extra */
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}

// /* ----------------------------------------------------------------
//    Ejemplos de uso:

//    // Flex row centrado con gap — reemplaza un header/toolbar
//    <BoxAtom display="flex" align="center" justify="between" gap="4" px="6" py="4">
//      <TextAtom variant="text-md">Label</TextAtom>
//      <ButtonAtom intent="primary">Action</ButtonAtom>
//    </BoxAtom>

//    // Flex column con padding — reemplaza un card wrapper típico
//    <BoxAtom
//      display="flex"
//      direction="col"
//      gap="3"
//      p="6"
//      rounded="lg"
//      shadow="md"
//      bg="white"
//      border="gray-200"
//    >
//      <HeaderAtom level={3}>Card title</HeaderAtom>
//      <TextAtom variant="text-sm" className="text-gray-500">Card body content.</TextAtom>
//    </BoxAtom>

//    // Contenedor scroll de altura completa — patrón flex-1 min-h-0
//    <BoxAtom display="flex" direction="col" h="full">
//      <BoxAtom flex="1" minH="0" overflow="y-auto" py="4">
//        {/* scrollable content */}
//      </BoxAtom>
//    </BoxAtom>

//    // Layout centrado con ancho máximo
//    <BoxAtom mx="auto" maxW="2xl" px="6" py="12">
//      {/* page content */}
//    </BoxAtom>

//    // Section wrapper renderizado como <section>
//    <BoxAtom as="section" display="flex" direction="col" gap="6" py="8">
//      {children}
//    </BoxAtom>

//    // Espaciado simple (reemplaza un <div className="mt-4">)
//    <BoxAtom mt="4">
//      <InputAtom placeholder="Search…" fullWidth />
//    </BoxAtom>
// ---------------------------------------------------------------- */
