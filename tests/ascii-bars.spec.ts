import { describe, expect, it } from 'vitest'
import {
  AXIS_KEYS, axisValue, barsModel, flatten, flattenRow, meterRow, textWidth, titledBox,
} from '../src/client/ascii-bars.ts'
import type { BarsSegment } from '../src/client/ascii-bars.ts'
import { AXIS_LABEL_KEYS, en, zh } from '../src/client/locales.ts'
import type { Radar, RadarAxis } from '../src/client/store-data.ts'

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u

const axis = (value: number | null): RadarAxis => ({ value, evidence: 'x', updatedAt: '2026-08-17' })

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
  remedy: axis(2),
}

const labels = AXIS_LABEL_KEYS.map((k) => zh[k])

const fillsOf = (segs: readonly BarsSegment[]): string[] =>
  segs.filter((s) => s.kind === 'fill').map((s) => (s as { color: string }).color)

describe('ascii-bars', () => {
  it('locks the label order onto the chart axis order, labels within 4 columns', () => {
    expect(AXIS_LABEL_KEYS).toHaveLength(AXIS_KEYS.length)
    expect(labels).toEqual(['生产', '迁移', '准入', '分发', '组合', '安全', '开销', '保鲜', '救济'])
    for (const dict of [zh, en]) {
      for (const k of AXIS_LABEL_KEYS) expect(textWidth(dict[k])).toBeLessThanOrEqual(4)
    }
  })

  it('renders a deterministic titled box for a full radar', () => {
    const a = barsModel(full, labels, zh.chartTitle)
    expect(a).not.toBeNull()
    expect(flatten(a!)).toBe(flatten(barsModel(full, labels, zh.chartTitle)!))
    expect(flatten(a!)).toMatchSnapshot()
  })

  it('renders a deterministic titled box for mixed values', () => {
    const a = barsModel(mixed, labels, zh.chartTitle)
    expect(a).not.toBeNull()
    expect(flatten(a!)).toBe(flatten(barsModel(mixed, labels, zh.chartTitle)!))
    expect(flatten(a!)).toMatchSnapshot()
  })

  it('returns null when every machine axis is unknown', () => {
    expect(barsModel(null, labels, zh.chartTitle)).toBeNull()
    const empty: Radar = {
      producibility: axis(null), adoptability: axis(null), baseline: axis(null),
      distribution: axis(null), composition: axis(null), safety: axis(null),
      footprint: axis(null), freshness: axis(null), remedy: axis(null),
      human: { ...axis(5), source: 'founder', count: 1 },
    }
    expect(barsModel(empty, labels, zh.chartTitle)).toBeNull()
  })

  it('distinguishes a null axis (dashes + --) from a zero score (empty track + 0/5)', () => {
    const text = flatten(barsModel(mixed, labels, zh.chartTitle)!)
    expect(text).toContain('生产 ▕──────────▏ --')
    expect(text).toContain('分发 ▕░░░░░░░░░░▏ 0/5')
    expect(text).toContain('迁移 ▕████████░░▏ 4/5')
    expect(text).toContain('准入 ▕██████░░░░▏ 3/5')
    expect(text).toContain('救济 ▕████░░░░░░▏ 2/5')
  })

  it('closes every box line at exactly 48 columns, odd ninth axis bottom-left', () => {
    const lines = flatten(barsModel(full, labels, zh.chartTitle)!).split('\n')
    expect(lines).toHaveLength(7)
    for (const line of lines) expect(textWidth(line)).toBe(48)
    expect(lines[0]).toMatch(/^╭─ .+ ─+╮$/)
    expect(lines[0]).toContain(zh.chartTitle)
    expect(lines[6]).toBe('╰' + '─'.repeat(46) + '╯')
    for (const line of lines.slice(1, 6)) {
      expect(line.startsWith('│ ')).toBe(true)
      expect(line.endsWith(' │')).toBe(true)
    }
    expect(lines[5]).toContain('救济')
    expect(lines[5]).not.toContain('保鲜')
  })

  it('grades meter colors: 5 blue, 4 cyan, 3 amber, <=2 red, null uncolored', () => {
    expect(fillsOf(meterRow('x', 5)).join()).toContain('#4D6BFE')
    expect(fillsOf(meterRow('x', 4)).join()).toContain('#36c2ff')
    expect(fillsOf(meterRow('x', 3)).join()).toContain('#FFB900')
    expect(fillsOf(meterRow('x', 2)).join()).toContain('#ff6b6b')
    expect(fillsOf(meterRow('x', 1)).join()).toContain('#ff6b6b')
    expect(fillsOf(meterRow('x', null))).toHaveLength(0)
    // theme variables first, hex fallback inside var()
    expect(fillsOf(meterRow('x', 5))[0]).toMatch(/^var\(--dsw-/)
  })

  it('renders the founder score as a standalone meter row outside the box', () => {
    expect(flattenRow(meterRow(zh.founderScore, 5))).toBe('创始人评分 ▕██████████▏ 5/5')
    expect(flattenRow(meterRow(en.founderScore, 4))).toBe('Founder score ▕████████░░▏ 4/5')
    expect(flattenRow(meterRow(zh.founderScore, null))).toBe('创始人评分 ▕──────────▏ -- ')
  })

  it('frames the whale banner in a titled box that closes on every line', () => {
    const art = ['  .', ' ":"', '~^~^~']
    const boxed = titledBox(art, zh.bannerTitle)
    const lines = boxed.split('\n')
    expect(lines[0]).toContain('WHALE PICKS')
    expect(lines[0].startsWith('╭─ ')).toBe(true)
    expect(lines[0].endsWith('╮')).toBe(true)
    expect(lines[lines.length - 1]).toBe('╰' + '─'.repeat(textWidth(lines[0]) - 2) + '╯')
    for (const line of lines) expect(textWidth(line)).toBe(textWidth(lines[0]))
    for (const line of lines.slice(1, -1)) {
      expect(line.startsWith('│ ')).toBe(true)
      expect(line.endsWith(' │')).toBe(true)
    }
  })

  it('contains no emoji', () => {
    const samples = [
      flatten(barsModel(full, labels, zh.chartTitle)!),
      flatten(barsModel(mixed, labels, zh.chartTitle)!),
      flattenRow(meterRow(zh.founderScore, 5)),
      titledBox(['whale'], zh.bannerTitle),
    ]
    for (const s of samples) expect(EMOJI_RE.test(s)).toBe(false)
  })

  it('reads axis values defensively', () => {
    expect(axisValue(full, 'safety')).toBe(5)
    expect(axisValue(mixed, 'producibility')).toBeNull()
    expect(axisValue(null, 'safety')).toBeNull()
  })
})
