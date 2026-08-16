/**
 * ASCII meter-bar renderer, deep-btop flavor: the nine machine axes of the
 * paradigm goals as a titled box (top border carries the title) of dense
 * two-column meter cells — label + 10-block bare meter (2 blocks per point)
 * + score — with gradient-colored fill segments. Pure functions, zero deps,
 * no DOM, no locale copy (labels and titles arrive as arguments; they live
 * in locales.ts).
 *
 * Output is a segment grid model; every segment carries `cols`, its display
 * width (CJK counts 2), so the component can hard-lock each span to
 * `<cols>ch` — font fallback metric drift then stays inside a span and can
 * never push borders or neighbour columns. `flatten`/`flattenRow` reduce the
 * model to plain text for tests and snapshots. Deterministic: same input,
 * same output.
 *
 * Glyph set is hardened to what Noto Sans Mono (CJK) carries: █ ░ ─ │ ╭ ╮
 * ╰ ╯ and plain ASCII markers — no side caps, no rare dotted rules.
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

/**
 * Segment grid model. `text` inherits the theme foreground; `fill` carries
 * the meter gradient color; `track` is the unfilled bar rest, rendered
 * muted (low-opacity currentColor) by the component. `cols` is the display
 * width of `text` — the component's ch width lock relies on it.
 */
export type BarsSegment =
  | { kind: 'text', text: string, cols: number }
  | { kind: 'fill', text: string, color: string, cols: number }
  | { kind: 'track', text: string, cols: number }

export interface BarsModel {
  rows: BarsSegment[][]
}

/** Plain-text form of one segment row (label, bars and borders joined). */
export function flattenRow(segments: readonly BarsSegment[]): string {
  return segments.map((s) => s.text).join('')
}

/** Plain-text form of the whole model — the snapshot/assertion surface. */
export function flatten(model: BarsModel): string {
  return model.rows.map(flattenRow).join('\n')
}

// btop box/meter glyphs, all inside U+2500–U+259F or plain ASCII — never emoji.
const BLOCK_FULL = '█'
const BLOCK_EMPTY = '░'
const BLOCK_NULL = '─'

/** Box geometry: two 19-column cells + separators + borders = 44 columns. */
export const BOX_WIDTH = 44
const CELL_COLS = 19
const LABEL_COLS = 4
const METER_BLOCKS = 10

/** Display width: CJK ideographs and fullwidth forms count as two columns. */
export function textWidth(s: string): number {
  let w = 0
  for (const ch of s) w += /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch) ? 2 : 1
  return w
}

const textSeg = (text: string): BarsSegment => ({ kind: 'text', text, cols: textWidth(text) })
const fillSeg = (text: string, color: string): BarsSegment => ({ kind: 'fill', text, color, cols: textWidth(text) })
const trackSeg = (text: string): BarsSegment => ({ kind: 'track', text, cols: textWidth(text) })

/** Right-pad by display columns (never truncates — label width is test-locked). */
function padCols(text: string, cols: number): string {
  return text + ' '.repeat(Math.max(0, cols - textWidth(text)))
}

/**
 * Meter gradient: theme CSS variables first, hard-coded btop-ish fallbacks.
 * 5 = theme blue, 4 = cyan, 3 = amber, <=2 = red. Null stays uncolored
 * (all-dash track) so an unknown axis never masquerades as a scored one.
 */
function valueColor(v: number): string {
  if (v >= 5) return 'var(--dsw-alias-primary, #4D6BFE)'
  if (v >= 4) return 'var(--dsw-alias-info, #36c2ff)'
  if (v >= 3) return 'var(--dsw-alias-warning, #FFB900)'
  return 'var(--dsw-alias-danger, #ff6b6b)'
}

/** Clamp + round a raw score into the 0–5 meter domain. */
function scoreOf(v: number): number {
  return Math.max(0, Math.min(5, Math.round(v)))
}

/** The 10 bare blocks of a meter: fill + track, or an all-dash null track. */
function barSegments(value: number | null): BarsSegment[] {
  if (value == null) return [trackSeg(BLOCK_NULL.repeat(METER_BLOCKS))]
  const n = scoreOf(value)
  const filled = n * 2
  const out: BarsSegment[] = []
  if (filled > 0) out.push(fillSeg(BLOCK_FULL.repeat(filled), valueColor(n)))
  if (filled < METER_BLOCKS) out.push(trackSeg(BLOCK_EMPTY.repeat(METER_BLOCKS - filled)))
  return out
}

/** One meter cell: `label xxxxxxxxxx N/5` (null score reads `--`). */
function cellSegments(label: string, value: number | null, labelCols: number): BarsSegment[] {
  const score = (value == null ? '--' : String(scoreOf(value)) + '/5').padEnd(3)
  return [
    textSeg(padCols(label, labelCols) + ' '),
    ...barSegments(value),
    textSeg(' ' + score),
  ]
}

/** Titled top border: `╭─ title ───…───╮` closed at exactly `width` columns. */
function topBorder(title: string, width: number): string {
  const head = '╭─ ' + title + ' '
  return head + '─'.repeat(Math.max(0, width - textWidth(head) - 1)) + '╮'
}

/** Bottom border: `╰───…───╯`. */
function bottomBorder(width: number): string {
  return '╰' + '─'.repeat(width - 2) + '╯'
}

/**
 * The nine-axis meter box, or null when every machine axis is unknown (the
 * card then hides the chart block). Row-major pairing over five rows; the
 * odd ninth axis sits in the last row's left cell, the right cell is blank
 * padding — every row's segment cols sum to BOX_WIDTH exactly.
 */
export function barsModel(radar: Radar | null, labels: readonly string[], title: string): BarsModel | null {
  const values = AXIS_KEYS.map((k) => axisValue(radar, k))
  if (values.every((v) => v == null)) return null
  const rows: BarsSegment[][] = [[textSeg(topBorder(title, BOX_WIDTH))]]
  for (let r = 0; r < 5; r++) {
    const li = r * 2, ri = r * 2 + 1
    const row: BarsSegment[] = [textSeg('│ '), ...cellSegments(labels[li] ?? AXIS_KEYS[li], values[li], LABEL_COLS)]
    if (ri < AXIS_KEYS.length) {
      row.push(textSeg('  '), ...cellSegments(labels[ri] ?? AXIS_KEYS[ri], values[ri], LABEL_COLS))
    } else {
      row.push(textSeg(' '.repeat(2 + CELL_COLS)))
    }
    row.push(textSeg(' │'))
    rows.push(row)
  }
  rows.push([textSeg(bottomBorder(BOX_WIDTH))])
  return { rows }
}

/**
 * Standalone meter row outside the box — the founder score. The human axis
 * is not a paradigm goal, so it never enters the nine-axis box.
 */
export function meterRow(label: string, value: number | null): BarsSegment[] {
  return cellSegments(label, value, textWidth(label))
}

/**
 * Generic titled box around plain-text lines (the whale banner), as a model
 * of single-segment rows. Auto-sized: width = longest content line (or the
 * title minimum) + borders.
 */
export function titledBox(lines: readonly string[], title: string): BarsModel {
  const inner = Math.max(textWidth(title) + 3, ...lines.map(textWidth))
  const width = inner + 4
  const rows: BarsSegment[][] = [[textSeg(topBorder(title, width))]]
  for (const l of lines) rows.push([textSeg('│ ' + padCols(l, inner) + ' │')])
  rows.push([textSeg(bottomBorder(width))])
  return { rows }
}
