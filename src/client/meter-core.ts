/**
 * Pure meter logic for the store shelves: axis keys, defensive radar reads,
 * score clamping/rounding, meter color grading and the filled/track/dash
 * split. No DOM, no glyphs, no locale copy — the UI lives in MeterUi.tsx.
 *
 * The old ascii-bars glyph model is gone: charts are CSS-rendered now
 * (btop flavor, nord palette), so the column/glyph accounting (textWidth,
 * cols, flatten) is obsolete. Same input, same deterministic output.
 */
import type { Radar } from './store-data.ts'

/** Machine axis keys in display order (row-major, two columns, five rows). */
export const AXIS_KEYS = [
  'producibility', 'adoptability', 'baseline', 'distribution', 'composition',
  'safety', 'footprint', 'freshness', 'remedy',
] as const

export type AxisKey = (typeof AXIS_KEYS)[number]

/** Defensive per-axis read: absent radar / axis / value all map to null. */
export function axisValue(radar: Radar | null, key: AxisKey): number | null {
  const axis = radar?.[key] as { value?: number | null } | undefined
  return typeof axis?.value === 'number' ? axis.value : null
}

/** The 0–5 meter domain: 10 cells, two cells per point. */
export const METER_CELLS = 10

/** Clamp + round a raw score into the 0–5 meter domain. */
export function scoreOf(v: number): number {
  return Math.max(0, Math.min(5, Math.round(v)))
}

/**
 * Nord palette, straight from btop's themes/nord.theme (nordtheme.com):
 * self-contained "terminal panel" colors for the chart boxes.
 * bg #2E3440 / text #D8DEE9 / title #8FBCBB / border & inactive #4C566A,
 * and the one shared meter gradient #81A1C1 -> #88C0D0 -> #ECEFF4.
 */
export const NORD = {
  bg: '#2E3440',
  border: '#4C566A',
  text: '#D8DEE9',
  title: '#8FBCBB',
  inactive: '#4C566A',
  gradStart: '#81A1C1',
  gradMid: '#88C0D0',
  gradEnd: '#ECEFF4',
} as const

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t)

/**
 * btop's Meter coloring (btop_draw.cpp Meter::operator()): the color of a
 * cell is indexed by its POSITION on the 0-100 ramp, never by the score —
 * the score only decides how many cells are filled. btop expands start/mid/
 * end into 101 levels with two linear passes (btop_theme.cpp:305-361);
 * here we interpolate on the fly: 0-50 start->mid, 50-100 mid->end.
 */
export function meterColorAt(i: number): string {
  const y = Math.round((i + 1) * 100 / METER_CELLS) // 10, 20, ... 100
  const [r, g, b] = y <= 50
    ? (() => { const t = y / 50; const s = hexToRgb(NORD.gradStart), m = hexToRgb(NORD.gradMid); return [lerp(s[0], m[0], t), lerp(s[1], m[1], t), lerp(s[2], m[2], t)] as const })()
    : (() => { const t = (y - 50) / 50; const m = hexToRgb(NORD.gradMid), e = hexToRgb(NORD.gradEnd); return [lerp(m[0], e[0], t), lerp(m[1], e[1], t), lerp(m[2], e[2], t)] as const })()
  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
}

export interface MeterParts {
  /** Filled cells (2 per point). */
  filled: number
  /** Remaining track cells. */
  track: number
  /** True for an unknown axis: render a dash line instead of cells. */
  dash: boolean
}

/** Split a score into the meter's filled/track/dash parts. */
export function meterParts(value: number | null): MeterParts {
  if (value == null) return { filled: 0, track: 0, dash: true }
  const n = scoreOf(value)
  return { filled: n * 2, track: METER_CELLS - n * 2, dash: false }
}
