/**
 * <RowTable /> — Fila de cuerpo de tabla (<tr>)
 *
 * Renderiza una fila de tabla con celdas configurables.
 * Si `selectable` es true, añade una primera celda con CheckboxAtom.
 * El fondo respeta la jerarquía: selected > striped > default.
 *
 * Props:
 *   cells      — ReactNode[]   Contenido de cada celda <td>
 *   selectable — bool          Añade celda de selección con CheckboxAtom
 *   selected   — bool          Fila seleccionada (fondo brand-25)
 *   onSelect   — function(e)   onChange del CheckboxAtom de selección
 *   striped    — bool          Activa el fondo alternado
 *   isOdd      — bool          Indica si la fila es impar (para striped)
 *   onClick    — function      Click en la fila (agrega cursor-pointer + hover)
 *   className  — string        Clases adicionales para el <tr>
 */

import CheckboxAtom from '../atoms/CheckboxAtom'

/* ----------------------------------------------------------------
   Clase base de la celda de datos
---------------------------------------------------------------- */
const BASE_TD = 'px-4 py-3 text-body-sm font-sans text-gray-700 border-b border-gray-100'

export default function RowTable({
  cells      = [],
  selectable = false,
  selected   = false,
  onSelect,
  striped    = false,
  isOdd      = false,
  onClick,
  className  = '',
  ...props
}) {
  /* Fondo: selected tiene prioridad; luego striped; luego default */
  const bgClass = selected
    ? 'bg-brand-25'
    : striped && isOdd
      ? 'bg-gray-50'
      : 'bg-white'

  const trClasses = [
    'transition-colors duration-100',
    bgClass,
    onClick ? 'cursor-pointer hover:bg-gray-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className={trClasses} onClick={onClick} {...props}>

      {/* Celda de selección */}
      {selectable && (
        <td className={[BASE_TD, 'w-10'].join(' ')}>
          <CheckboxAtom
            checked={selected}
            onChange={onSelect}
            aria-label="Seleccionar fila"
          />
        </td>
      )}

      {/* Celdas de datos */}
      {cells.map((cell, i) => (
        <td key={i} className={BASE_TD}>
          {cell}
        </td>
      ))}
    </tr>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso (dentro de un <tbody>):

   // Fila simple
   <RowTable cells={['Alice', 'alice@empresa.com', 'Administrador']} />

   // Fila seleccionable y seleccionada
   <RowTable
     selectable
     selected={selectedIds.has(row.id)}
     onSelect={(e) => toggleRow(row.id, e.target.checked)}
     cells={[row.name, row.email, row.role]}
   />

   // Fila con celdas enriquecidas y click en fila completa
   <RowTable
     cells={[
       'Microservices API',
       <Chips label="Activo" variant="success" size="sm" />,
       '12 feb 2026',
     ]}
     onClick={() => openDetail(row.id)}
   />

   // Striped
   {rows.map((row, i) => (
     <RowTable
       key={row.id}
       striped
       isOdd={i % 2 === 1}
       cells={row.cells}
     />
   ))}
---------------------------------------------------------------- */
