/**
 * <ModeSwitcher /> — Segmented Button MD3 para alternar Tutor / Profesional
 *
 * Patrón Material Design 3: dos opciones contiguas, una seleccionada (filled),
 * otra plana. La selección se anima vía cambio de fondo + transición suave.
 *
 * A11y (WAI-ARIA Radio Group pattern):
 *   - role="radiogroup" en el contenedor con aria-label.
 *   - role="radio" en cada opción con aria-checked.
 *   - Roving tabindex: solo el seleccionado tiene tabindex=0.
 *   - Flecha izq/der/arriba/abajo cambian la selección y mueven el foco.
 *   - Enter o Space activan la opción enfocada (manejado nativamente).
 *
 * Atajo de teclado:
 *   El componente NO maneja Ctrl+M directamente; el hook global
 *   useKeyboardShortcuts lo hace (F6-T5). Aquí solo mostramos el atajo
 *   en el tooltip para que el usuario lo descubra.
 *
 * Props:
 *   compact   — bool   (default: false) Sólo iconos, sin label.
 *   className — string                   Clases extra para el wrapper.
 *
 * Notas de diseño:
 *   El componente lee los tokens --mode-* del documento. Ambos botones
 *   referencian la misma variable --mode-primary; solo el seleccionado
 *   la usa como background, así el tema actual define ambos colores.
 */

import { useMemo, useRef } from 'react'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'

import { useEffect } from 'react'
import { useMode } from '../../contexts/ModeContext'
import { useFeatures } from '../../contexts/FeaturesContext'
import TooltipAtom from '../atoms/TooltipAtom'

const OPTIONS = [
  { value: 'tutor',        label: 'Tutor',       Icon: SchoolOutlinedIcon },
  { value: 'professional', label: 'Profesional', Icon: CodeOutlinedIcon },
]

function isMacPlatform() {
  if (typeof navigator === 'undefined') return false
  const platform =
    navigator.userAgentData?.platform || navigator.platform || ''
  return /Mac|iPhone|iPad/i.test(platform)
}

export default function ModeSwitcher({ compact = false, className = '' }) {
  const { mode, setMode } = useMode()
  const { features } = useFeatures()
  const buttonRefs = useRef([])

  // F11-T5: si el tenant tiene tutor mode apagado, forzamos professional
  // (si el usuario tenía 'tutor' persistido en localStorage de un tenant
  //  anterior, lo reseteamos al render siguiente).
  useEffect(() => {
    if (!features.enableTutorMode && mode === 'tutor') {
      setMode('professional')
    }
  }, [features.enableTutorMode, mode, setMode])

  const shortcutLabel = useMemo(
    () => (isMacPlatform() ? 'Cmd+M' : 'Ctrl+M'),
    [],
  )

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (index + 1) % OPTIONS.length
      setMode(OPTIONS[next].value)
      buttonRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (index - 1 + OPTIONS.length) % OPTIONS.length
      setMode(OPTIONS[prev].value)
      buttonRefs.current[prev]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setMode(OPTIONS[0].value)
      buttonRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = OPTIONS.length - 1
      setMode(OPTIONS[last].value)
      buttonRefs.current[last]?.focus()
    }
  }

  return (
    <TooltipAtom
      content={`Cambiar modo (${shortcutLabel})`}
      position="bottom"
    >
      <div
        role="radiogroup"
        aria-label="Modo de interacción"
        className={[
          'inline-flex items-center rounded-full p-0.5 gap-0.5',
          'border transition-colors duration-200',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundColor: 'var(--mode-surface-container)',
          borderColor: 'var(--mode-outline)',
        }}
      >
        {OPTIONS.map((opt, i) => {
          const selected = opt.value === mode
          const { Icon } = opt
          // F11-T5: si tenant tiene tutor apagado, deshabilitamos
          // visualmente el botón Tutor (sigue presente para que screen
          // readers anuncien la opción, pero no se puede seleccionar).
          const disabled = opt.value === 'tutor' && !features.enableTutorMode
          return (
            <button
              key={opt.value}
              ref={(el) => (buttonRefs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled || undefined}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => { if (!disabled) setMode(opt.value) }}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full text-sm font-medium',
                'transition-all duration-200 outline-none',
                'focus-visible:ring-2 focus-visible:ring-offset-1',
                compact ? 'px-2 py-1.5' : 'px-3 py-1.5',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
              ].filter(Boolean).join(' ')}
              style={
                selected
                  ? {
                      backgroundColor: 'var(--mode-primary)',
                      color: 'var(--mode-on-primary)',
                      boxShadow: 'var(--shadow-xs)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--mode-on-surface)',
                    }
              }
            >
              <Icon style={{ fontSize: 16 }} aria-hidden="true" />
              {!compact && <span>{opt.label}</span>}
            </button>
          )
        })}
      </div>
    </TooltipAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // En el header global
   <ModeSwitcher />

   // Versión compacta para topbars estrechos
   <ModeSwitcher compact />

   // Como sub-componente de una vista
   <div className="flex items-center justify-between p-4">
     <h2>Conversación</h2>
     <ModeSwitcher />
   </div>
---------------------------------------------------------------- */
