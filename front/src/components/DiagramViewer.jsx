/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react'
import { downloadDiagramBlob, fetchDiagramSvg } from '../services/chatService'

function sanitizeSvg(rawSvg) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml')
    doc.querySelectorAll('script, foreignObject').forEach((node) => node.remove())

    doc.querySelectorAll('*').forEach((element) => {
      for (const attr of [...element.attributes]) {
        const name = attr.name.toLowerCase()
        const value = String(attr.value || '')
        if (name.startsWith('on')) element.removeAttribute(attr.name)
        if ((name === 'href' || name === 'xlink:href') && /^javascript:/i.test(value.trim())) {
          element.removeAttribute(attr.name)
        }
      }
    })

    return new XMLSerializer().serializeToString(doc)
  } catch {
    return ''
  }
}

const DOWNLOAD_FORMATS = [
  { value: 'svg', label: 'Download SVG', extension: 'svg' },
  { value: 'dot', label: 'Download DOT', extension: 'dot' },
  { value: 'dot_drawio', label: 'Download draw.io DOT', extension: 'dot' },
  { value: 'drawio', label: 'Download draw.io XML', extension: 'drawio' },
]

export default function DiagramViewer({ sessionId }) {
  const [zoom, setZoom] = useState(1)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [svg, setSvg] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const safeSvg = useMemo(() => sanitizeSvg(svg), [svg])

  useEffect(() => {
    let cancelled = false

    async function loadDiagram() {
      if (!sessionId) {
        setStatus('empty')
        setSvg('')
        setError('')
        return
      }

      setStatus('loading')
      setError('')

      try {
        const { svgText } = await fetchDiagramSvg({ sessionId })

        if (cancelled) return
        if (!svgText || !svgText.trim()) {
          setStatus('empty')
          setSvg('')
          return
        }

        setSvg(svgText)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setSvg('')
        const statusCode = err?.status
        if (statusCode === 404) {
          setError('No diagram found for this session. Generate one first in chat.')
        } else if (statusCode === 400 || statusCode === 500) {
          setError(err?.message || 'Diagram export failed.')
        } else {
          setError(err?.message || 'Unable to load diagram.')
        }
        setStatus('error')
      }
    }

    loadDiagram()
    return () => {
      cancelled = true
    }
  }, [sessionId, refreshKey])

  const download = async (format, extension) => {
    if (!sessionId) return
    try {
      const { blob } = await downloadDiagramBlob({ sessionId, format })
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `diagram-${sessionId}-${Date.now()}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      const statusCode = err?.status
      if (statusCode === 404) {
        setError('No diagram found for this session. Generate one first in chat.')
      } else {
        setError(err?.message || 'Download failed.')
      }
      setStatus('error')
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mt-2">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-2 py-1 text-body-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          Refresh diagram
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {DOWNLOAD_FORMATS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => download(item.value, item.extension)}
            className="px-2 py-1 text-body-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {item.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="px-2 py-1 text-body-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            -
          </button>
          <span className="text-body-xs text-gray-600 min-w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="px-2 py-1 text-body-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      <p className="px-3 py-2 text-body-xs text-gray-500 border-b border-gray-100 bg-gray-50">
        Need more detail? Ask the chat to generate a more detailed diagram, then download again.
      </p>

      <div className="p-3 overflow-auto max-h-[560px] bg-white">
        {status === 'loading' && (
          <p className="text-body-sm text-gray-500">Loading diagram…</p>
        )}

        {status === 'empty' && (
          <p className="text-body-sm text-gray-500">No diagram data available.</p>
        )}

        {status === 'error' && (
          <p className="text-body-sm text-error-600">{error}</p>
        )}

        {status === 'ready' && safeSvg && (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="inline-block"
            dangerouslySetInnerHTML={{ __html: safeSvg }}
          />
        )}
      </div>
    </div>
  )
}
