import { describe, expect, it } from 'vitest'
import { AXIS_KEYS, axisValue, radarAscii } from '../src/client/ascii-radar.ts'
import { AXIS_LABEL_KEYS, zh } from '../src/client/locales.ts'
import type { Radar, RadarAxis } from '../src/client/store-data.ts'

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u

const axis = (value: number | null): RadarAxis => ({ value, evidence: 'x', updatedAt: '2026-08-16' })

const full: Radar = {
  producibility: axis(5), adoptability: axis(5), baseline: axis(5),
  distribution: axis(5), composition: axis(5), safety: axis(5),
  footprint: axis(5), freshness: axis(5), remedy: axis(5),
  human: { ...axis(5), source: 'founder', count: 1 },
}

const mixed: Radar = {
  ...full,
  producibility: axis(null),
  adoptability: axis(4),
  baseline: axis(3),
  distribution: axis(0),
}

const labels = AXIS_LABEL_KEYS.map((k) => zh[k])

describe('ascii-radar', () => {
  it('locks the legend label order onto the chart axis order', () => {
    expect(AXIS_LABEL_KEYS).toHaveLength(AXIS_KEYS.length)
    expect(labels).toEqual(['生产', '迁移', '准入', '分发', '组合', '安全', '开销', '保鲜', '救济'])
  })

  it('renders a deterministic chart for a full radar', () => {
    const a = radarAscii(full, labels)
    expect(a).toBe(radarAscii(full, labels))
    expect(a).toBeTruthy()
    expect(a).toContain('生产 [#####] 5')
    expect(a).toContain('救济 [#####] 5')
    expect(a).toMatchSnapshot()
  })

  it('renders a deterministic chart for mixed values', () => {
    const a = radarAscii(mixed, labels)
    expect(a).toBe(radarAscii(mixed, labels))
    expect(a).toMatchSnapshot()
  })

  it('returns null when every machine axis is unknown', () => {
    expect(radarAscii(null, labels)).toBeNull()
    const empty: Radar = {
      producibility: axis(null), adoptability: axis(null), baseline: axis(null),
      distribution: axis(null), composition: axis(null), safety: axis(null),
      footprint: axis(null), freshness: axis(null), remedy: axis(null),
      human: { ...axis(5), source: 'founder', count: 1 },
    }
    expect(radarAscii(empty, labels)).toBeNull()
  })

  it('marks null axes in the legend as [-----] --', () => {
    const out = radarAscii(mixed, labels)
    expect(out).toContain('生产 [-----] --')
    expect(out).toContain('迁移 [####-] 4')
    expect(out).toContain('准入 [###--] 3')
    expect(out).toContain('分发 [-----] 0')
  })

  it('never charts the human axis as a tenth spoke', () => {
    const out = radarAscii(full, labels)
    expect(out).not.toBeNull()
    // 9 legend lines + 20 canvas rows + 1 blank separator
    expect(out?.split('\n')).toHaveLength(30)
  })

  it('contains no emoji', () => {
    for (const out of [radarAscii(full, labels), radarAscii(mixed, labels)]) {
      expect(out).not.toBeNull()
      expect(EMOJI_RE.test(out as string)).toBe(false)
    }
  })

  it('reads axis values defensively', () => {
    expect(axisValue(full, 'safety')).toBe(5)
    expect(axisValue(mixed, 'producibility')).toBeNull()
    expect(axisValue(null, 'safety')).toBeNull()
  })
})
