import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WhalePicksSection } from '../src/client/WhalePicksSection.tsx'
import { en, zh } from '../src/client/locales.ts'
import type { StoreKey } from '../src/client/locales.ts'
import type { Radar, RadarAxis } from '../src/client/store-data.ts'

const EMOJI_RE = /[🌀-🫿☀-➿⬀-⯿]/u
/** Box-drawing + block glyphs: the old glyph-meter surface, now forbidden. */
const GLYPH_RE = /[─-╿▀-▟]/

const t = (key: StoreKey): string => zh[key]

const axis = (value: number | null): RadarAxis => ({ value, evidence: 'x', updatedAt: '2026-08-16' })
const radar: Radar = {
  producibility: axis(5), adoptability: axis(4), baseline: axis(5),
  distribution: axis(3), composition: axis(5), safety: axis(5),
  footprint: axis(4), freshness: axis(5), remedy: axis(null),
  human: { ...axis(5), source: 'founder', count: 1 },
}

const registry = {
  schemaVersion: '1.1', dshVersion: '0.1.0-rc.6', updatedAt: '2026-08-16',
  plugins: [
    {
      id: 'dsh-ui-attention', name: 'dsh-ui-attention', repo: 'LeeKai233/dsh-ui-attention',
      npmName: 'dsh-ui-attention', install: 'dsh plugin --profile web add dsh-ui-attention',
      tier: 'featured', category: 'notifications', license: 'MIT', stars: 1,
      pushedAt: '2026-08-14T18:26:14Z', archived: false, manifestCompliant: true, radar,
      description: { zh: '后台提醒', en: 'alerts' },
      reviewNotes: { zh: '创始人手记：每天在用。', en: 'Founder note: daily driver.' },
      security: { scannedAt: '2026-08-16', reviewStatus: 'reviewed', redFlags: [] },
    },
    {
      id: 'dsh-whale-picks-store', name: 'dsh-whale-picks-store', repo: 'LeeKai233/dsh-whale-picks-store',
      npmName: null, install: 'dsh plugin --profile web add dsh-whale-picks-store',
      tier: 'candidate', category: 'discovery', license: 'MIT', stars: 0,
      pushedAt: '2026-08-15T10:00:00Z', archived: false, manifestCompliant: true, radar: null,
      description: { zh: '鲸选商店', en: 'store' }, reviewNotes: null,
      security: { scannedAt: '2026-08-16', reviewStatus: 'pending-human', redFlags: [] },
    },
  ],
}
const suits = { schemaVersion: '1.0', updatedAt: '2026-08-16', suits: [] }

async function openPluginsTab(): Promise<HTMLElement> {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const body = String(url).includes('suits.json') ? suits : registry
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }))
  const { container } = render(<WhalePicksSection t={t} />)
  fireEvent.click(await screen.findByText(zh.tabPlugins))
  await screen.findByText('dsh-ui-attention')
  return container
}

describe('WhalePicksSection', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })

  it('renders the suits empty state, then the plugin shelves with copy buttons', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const body = String(url).includes('suits.json') ? suits : registry
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    render(<WhalePicksSection t={t} />)
    expect(await screen.findByText(zh.emptySuits)).toBeTruthy()
    fireEvent.click(screen.getByText(zh.tabPlugins))
    expect(await screen.findByText('dsh-ui-attention')).toBeTruthy()
    expect(screen.getByText('dsh-whale-picks-store')).toBeTruthy()
    expect(screen.getByText(zh.featured)).toBeTruthy()
    expect(screen.getAllByText(zh.candidates).length).toBeGreaterThan(0)
    expect(screen.getAllByText(zh.copy).length).toBeGreaterThan(0)
    expect(screen.getByText('dsh plugin --profile web add dsh-ui-attention')).toBeTruthy()
  })

  it('renders the CSS meter chart, founder meter and notes — zero glyph art', async () => {
    const container = await openPluginsTab()
    // chart box: title, all nine axis labels, scores, and the null axis dash
    expect(screen.getByText(zh.chartTitle)).toBeTruthy()
    for (const label of ['生产', '迁移', '准入', '分发', '组合', '安全', '开销', '保鲜', '救济']) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    // 5 axes at 5/5 + founder = 6, two 4/5, one 3/5, one null axis '--'
    expect(screen.getAllByText('5/5')).toHaveLength(6)
    expect(screen.getAllByText('4/5')).toHaveLength(2)
    expect(screen.getAllByText('3/5')).toHaveLength(1)
    expect(screen.getAllByText('--')).toHaveLength(1)
    // founder meter row outside the box + notes behind the > marker
    expect(screen.getByText(zh.founderScore)).toBeTruthy()
    expect(container.textContent).toContain('> 创始人手记：每天在用。')
    // meters are CSS cells: 10 per scored axis (8) + founder (1) = 90 cells
    const cells = Array.from(container.querySelectorAll('[data-meter-cell]'))
    expect(cells).toHaveLength(90)
    const fills = cells.filter((c) => c.getAttribute('data-meter-cell') === 'fill')
    const tracks = cells.filter((c) => c.getAttribute('data-meter-cell') === 'track')
    expect(fills).toHaveLength(82)
    expect(tracks).toHaveLength(8)
    // filled cells carry the nord ramp by position (btop), tracks are meter_bg
    expect((fills[0] as HTMLElement).style.background).toBe('rgb(130, 167, 196)') // y=10
    expect((fills[9] as HTMLElement).style.background).toBe('rgb(236, 239, 244)') // y=100 = ramp end
    expect((tracks[0] as HTMLElement).style.background).toBe('rgb(76, 86, 106)') // #4C566A
    // the whale brand banner remains the only <pre> ASCII art
    const pres = container.querySelectorAll('pre')
    expect(pres.length).toBe(1)
    expect(pres[0].textContent).toContain('~^~^~')
    // no box-drawing / block glyphs anywhere: rendering is pure CSS now
    expect(GLYPH_RE.test(container.textContent ?? '')).toBe(false)
    // text badges and stars copy replaced the old emoji
    expect(screen.getByText(zh.featured).textContent).toContain('[FEATURED]')
    expect(screen.getByText(/stars 1/)).toBeTruthy()
    expect(EMOJI_RE.test(container.textContent ?? '')).toBe(false)
  })

  it('follows the active locale for chart, founder row and notes', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const body = String(url).includes('suits.json') ? suits : registry
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const tEn = (key: StoreKey): string => en[key]
    const { container } = render(<WhalePicksSection t={tEn} />)
    fireEvent.click(await screen.findByText(en.tabPlugins))
    expect(await screen.findByText('dsh-ui-attention')).toBeTruthy()
    expect(screen.getByText(en.chartTitle)).toBeTruthy()
    expect(screen.getByText('Founder score')).toBeTruthy()
    expect(container.textContent).toContain('> Founder note: daily driver.')
    expect(screen.getByText(en.featured).textContent).toContain('[FEATURED]')
    expect(GLYPH_RE.test(container.textContent ?? '')).toBe(false)
  })

  it('shows the visible error state instead of a blank shelf', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    render(<WhalePicksSection t={t} />)
    expect(await screen.findByText(zh.error)).toBeTruthy()
    expect(screen.getByText(zh.retry)).toBeTruthy()
  })

  it('keeps every locale dictionary emoji-free and structurally aligned', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
    for (const dict of [zh, en]) {
      for (const value of Object.values(dict)) expect(EMOJI_RE.test(value)).toBe(false)
    }
  })
})
