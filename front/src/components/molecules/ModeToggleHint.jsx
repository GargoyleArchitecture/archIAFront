/**
 * <ModeToggleHint /> — Footer del chat: switch Tutor/Profesional + hint.
 *
 * Combina:
 *   - `SwitchAtom` enlazado a `useMode()` (toggle entre 'tutor' y 'professional').
 *   - El hint "Enter para enviar · Shift+Enter nueva línea".
 *
 * Pensado para ir debajo del `<MessageInput />` en `ChatHomePanel`. Si el
 * tenant tiene tutor mode apagado (`features.enableTutorMode = false`),
 * el switch se oculta y queda solo el hint.
 */

import { useMode } from '../../contexts/ModeContext'
import { useFeatures } from '../../contexts/FeaturesContext'
import SwitchAtom from '../atoms/SwitchAtom'
import TextAtom   from '../atoms/TextAtom'

export default function ModeToggleHint({
  hint = 'Enter para enviar · Shift+Enter nueva línea',
  className = '',
}) {
  const { mode, toggle } = useMode()
  const { features } = useFeatures()

  const showSwitch = features.enableTutorMode

  return (
    <div
      className={['flex items-center justify-between gap-3 px-1', className].filter(Boolean).join(' ')}
    >
      <TextAtom
        variant="text-xs"
        style={{ color: 'var(--mode-text-secondary)' }}
      >
        {hint}
      </TextAtom>

      {showSwitch && (
        <SwitchAtom
          size="sm"
          leadingLabel="Profesional"
          label="Tutor"
          checked={mode === 'tutor'}
          onChange={() => toggle()}
          aria-label="Cambiar entre modo profesional y tutor"
        />
      )}
    </div>
  )
}
