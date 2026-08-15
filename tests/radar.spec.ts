import { describe, expect, it } from 'vitest'
import { radarSvg, axisValue, AXES } from '../src/client/radar.ts'
import type { Radar } from '../src/client/store-data.ts'

const sample: Radar = {
  human: { value: 5, source: 'founder', count: 1, evidence: 'x', updatedAt: '2026-08-15' },
  security: { value: 5, evidence: 'x', updatedAt: '2026-08-15' },
  compatibility: { value: 5, evidence: 'x', updatedAt: '2026-08-15' },
  scope: { value: 5, evidence: 'x', updatedAt: '2026-08-15' },
  cost: { value: 5, evidence: 'x', updatedAt: '2026-08-15' },
  activity: { value: 4, evidence: 'x', updatedAt: '2026-08-15' },
}

describe('radar', () => {
  it('renders six labels and a polygon for a full radar', () => {
    const svg = radarSvg(sample, 'demo')
    expect(svg).toBeTruthy()
    for (const a of AXES) expect(svg).toContain(a.zh)
    expect(svg).toContain('<polygon')
  })

  it('returns null when every axis is unknown', () => {
    expect(radarSvg(null, 'demo')).toBeNull()
    const empty = { ...sample, security: { ...sample.security, value: null } }
    empty.human = { ...empty.human, value: null }
    empty.compatibility = { ...empty.compatibility, value: null }
    empty.scope = { ...empty.scope, value: null }
    empty.cost = { ...empty.cost, value: null }
    empty.activity = { ...empty.activity, value: null }
    expect(radarSvg(empty, 'demo')).toBeNull()
  })

  it('reads axis values defensively', () => {
    expect(axisValue(sample, 'security')).toBe(5)
    expect(axisValue(null, 'security')).toBeNull()
  })
})
