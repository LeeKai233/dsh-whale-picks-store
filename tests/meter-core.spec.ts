import { describe, expect, it } from 'vitest'
import {
  AXIS_KEYS, axisValue, METER_CELLS, meterColorAt, meterParts, NORD, scoreOf,
} from '../src/client/meter-core.ts'
import { AXIS_LABEL_KEYS, en, zh } from '../src/client/locales.ts'
import type { Radar, RadarAxis } from '../src/client/store-data.ts'

const axis = (value: number | null): RadarAxis => ({ value, evidence: 'x', updatedAt: '2026-08-17' })

const full: Radar = {
  producibility: axis(5), adoptability: axis(5), baseline: axis(5),
  distribution: axis(5), composition: axis(5), safety: axis(5),
  footprint: axis(5), freshness: axis(5), remedy: axis(5),
  human: { ...axis(5), source: 'founder', count: 1 },
}

describe('meter-core', () => {
  it('exports the nine machine axes in display order', () => {
    expect(AXIS_KEYS).toEqual([
      'producibility', 'adoptability', 'baseline', 'distribution', 'composition',
      'safety', 'footprint', 'freshness', 'remedy',
    ])
  })

  it('locks the label order onto the axis order, labels short enough for the grid', () => {
    expect(AXIS_LABEL_KEYS).toHaveLength(AXIS_KEYS.length)
    expect(AXIS_LABEL_KEYS.map((k) => zh[k])).toEqual(['生产', '迁移', '准入', '分发', '组合', '安全', '开销', '保鲜', '救济'])
    for (const dict of [zh, en]) {
      for (const k of AXIS_LABEL_KEYS) expect(dict[k].length).toBeLessThanOrEqual(6)
    }
  })

  it('clamps and rounds scores into the 0–5 domain', () => {
    expect(scoreOf(0)).toBe(0)
    expect(scoreOf(5)).toBe(5)
    expect(scoreOf(3.4)).toBe(3)
    expect(scoreOf(3.5)).toBe(4)
    expect(scoreOf(-1)).toBe(0)
    expect(scoreOf(6)).toBe(5)
  })

  it('maps every cell to the nord ramp by position, never by score (btop Meter)', () => {
    // y = 10,20,...,100 over the two-pass ramp: 0-50 start->mid, 50-100 mid->end
    expect(meterColorAt(0)).toBe('rgb(130, 167, 196)') // y=10: 20% of start->mid
    expect(meterColorAt(4)).toBe('rgb(136, 192, 208)') // y=50: exact mid #88C0D0
    expect(meterColorAt(9)).toBe('rgb(236, 239, 244)') // y=100: exact end #ECEFF4
    // deterministic and monotonic luminance across the bar
    const lum = (c: string): number => {
      const [r, g, b] = c.match(/\d+/g)!.map(Number)
      return r * 0.299 + g * 0.587 + b * 0.114
    }
    let prev = -1
    for (let i = 0; i < METER_CELLS; i++) {
      const l = lum(meterColorAt(i))
      expect(l).toBeGreaterThan(prev)
      prev = l
    }
  })

  it('splits values into filled/track/dash parts (two cells per point)', () => {
    expect(meterParts(null)).toEqual({ filled: 0, track: 0, dash: true })
    expect(meterParts(5)).toEqual({ filled: METER_CELLS, track: 0, dash: false })
    expect(meterParts(4)).toEqual({ filled: 8, track: 2, dash: false })
    expect(meterParts(0)).toEqual({ filled: 0, track: METER_CELLS, dash: false })
    expect(meterParts(3.5)).toEqual({ filled: 8, track: 2, dash: false })
  })

  it('reads axis values defensively', () => {
    expect(axisValue(full, 'safety')).toBe(5)
    expect(axisValue(null, 'safety')).toBeNull()
    const empty: Radar = {
      producibility: axis(null), adoptability: axis(null), baseline: axis(null),
      distribution: axis(null), composition: axis(null), safety: axis(null),
      footprint: axis(null), freshness: axis(null), remedy: axis(null),
      human: { ...axis(5), source: 'founder', count: 1 },
    }
    for (const key of AXIS_KEYS) expect(axisValue(empty, key)).toBeNull()
  })

  it('exports only nord colors — no box-drawing or block glyphs anywhere', () => {
    // The chart is CSS-rendered; only concrete rgb/hex color strings leave this module.
    const glyphRe = /[\u2500-\u257F\u2580-\u259F]/
    for (const value of Object.values(NORD)) expect(glyphRe.test(value)).toBe(false)
    for (let i = 0; i < METER_CELLS; i++) expect(glyphRe.test(meterColorAt(i))).toBe(false)
  })
})
