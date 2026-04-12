/**
 * <Column /> — Celda de encabezado de tabla (<th>)
 *
 * Renderiza una columna de tabla con soporte de ordenamiento.
 * El indicador ↑/↓/↕ se colorea según la dirección activa.
 * El ciclo de dirección lo gestiona el componente padre.
 *
 * Props:
 *   label         — string                  Texto del encabezado
 *   sortable      — bool                    Muestra controles de sort
 *   sortDirection — 'asc' | 'desc' | null   Dirección actual
 *   onSort        — function                Llamado al hacer click
 *   align         — 'left' | 'center' | 'right'
 *   width         — string                  CSS width (ej: '120px', '20%')
 *   className     — string                  Clases adicionales
 */

/* ----------------------------------------------------------------
   Mapeo align → clase Tailwind
---------------------------------------------------------------- */
const ALIGN_CLASS = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
}

/* ----------------------------------------------------------------
   Indicadores de sort (Unicode, sin dependencias externas)
---------------------------------------------------------------- */
const SORT_ICON = {
  asc:  '↑',
  desc: '↓',
  null: '↕',
}

const BASE_TH = [
  'px-4 py-3',
  'text-body-xs font-semibold text-gray-500 uppercase',
  'bg-gray-50 border-b border-gray-200',
  'whitespace-nowrap',
].join(' ')

export default function Column({
  label,
  sortable      = false,
  sortDirection = null,
  onSort,
  align         = 'left',
  width,
  className     = '',
  ...props
}) {
  const thClasses = [
    BASE_TH,
    ALIGN_CLASS[align],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const isActive = sortDirection !== null

  return (
    <th
      className={thClasses}
      style={width ? { width } : undefined}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 cursor-pointer hover:text-brand-700 transition-colors duration-150 focus:outline-none focus:text-brand-600"
        >
          <span>{label}</span>
          <span className={isActive ? 'text-brand-600' : 'text-gray-300'}>
            {SORT_ICON[sortDirection ?? 'null']}
          </span>
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso (dentro de un <thead><tr>):

   // Columna simple
   <Column label="Nombre" />

   // Columna sortable con dirección activa
   <Column
     label="Fecha"
     sortable
     sortDirection={sortCol === 'date' ? sortDir : null}
     onSort={() => handleSort('date')}
     align="right"
   />

   // Columna con ancho fijo
   <Column label="Estado" width="120px" align="center" />

   // Patrón de ciclo de dirección en el padre:
   const handleSort = (col) => {
     if (sortCol !== col) { setSortCol(col); setSortDir('asc'); return }
     if (sortDir === 'asc')  { setSortDir('desc'); return }
     if (sortDir === 'desc') { setSortCol(null); setSortDir(null) }
   }
---------------------------------------------------------------- */
