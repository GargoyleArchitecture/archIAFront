/**
 * profileHydration.js — Helpers puros para enriquecer datos de perfil
 *
 * El endpoint GET /users/:userId/profile devuelve `strengths` y `weaknesses`
 * como arrays de strings (sólo nombres). La metadata (mastery, decayRate,
 * lastSeenAt) vive en `evaluatedConcepts`. Esta capa hace el join
 * client-side por nombre case-insensitive y entrega objetos enriquecidos
 * listos para que los componentes (StrengthChip, WeaknessActionCard,
 * ForgettingCurveList) los consuman.
 *
 * Sin dependencias, sin React, sin I/O — testeables en 100% puro.
 */

/**
 * Normaliza un nombre para comparación case-insensitive y sin espacios extra.
 * @param {string} s
 * @returns {string}
 */
function normalize(s) {
  return typeof s === 'string' ? s.trim().toLowerCase() : ''
}

/**
 * Indexa un array de evaluatedConcepts por nombre normalizado.
 *
 * @param {Array<{name: string, mastery?: number, decayRate?: number, lastSeenAt?: string}>} concepts
 * @returns {Map<string, object>}
 */
function indexConcepts(concepts) {
  const map = new Map()
  if (!Array.isArray(concepts)) return map
  for (const c of concepts) {
    if (!c || typeof c.name !== 'string') continue
    const key = normalize(c.name)
    if (!key) continue
    map.set(key, c)
  }
  return map
}

/**
 * Enriquece un array de nombres (strengths o weaknesses) con la metadata
 * de evaluatedConcepts que matchea por nombre (case-insensitive).
 *
 * Si un nombre no tiene match en evaluatedConcepts, se devuelve un objeto
 * con sólo el `name` y el resto de campos como undefined.
 *
 * @param {string[]} names
 * @param {Array<object>} evaluatedConcepts
 * @returns {Array<{name: string, mastery?: number, decayRate?: number, lastSeenAt?: string}>}
 */
export function hydrateNames(names, evaluatedConcepts) {
  if (!Array.isArray(names)) return []
  const idx = indexConcepts(evaluatedConcepts)
  return names
    .filter((n) => typeof n === 'string' && n.trim().length > 0)
    .map((name) => {
      const match = idx.get(normalize(name))
      if (!match) return { name: name.trim() }
      // Tomamos los campos relevantes y normalizamos numéricos
      // (TypeORM puede serializar NUMERIC como string).
      // Usamos el name original de evaluatedConcepts si trae info útil; lo
      // trimmeamos siempre para no propagar espacios extra al UI.
      const matchName = typeof match.name === 'string' ? match.name.trim() : null
      return {
        name:       matchName || name.trim(),
        mastery:    coerceNumber(match.mastery),
        decayRate:  coerceNumber(match.decayRate),
        lastSeenAt: typeof match.lastSeenAt === 'string' ? match.lastSeenAt : undefined,
      }
    })
}

function coerceNumber(value) {
  if (value === null || value === undefined || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Formatea una fecha ISO como "dd/mm" (zona local del navegador).
 * Retorna string vacío si la fecha es inválida o ausente.
 *
 * @param {string|undefined|null} iso
 * @returns {string}
 */
export function formatDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

/**
 * Devuelve una etiqueta humanizada del tiempo transcurrido desde `iso`
 * hasta `now` (default Date.now()). Ej: "hace 3 días", "hace 2 meses".
 *
 * Si la fecha es inválida o futura, retorna "—".
 *
 * @param {string|undefined|null} iso
 * @param {number} [now] — timestamp ms (testing)
 * @returns {string}
 */
export function humanizeDelta(iso, now = Date.now()) {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diffMs = now - t
  if (diffMs < 0) return '—'

  const MIN = 60 * 1000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR
  const MONTH = 30 * DAY

  if (diffMs < HOUR) {
    const m = Math.max(1, Math.floor(diffMs / MIN))
    return `hace ${m} min`
  }
  if (diffMs < DAY) {
    const h = Math.floor(diffMs / HOUR)
    return `hace ${h} h`
  }
  if (diffMs < MONTH) {
    const d = Math.floor(diffMs / DAY)
    return d === 1 ? 'hace 1 día' : `hace ${d} días`
  }
  const months = Math.floor(diffMs / MONTH)
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
}
