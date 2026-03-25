/**
 * <CodeBlock /> — Bloque de código con syntax highlighting
 *
 * Usa react-syntax-highlighter (Prism) con el tema vscDarkPlus adaptado
 * a la paleta de ArchIA: fondo gray-900 (#101828), header gray-800 (#252B37),
 * fuente JetBrains Mono. Scroll horizontal para líneas largas.
 *
 * Props:
 *   code            — string    Código a mostrar (obligatorio)
 *   language        — string    Lenguaje para el highlighting (default: 'plaintext')
 *                               Ej: 'javascript', 'python', 'typescript', 'bash', 'json'
 *   showLineNumbers — bool      Muestra números de línea (default: false)
 *   className       — string    Clases adicionales para el contenedor externo
 *
 * Comportamiento del botón Copiar:
 *   - Clic → copia al portapapeles → icono cambia a Check + "Copiado" (2 s)
 *   - Si el navegador no soporta clipboard API, el botón no se muestra
 */

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus }                from 'react-syntax-highlighter/dist/esm/styles/prism'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon       from '@mui/icons-material/Check'
import BoxAtom         from '../atoms/BoxAtom'

/* ----------------------------------------------------------------
   Tokens de color ArchIA aplicados al tema vscDarkPlus.
   Sobreescribimos solo `background` y `padding` — el resto del
   colorido sintáctico (keywords, strings, comments…) lo hereda
   vscDarkPlus, cuyos azules (#569cd6) y naranjas (#ce9178) armonizan
   con brand-400 y secondary-300 de la paleta.
---------------------------------------------------------------- */
const ARCHIA_THEME = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background:  'transparent',
    margin:      0,
    padding:     '1rem 1.25rem',
    fontSize:    '0.8125rem',   /* ~13px — cómodo para código */
    lineHeight:  '1.6',
    fontFamily:  "'JetBrains Mono', monospace",
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background:  'transparent',
    fontFamily:  "'JetBrains Mono', monospace",
  },
}

/* ----------------------------------------------------------------
   Etiqueta de lenguaje normalizada para mostrar en el header
---------------------------------------------------------------- */
const LANGUAGE_LABELS = {
  javascript:  'JavaScript',
  typescript:  'TypeScript',
  jsx:         'JSX',
  tsx:         'TSX',
  python:      'Python',
  bash:        'Bash',
  sh:          'Shell',
  json:        'JSON',
  html:        'HTML',
  css:         'CSS',
  markdown:    'Markdown',
  sql:         'SQL',
  yaml:        'YAML',
  plaintext:   'Texto',
}

function getLanguageLabel(lang) {
  return LANGUAGE_LABELS[lang?.toLowerCase()] ?? lang?.toUpperCase() ?? 'CODE'
}

/* ================================================================
   Componente principal
================================================================ */
export default function CodeBlock({
  code            = '',
  language        = 'plaintext',
  showLineNumbers = false,
  className       = '',
  ...props
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard no disponible — el botón simplemente no reacciona */
    }
  }

  return (
    <BoxAtom rounded="lg" bg="gray-900" shadow="md" className={['overflow-hidden', className].filter(Boolean).join(' ')} {...props}>

      {/* ── Header ── */}
      <BoxAtom display="flex" align="center" justify="between" px="4" py="2" className="bg-gray-800 select-none">

        {/* Indicador de lenguaje */}
        <span
          className="text-body-xs font-medium font-mono text-gray-400 uppercase tracking-normal"
        >
          {getLanguageLabel(language)}
        </span>

        {/* Botón copiar */}
        <button
          type="button"
          onClick={handleCopy}
          className={[
            'flex items-center gap-1.5',
            'text-body-xs font-medium font-mono',
            'rounded-md px-2 py-1',
            'transition-colors duration-150 outline-none',
            'focus:shadow-focus-gray',
            copied
              ? 'text-success-400 bg-success-900/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
            '[&_svg]:w-3.5 [&_svg]:h-3.5',
          ].join(' ')}
          aria-label={copied ? 'Código copiado' : 'Copiar código'}
        >
          {copied ? <CheckIcon /> : <ContentCopyIcon />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </BoxAtom>

      {/* ── Código con scroll horizontal ── */}
      <BoxAtom className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={ARCHIA_THEME}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            color:      '#414651',   /* gray-700 */
            fontFamily: "'JetBrains Mono', monospace",
            fontSize:   '0.75rem',
            minWidth:   '2.5rem',
            paddingRight: '1rem',
            userSelect: 'none',
          }}
          wrapLongLines={false}
          PreTag="div"
          CodeTag="code"
        >
          {code}
        </SyntaxHighlighter>
      </BoxAtom>

    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Bloque JavaScript básico
   <CodeBlock
     language="javascript"
     code={`function greet(name) {\n  return \`Hola, \${name}!\`\n}`}
   />

   // Python con números de línea
   <CodeBlock
     language="python"
     showLineNumbers
     code={`def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)`}
   />

   // JSON de configuración
   <CodeBlock
     language="json"
     code={JSON.stringify({ host: 'api.archIA.io', port: 443 }, null, 2)}
   />

   // Bash / terminal
   <CodeBlock
     language="bash"
     code="npm install react-syntax-highlighter\nnpm run dev"
   />
---------------------------------------------------------------- */
