/**
 * Braille ASCII radar renderer: the nine machine axes of the paradigm goals
 * drawn as a dot-matrix chart — 9 spokes, 5 nonagon rings, the value polygon
 * with emphasized vertices — followed by a one-line-per-axis text legend.
 * Pure function, zero dependencies, no DOM, no locale copy (legend labels
 * arrive as an argument; they live in locales.ts). Deterministic: same input
 * always yields the same string.
 */
import type { Radar } from './store-data.ts'

/** Machine axis keys in chart order: spoke i sits at -90° + i * 40°. */
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

// Canvas: COLS x ROWS characters, each a 2x4 Braille dot matrix (base U+2800),
// so DOT_W x DOT_H addressable dots with the chart centered inside.
const COLS = 44, ROWS = 20
const DOT_W = COLS * 2, DOT_H = ROWS * 4
const CX = DOT_W / 2, CY = DOT_H / 2
const R = Math.min(DOT_W, DOT_H) / 2 - 2

// Standard drawille bit map: in-char dot (x % 2, y % 4) -> Braille bit.
const BITS: readonly (readonly number[])[] = [
  [0x01, 0x02, 0x04, 0x40],
  [0x08, 0x10, 0x20, 0x80],
]

function dot(canvas: Uint8Array, x: number, y: number): void {
  const px = Math.round(x), py = Math.round(y)
  if (px < 0 || px >= DOT_W || py < 0 || py >= DOT_H) return
  canvas[(py >> 2) * COLS + (px >> 1)] |= BITS[px & 1][py & 3]
}

/** Straight line by float interpolation, one dot per step along the long axis. */
function line(canvas: Uint8Array, x0: number, y0: number, x1: number, y1: number): void {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
  for (let i = 0; i <= n; i++) {
    dot(canvas, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)
  }
}

/** Emphasized chart vertex: the dot itself plus its four diagonal neighbours. */
function blot(canvas: Uint8Array, x: number, y: number): void {
  for (const [dx, dy] of [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]] as const) dot(canvas, x + dx, y + dy)
}

function spoke(i: number, radius: number): [number, number] {
  const angle = (-90 + i * 40) * Math.PI / 180
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
}

/** Value radius, clamped so out-of-range scores can never escape the canvas. */
function valueRadius(v: number): number {
  return R * Math.max(0, Math.min(5, v)) / 5
}

/** Five-cell legend bar: value 3 -> '###--' (null is the caller's '-----'). */
function bar(v: number): string {
  const n = Math.max(0, Math.min(5, Math.round(v)))
  return '#'.repeat(n) + '-'.repeat(5 - n)
}

/**
 * Render the nine-axis radar as a Braille string, or null when every axis is
 * unknown (nothing to chart — the card then hides the block). `labels[i]` is
 * the legend label of AXIS_KEYS[i]; null values read '[-----] --'.
 */
export function radarAscii(radar: Radar | null, labels: readonly string[]): string | null {
  const values = AXIS_KEYS.map((k) => axisValue(radar, k))
  if (values.every((v) => v == null)) return null
  const canvas = new Uint8Array(COLS * ROWS)
  // nonagon rings, innermost first: ring k has radius R * k / 5
  for (let step = 1; step <= 5; step++) {
    const r = R * step / 5
    for (let i = 0; i < 9; i++) {
      const [x0, y0] = spoke(i, r)
      const [x1, y1] = spoke((i + 1) % 9, r)
      line(canvas, x0, y0, x1, y1)
    }
  }
  // spokes, center to full radius
  for (let i = 0; i < 9; i++) {
    const [x, y] = spoke(i, R)
    line(canvas, CX, CY, x, y)
  }
  // value polygon: a null axis collapses its vertex to the center
  for (let i = 0; i < 9; i++) {
    const v = values[i], w = values[(i + 1) % 9]
    const [x0, y0] = spoke(i, v == null ? 0 : valueRadius(v))
    const [x1, y1] = spoke((i + 1) % 9, w == null ? 0 : valueRadius(w))
    line(canvas, x0, y0, x1, y1)
  }
  // emphasized vertices (known values only)
  for (let i = 0; i < 9; i++) {
    const v = values[i]
    if (v == null) continue
    const [x, y] = spoke(i, valueRadius(v))
    blot(canvas, x, y)
  }
  const lines: string[] = []
  for (let row = 0; row < ROWS; row++) {
    let s = ''
    for (let col = 0; col < COLS; col++) s += String.fromCharCode(0x2800 + canvas[row * COLS + col])
    lines.push(s.replace(/\u2800+$/g, ''))
  }
  lines.push('')
  for (let i = 0; i < 9; i++) {
    const v = values[i]
    lines.push((labels[i] ?? AXIS_KEYS[i]) + ' [' + (v == null ? '-----' : bar(v)) + '] ' + (v == null ? '--' : String(v)))
  }
  return lines.join('\n')
}
