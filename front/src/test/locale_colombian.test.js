// @vitest-environment jsdom
/**
 * F21-T2 — Locale guard: español colombiano neutro (tuteo).
 *
 * Recorre los archivos críticos que producen texto visible al usuario y
 * asserta la AUSENCIA de marcadores rioplatenses (voseo, imperativos voseo,
 * pronombres) y peninsulares (vosotros/guay/tío). Esta es la red de
 * seguridad para evitar regresiones cuando se editen las vistas en el
 * futuro.
 *
 * Política de tuteo neutro acordada en F21-T2:
 *   - 2ª persona: "tú quieres", "tú tienes" (NO "querés", "tenés").
 *   - Imperativos: "Genera", "Explora", "Configura", "Dime", "Reflexiona"
 *     (NO "Generá", "Explorá", "Decímelo", "Reflexioná").
 *   - Adverbios: "aquí" (NO "acá").
 *   - Sin "vosotros", "vuestro", "vale" (interjección), "guay", "tío".
 *
 * Si un archivo legítimamente necesita un token marcado (e.g. el clasificador
 * que detecta "dale" como input del usuario), se agrega a `ALLOWED_OVERRIDES`.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = join(import.meta.dirname, '..')

/**
 * Tokens dialectales que NO deben aparecer en strings visibles al usuario.
 * Cada uno con su forma colombiana neutra sugerida.
 */
const FORBIDDEN_TOKENS = [
  // Voseo conjugado (2ª persona singular rioplatense)
  { token: /\bquerés\b/g,     suggest: 'quieres' },
  { token: /\bquerias\b/g,    suggest: 'querías' },
  { token: /\bbuscás\b/g,     suggest: 'buscas' },
  { token: /\bnecesitás\b/g,  suggest: 'necesitas' },
  { token: /\bpodés\b/g,      suggest: 'puedes' },
  { token: /\bsabés\b/g,      suggest: 'sabes' },
  { token: /\btenés\b/g,      suggest: 'tienes' },
  { token: /\bdebés\b/g,      suggest: 'debes' },
  { token: /\bcreés\b/g,      suggest: 'crees' },
  { token: /\bdecís\b/g,      suggest: 'dices' },
  { token: /\bcontás\b/g,     suggest: 'cuentas' },
  { token: /\benviás\b/g,     suggest: 'envías' },
  { token: /\bpracticás\b/g,  suggest: 'practicas' },
  { token: /\bconversás\b/g,  suggest: 'conversas' },
  // Imperativos voseo
  { token: /\bconfigurá\b/g,  suggest: 'configura' },
  { token: /\bgenerá\b/g,     suggest: 'genera' },
  { token: /\bdecíme(lo)?\b/g, suggest: 'dime / dímelo' },
  { token: /\bmandá\b/g,      suggest: 'manda' },
  { token: /\bvení\b/g,       suggest: 'ven' },
  { token: /\bandá\b/g,       suggest: 've / anda' },
  { token: /\bcontá\b/g,      suggest: 'cuenta' },
  { token: /\bcomentá\b/g,    suggest: 'comenta' },
  { token: /\bseguí\b/g,      suggest: 'sigue' },
  { token: /\bescribí\b/g,    suggest: 'escribe' },
  { token: /\benviá\b/g,      suggest: 'envía' },
  { token: /\breflexioná\b/g, suggest: 'reflexiona' },
  { token: /\bcontactá\b/g,   suggest: 'contacta' },
  { token: /\bexplorá\b/g,    suggest: 'explora' },
  // Adverbios rioplatenses
  { token: /\bacá\b/g,        suggest: 'aquí' },
  // Peninsulares (no se esperan en el código actual; guard preventivo)
  { token: /\bvosotros\b/g,   suggest: 'ustedes / tú' },
  { token: /\bvuestro\b/g,    suggest: 'tu / su' },
  { token: /\bvuestra\b/g,    suggest: 'tu / su' },
  { token: /\bguay\b/g,       suggest: '(omitir interjección)' },
]

/**
 * Lista de archivos cuyo USO LEGÍTIMO de un token está permitido — p.ej. el
 * clasificador que matchea inputs del usuario. Si en el futuro se necesita
 * añadir uno, hacerlo aquí explícito (no hay opt-out por archivo entero).
 */
const ALLOWED_OVERRIDES = []

/**
 * Carpetas dentro de `src/` a escanear (las únicas con texto visible al usuario).
 */
const SCAN_DIRS = [
  join(ROOT, 'views'),
  join(ROOT, 'components'),
  join(ROOT, 'hooks'),
  join(ROOT, 'contexts'),
  join(ROOT, 'services'),
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full, out)
    } else if (['.jsx', '.js'].includes(extname(name))) {
      // Excluir tests y mocks data: ahí algunos tokens pueden vivir en datos
      // sintéticos o expectations históricas (que ya migramos en F21-T2).
      if (name.endsWith('.test.js') || name.endsWith('.test.jsx')) continue
      out.push(full)
    }
  }
  return out
}

describe('F21-T2 — Locale guard: español colombiano neutro', () => {
  for (const dir of SCAN_DIRS) {
    const files = walk(dir)
    for (const file of files) {
      const rel = file.substring(ROOT.length + 1).replace(/\\/g, '/')
      it(`${rel} no contiene marcadores dialectales rioplatenses ni peninsulares`, () => {
        const src = readFileSync(file, 'utf8')

        // Strip line comments y block comments antes de testear: los tokens
        // dentro de comentarios no son visibles al usuario.
        const stripped = src
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^\s*\/\/.*$/gm, '')

        const offenders = []
        for (const { token, suggest } of FORBIDDEN_TOKENS) {
          const matches = stripped.match(token)
          if (matches && matches.length > 0 && !ALLOWED_OVERRIDES.includes(rel)) {
            offenders.push(`"${matches[0]}" → usar "${suggest}"`)
          }
        }

        expect(offenders).toEqual([])
      })
    }
  }
})
