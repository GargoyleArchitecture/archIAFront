/**
 * <DropzoneFile /> — Área de carga de archivos (drag & drop)
 *
 * Gestiona internamente el estado de arrastre (isDragging).
 * Un <input type="file"> oculto se activa al hacer click.
 * La validación de tamaño es solo visual/UX — la validación real
 * debe hacerse en el handler `onDrop` / `onFileSelect` del padre.
 *
 * Props:
 *   onDrop        — function(FileList)   Llamado al soltar archivos
 *   onFileSelect  — function(FileList)   Llamado al seleccionar con diálogo
 *   accept        — string               MIME types o extensiones (ej: '.pdf,.png')
 *   multiple      — bool                 Permite múltiples archivos
 *   maxSizeMB     — number               Muestra el límite en el hint (solo informativo)
 *   disabled      — bool                 Sin interacción
 *   error         — string               Mensaje de error externo
 *   className     — string               Clases adicionales
 */

import { useState, useRef } from 'react'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import BoxAtom  from '../atoms/BoxAtom'
import TextAtom from '../atoms/TextAtom'

/* ----------------------------------------------------------------
   Clases por estado de la zona (resuelto en tiempo de render)
---------------------------------------------------------------- */
const ZONE_BASE = [
  'flex flex-col items-center justify-center gap-3',
  'p-10 rounded-lg border-2 border-dashed',
  'transition-colors duration-150',
  'focus:outline-none',
].join(' ')

const ZONE_STATE = {
  idle:     'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-25 cursor-pointer',
  dragging: 'border-brand-500 bg-brand-50 cursor-copy',
  error:    'border-error-400 bg-error-50 cursor-pointer',
  disabled: 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed',
}

export default function DropzoneFile({
  onDrop,
  onFileSelect,
  accept,
  multiple  = false,
  maxSizeMB,
  disabled  = false,
  error,
  className = '',
  ...props
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  /* Estado visual de la zona */
  const zoneState = disabled
    ? 'disabled'
    : error
      ? 'error'
      : isDragging
        ? 'dragging'
        : 'idle'

  /* Handlers de drag & drop */
  const handleDragOver  = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }
  const handleDragLeave = ()  => setIsDragging(false)
  const handleDrop      = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files.length) {
      onDrop?.(e.dataTransfer.files)
    }
  }

  /* Click abre el diálogo nativo de archivos */
  const handleClick  = () => { if (!disabled) inputRef.current?.click() }
  const handleChange = (e) => {
    if (e.target.files?.length) onFileSelect?.(e.target.files)
    /* Reset del input para permitir seleccionar el mismo archivo de nuevo */
    e.target.value = ''
  }

  const zoneClasses = [
    ZONE_BASE,
    ZONE_STATE[zoneState],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconColor = error
    ? 'text-error-500'
    : isDragging
      ? 'text-brand-600'
      : 'text-gray-400'

  return (
    <BoxAtom display="flex" direction="col" gap="2">
      <div
        className={zoneClasses}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Área de carga de archivos"
        aria-disabled={disabled}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        {...props}
      >
        {/* Input nativo oculto */}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          tabIndex={-1}
        />

        {/* Icono de upload */}
        <UploadFileIcon
          className={iconColor}
          style={{ fontSize: 40 }}
        />

        {/* Textos de instrucción */}
        <BoxAtom display="flex" direction="col" align="center" gap="1" className="text-center">
          <TextAtom
            variant="text-sm"
            weight="semibold"
            className={isDragging ? 'text-brand-700' : error ? 'text-error-700' : 'text-gray-700'}
          >
            {isDragging ? 'Suelta los archivos aquí' : 'Haz clic o arrastra archivos'}
          </TextAtom>

          <TextAtom variant="text-xs" className="text-gray-400">
            {accept && `Formatos aceptados: ${accept}`}
            {accept && maxSizeMB && ' · '}
            {maxSizeMB && `Máximo ${maxSizeMB} MB por archivo`}
            {!accept && !maxSizeMB && 'Todos los formatos'}
          </TextAtom>
        </BoxAtom>
      </div>

      {/* Error externo */}
      {error && (
        <TextAtom variant="text-xs" className="text-error-600">
          {error}
        </TextAtom>
      )}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Dropzone básico
   <DropzoneFile
     onDrop={(files) => handleFiles(files)}
     onFileSelect={(files) => handleFiles(files)}
   />

   // Solo PDFs, máximo 10 MB
   <DropzoneFile
     accept=".pdf"
     maxSizeMB={10}
     onDrop={handlePDF}
     onFileSelect={handlePDF}
   />

   // Múltiples imágenes con error
   <DropzoneFile
     accept="image/*"
     multiple
     error="El archivo supera el tamaño máximo permitido."
   />

   // Deshabilitado durante la subida
   <DropzoneFile
     disabled
     accept=".zip,.tar.gz"
   />
---------------------------------------------------------------- */
