/**
 * CSS-rendered btop meters and titled boxes, aligned to the btop sources
 * (btop_draw.cpp / btop_theme.cpp / themes/nord.theme):
 *
 * - Meter = 10 solid contiguous cells (btop's Meter::operator()): color
 *   indexed by cell POSITION on the nord ramp (#81A1C1 -> #88C0D0 ->
 *   #ECEFF4), score only decides the filled count; track = meter_bg
 *   (nord: #4C566A, same as the border).
 * - Titled box = nord terminal panel: #2E3440 fill, #4C566A hairline
 *   border, and the btop title connection — the title presses onto the top
 *   border between two CSS corner brackets, recreating btop's
 *   title_left + title + title_right motif, in title color #8FBCBB, bold.
 *   Pure CSS: no glyph art anywhere.
 *
 * Everything here is box-model / gradient paints, so it stays identical at
 * every devicePixelRatio, browser zoom and display.
 */
import type { ReactNode } from 'react'
import { AXIS_KEYS, axisValue, METER_CELLS, meterColorAt, meterParts, NORD, scoreOf } from './meter-core.ts'
import type { Radar } from './store-data.ts'

/** Mono stack for labels/scores/title copy — plain text, no adjacency need. */
export const MONO_STACK = '"Noto Sans Mono CJK SC","Sarasa Mono SC","Noto Sans Mono",monospace'

/** Fixed meter width: every bar is the same length, btop style. */
const METER_WIDTH = 96

const HAIRLINE = '1px solid ' + NORD.border

const styles: Record<string, React.CSSProperties> = {
  // --- meter -----------------------------------------------------------------
  meter: { display: 'flex', width: METER_WIDTH, height: 11, flex: 'none' },
  meterDash: { display: 'flex', alignItems: 'center', width: METER_WIDTH, height: 11, flex: 'none' },
  dashLine: {
    width: '100%', height: 1,
    backgroundImage: 'repeating-linear-gradient(90deg, ' + NORD.inactive + ' 0px, ' + NORD.inactive + ' 3px, transparent 3px, transparent 6px)',
  },
  cell: { flex: '1 1 0', minWidth: 0, height: '100%' },
  cellTrack: { background: NORD.inactive },
  // --- titled box ------------------------------------------------------------
  // The wrapper owns the 8px headroom so the border-pressed title never
  // overflows the component (no clipping at scroll-container edges).
  boxWrap: { position: 'relative', paddingTop: 8 },
  box: {
    position: 'relative', padding: '12px',
    border: HAIRLINE, borderRadius: 4,
    background: NORD.bg,
  },
  // Title row sits on the top border: text centered on the line (masked with
  // the box background), flanked by pure-CSS corner brackets.
  titleRow: { position: 'absolute', top: 0, left: 12, display: 'flex', alignItems: 'flex-start' },
  bracketL: { width: 6, height: 11, borderTop: HAIRLINE, borderRight: HAIRLINE },
  bracketR: { width: 6, height: 11, borderTop: HAIRLINE, borderLeft: HAIRLINE },
  titleText: {
    marginTop: -8, fontFamily: MONO_STACK, fontSize: 11, lineHeight: '16px',
    fontWeight: 600, whiteSpace: 'nowrap', color: NORD.title, background: NORD.bg,
  },
  // --- radar chart -----------------------------------------------------------
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 18, rowGap: 7 },
  cellRow: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  label: {
    flex: 'none', minWidth: '2.6em', fontFamily: MONO_STACK, fontSize: 11, lineHeight: '16px',
    color: NORD.text, whiteSpace: 'nowrap',
  },
  score: {
    flex: 'none', minWidth: '2.2em', textAlign: 'right', fontFamily: MONO_STACK, fontSize: 11,
    lineHeight: '16px', color: NORD.text, whiteSpace: 'nowrap',
  },
  scoreNull: {
    flex: 'none', minWidth: '2.2em', textAlign: 'right', fontFamily: MONO_STACK, fontSize: 11,
    lineHeight: '16px', color: NORD.inactive, whiteSpace: 'nowrap',
  },
  // --- founder meter ---------------------------------------------------------
  founderRow: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
}

function scoreText(value: number | null): string {
  return value == null ? '--' : scoreOf(value) + '/5'
}

/** The 10-cell meter: solid contiguous bar, gradient by position (btop). */
export function Meter({ value }: { value: number | null }): JSX.Element {
  const parts = meterParts(value)
  if (parts.dash) {
    return (
      <div style={styles.meterDash} aria-hidden="true">
        <div style={styles.dashLine} />
      </div>
    )
  }
  const cells: JSX.Element[] = []
  for (let i = 0; i < METER_CELLS; i++) {
    const filled = i < parts.filled
    const style = filled ? { ...styles.cell, background: meterColorAt(i) } : { ...styles.cell, ...styles.cellTrack }
    cells.push(<div key={i} data-meter-cell={filled ? 'fill' : 'track'} style={style} />)
  }
  return <div style={styles.meter} aria-hidden="true">{cells}</div>
}

/** CSS hairline box with the title pressed onto its top border (btop look). */
export function TitledBox({ title, style, children }: { title: string; style?: React.CSSProperties; children: ReactNode }): JSX.Element {
  return (
    <div style={{ ...styles.boxWrap, ...style }}>
      <div style={styles.box}>
        <div style={styles.titleRow}>
          <div style={styles.bracketL} aria-hidden="true" />
          <span style={styles.titleText}>{title}</span>
          <div style={styles.bracketR} aria-hidden="true" />
        </div>
        {children}
      </div>
    </div>
  )
}

/** The nine-axis chart: two-column grid of label + meter + score cells. */
export function RadarChart({ radar, labels, title }: { radar: Radar | null; labels: readonly string[]; title: string }): JSX.Element | null {
  const values = AXIS_KEYS.map((k) => axisValue(radar, k))
  if (values.every((v) => v == null)) return null
  const cells: JSX.Element[] = AXIS_KEYS.map((key, i) => (
    <div key={key} style={styles.cellRow}>
      <span style={styles.label}>{labels[i] ?? key}</span>
      <Meter value={values[i]} />
      <span style={values[i] == null ? styles.scoreNull : styles.score}>{scoreText(values[i])}</span>
    </div>
  ))
  // Odd ninth axis: it sits in the last row's left cell, the right cell is blank.
  if (AXIS_KEYS.length % 2 !== 0) cells.push(<div key="spacer" aria-hidden="true" />)
  return (
    <TitledBox title={title} style={{ flex: 'none' }}>
      <div style={styles.grid}>{cells}</div>
    </TitledBox>
  )
}

/** Standalone meter row outside the box — the founder score (human axis). */
export function FounderMeter({ label, value }: { label: string; value: number | null }): JSX.Element {
  return (
    <div style={styles.founderRow}>
      <span style={styles.label}>{label}</span>
      <Meter value={value} />
      <span style={value == null ? styles.scoreNull : styles.score}>{scoreText(value)}</span>
    </div>
  )
}
