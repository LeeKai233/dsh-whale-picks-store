/**
 * Local six-axis radar renderer: the same polygon math as the store repo's
 * render-radar.mjs, as a pure function returning an SVG string. No DOM deps.
 */
import type { Radar } from './store-data.ts'

export const AXES = [
  { key: 'human', zh: '真人' },
  { key: 'security', zh: '安全' },
  { key: 'compatibility', zh: '兼容' },
  { key: 'scope', zh: '边界' },
  { key: 'cost', zh: '成本' },
  { key: 'activity', zh: '活跃' },
] as const

const CX = 150, CY = 128, R = 88, LABEL_R = 110

export function axisValue(radar: Radar | null, key: string): number | null {
  if (!radar) return null
  const axis = radar[key as keyof Radar] as { value: number | null } | undefined
  return axis?.value ?? null
}

function point(i: number, radius: number): [number, number] {
  const angle = (-90 + i * 60) * Math.PI / 180
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
}

export function radarSvg(radar: Radar | null, id: string): string | null {
  const values = AXES.map((a) => axisValue(radar, a.key))
  if (!values.some((v) => v != null)) return null
  const hex = (radius: number): string =>
    AXES.map((_, i) => { const [x, y] = point(i, radius); return x.toFixed(1) + ',' + y.toFixed(1) }).join(' ')
  let grid = ''
  for (let step = 1; step <= 5; step++) {
    grid += `<polygon points="${hex(R * step / 5)}" fill="none" stroke="#2a3142" stroke-width="1"/>`
  }
  let spokes = ''
  AXES.forEach((_, i) => {
    const [x, y] = point(i, R)
    spokes += `<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#2a3142" stroke-width="1"/>`
  })
  const poly = AXES.map((_, i) => {
    const v = values[i]
    const [x, y] = point(i, v == null ? 0 : R * v / 5)
    return x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ')
  let dots = ''
  AXES.forEach((_, i) => {
    const v = values[i]
    if (v == null) return
    const [x, y] = point(i, R * v / 5)
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#4D6BFE"/>`
  })
  let labels = ''
  AXES.forEach((a, i) => {
    const [x, y] = point(i, LABEL_R)
    const v = values[i]
    const anchor = Math.abs(x - CX) < 12 ? 'middle' : x > CX ? 'start' : 'end'
    labels += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" fill="#aeb6c6" font-family="Verdana,DejaVu Sans,sans-serif" font-size="10" text-anchor="${anchor}">${a.zh} ${v == null ? '—' : v}</text>`
  })
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="256" viewBox="0 0 300 256" role="img" aria-label="${id} six-axis radar">`,
    grid, spokes,
    `<polygon points="${poly}" fill="rgba(77,107,254,0.32)" stroke="#4D6BFE" stroke-width="2"/>`,
    dots, labels,
    '</svg>'
  ].join('')
}
