/**
 * Tests F10-T1: agentJsonMap (puros sobre el catálogo)
 */
import { describe, it, expect } from 'vitest'
import {
  AGENT_JSON_MAP,
  FALLBACK_RENDERER,
  getRendererForNode,
  getKnownNodeNames,
  isSilentNode,
} from './agentJsonMap'

describe('AGENT_JSON_MAP', () => {
  it('incluye los 9 nodos canónicos del sistema', () => {
    const expected = [
      'unifier', 'investigator', 'asr', 'tactics', 'style',
      'supervisor', 'evaluator', 'profile_shadow', 'routine_generator',
    ]
    for (const name of expected) {
      expect(AGENT_JSON_MAP).toHaveProperty(name)
    }
    expect(getKnownNodeNames()).toEqual(expect.arrayContaining(expected))
  })

  it('marca supervisor/evaluator/profile_shadow como silent', () => {
    expect(isSilentNode('supervisor')).toBe(true)
    expect(isSilentNode('evaluator')).toBe(true)
    expect(isSilentNode('profile_shadow')).toBe(true)
  })

  it('NO marca como silent a los nodos presentables', () => {
    expect(isSilentNode('unifier')).toBe(false)
    expect(isSilentNode('routine_generator')).toBe(false)
    expect(isSilentNode('asr')).toBe(false)
  })
})

describe('getRendererForNode', () => {
  it('retorna kind="mapped" + render fn para nodos conocidos no-silent', () => {
    const r = getRendererForNode('unifier')
    expect(r.kind).toBe('mapped')
    expect(typeof r.render).toBe('function')
  })

  it('retorna kind="silent" + render null para nodos silenciados', () => {
    const r = getRendererForNode('supervisor')
    expect(r.kind).toBe('silent')
    expect(r.render).toBeNull()
  })

  it('retorna kind="fallback" + FALLBACK_RENDERER para nombres desconocidos', () => {
    const r = getRendererForNode('weird_node_name_xyz')
    expect(r.kind).toBe('fallback')
    expect(r.render).toBe(FALLBACK_RENDERER)
  })

  it('retorna fallback para name=null/undefined/no-string', () => {
    expect(getRendererForNode(null).kind).toBe('fallback')
    expect(getRendererForNode(undefined).kind).toBe('fallback')
    expect(getRendererForNode(42).kind).toBe('fallback')
    expect(getRendererForNode('').kind).toBe('fallback')
  })

  it('el render mapeado retorna un ReactElement (no null) para content válido', () => {
    const r = getRendererForNode('unifier')
    const out = r.render({ content: 'hola' })
    // ReactElement → objeto con $$typeof o type definido
    expect(out).toBeTruthy()
    expect(typeof out).toBe('object')
    expect(out.type).toBeDefined()
  })

  it('el FALLBACK_RENDERER tolera content vacío sin lanzar', () => {
    const out = FALLBACK_RENDERER({ content: undefined })
    expect(out).toBeTruthy()
    expect(out.type).toBeDefined()
  })
})
