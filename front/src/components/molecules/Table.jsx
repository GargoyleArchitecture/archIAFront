/**
 * <Table /> — Tabla de datos completa
 *
 * Compone Column (cabecera) + RowTable (filas) en una estructura
 * semántica de <table>. Gestiona selección global y por fila,
 * ordenamiento, estado de carga y estado vacío.
 *
 * Props:
 *   columns     — ColumnDef[]             Definición de columnas
 *   rows        — RowDef[]                Datos de filas
 *   selectable  — bool                    Columna de selección con checkboxes
 *   selectedRows — Set<string|number>     IDs de filas seleccionadas
 *   onSelectRow  — function(id)           Toggle de una fila
 *   onSelectAll  — function(bool)         Seleccionar/deseleccionar todas
 *   striped     — bool                    Filas alternadas
 *   emptyState  — ReactNode               Contenido del estado vacío
 *   loading     — bool                    Estado de carga
 *   className   — string                  Clases para el wrapper
 *
 * ColumnDef: { id, label, sortable?, sortDirection?, onSort?, align?, width? }
 * RowDef:    { id, cells: ReactNode[] }
 */

import BoxAtom      from '../atoms/BoxAtom'
import CheckboxAtom from '../atoms/CheckboxAtom'
import TextAtom     from '../atoms/TextAtom'
import Column       from './Column'
import RowTable     from './RowTable'

export default function Table({
  columns      = [],
  rows         = [],
  selectable   = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  striped      = false,
  emptyState,
  loading      = false,
  className    = '',
  ...props
}) {
  const totalCols = columns.length + (selectable ? 1 : 0)
  const allSelected  = rows.length > 0 && rows.every((r) => selectedRows.has(r.id))
  const someSelected = rows.some((r) => selectedRows.has(r.id))

  return (
    <BoxAtom
      w="full"
      rounded="lg"
      border="gray-200"
      shadow="xs"
      className={['overflow-x-auto', className].filter(Boolean).join(' ')}
      {...props}
    >
      <table className="w-full border-collapse">
        {/* Cabecera */}
        <thead>
          <tr>
            {/* Checkbox "Seleccionar todos" */}
            {selectable && (
              <th className="px-4 py-3 w-10 bg-gray-50 border-b border-gray-200">
                <CheckboxAtom
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  aria-label="Seleccionar todas las filas"
                />
              </th>
            )}

            {columns.map((col) => (
              <Column key={col.id} {...col} />
            ))}
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={totalCols}
                className="px-4 py-10 text-center"
              >
                <TextAtom variant="text-sm" className="text-gray-400">
                  Cargando datos…
                </TextAtom>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={totalCols}
                className="px-4 py-12 text-center"
              >
                {emptyState ?? (
                  <TextAtom variant="text-sm" className="text-gray-400">
                    Sin resultados
                  </TextAtom>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <RowTable
                key={row.id}
                cells={row.cells}
                selectable={selectable}
                selected={selectedRows.has(row.id)}
                onSelect={() => onSelectRow?.(row.id)}
                striped={striped}
                isOdd={i % 2 === 1}
                onClick={row.onClick}
              />
            ))
          )}
        </tbody>
      </table>
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Tabla básica
   <Table
     columns={[
       { id: 'name',    label: 'Nombre' },
       { id: 'project', label: 'Proyecto' },
       { id: 'status',  label: 'Estado', align: 'center' },
     ]}
     rows={[
       { id: 1, cells: ['Microservices API', 'Alpha', <Chips label="Activo" variant="success" size="sm" />] },
       { id: 2, cells: ['Auth Service',       'Beta',  <Chips label="Pendiente" variant="warning" size="sm" />] },
     ]}
   />

   // Tabla con selección y ordenamiento
   const [selected, setSelected] = useState(new Set())
   const toggleRow = (id) => setSelected(prev => {
     const next = new Set(prev)
     next.has(id) ? next.delete(id) : next.add(id)
     return next
   })

   <Table
     columns={[
       { id: 'name', label: 'Nombre', sortable: true, sortDirection: sortDir, onSort: handleSort },
       { id: 'date', label: 'Fecha',  sortable: true, align: 'right' },
     ]}
     rows={data}
     selectable
     selectedRows={selected}
     onSelectRow={toggleRow}
     onSelectAll={(all) => setSelected(all ? new Set(data.map(r => r.id)) : new Set())}
     striped
   />

   // Estado vacío personalizado
   <Table
     columns={columns}
     rows={[]}
     emptyState={
       <div className="flex flex-col items-center gap-2">
         <TextAtom variant="text-sm" weight="medium" className="text-gray-500">
           No hay proyectos todavía
         </TextAtom>
         <ButtonAtom intent="primary" size="sm">Crear proyecto</ButtonAtom>
       </div>
     }
   />
---------------------------------------------------------------- */
