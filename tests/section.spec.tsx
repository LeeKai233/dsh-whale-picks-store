import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WhalePicksSection } from '../src/client/WhalePicksSection.tsx'
import { en, zh } from '../src/client/locales.ts'
import type { StoreKey } from '../src/client/locales.ts'
import type { Radar, RadarAxis } from '../src/client/store-data.ts'

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u

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

  it('shows the Braille radar, tier badges, founder score and notes as pure text', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const body = String(url).includes('suits.json') ? suits : registry
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const { container } = render(<WhalePicksSection t={t} />)
    fireEvent.click(await screen.findByText(zh.tabPlugins))
    expect(await screen.findByText('dsh-ui-attention')).toBeTruthy()
    // Braille radar in a <pre>, legend included; ASCII whale banner is a <pre> too
    const pres = container.querySelectorAll('pre')
    expect(pres.length).toBeGreaterThanOrEqual(2)
    expect(container.textContent).toContain('生产 [#####] 5')
    expect(container.textContent).toContain('救济 [-----] --')
    // founder badge + notes (radar-bearing card only; the candidate card has none)
    expect(screen.getByText(zh.founderScore + ' 5/5')).toBeTruthy()
    expect(screen.getByText('创始人手记：每天在用。')).toBeTruthy()
    // text badges and stars copy replaced the old emoji
    expect(screen.getByText(zh.featured).textContent).toContain('[FEATURED]')
    expect(screen.getByText(/stars 1/)).toBeTruthy()
    // no emoji anywhere in the rendered section (Braille dots are not emoji)
    expect(EMOJI_RE.test(container.textContent ?? '')).toBe(false)
  })

  it('follows the active locale for founder notes', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const body = String(url).includes('suits.json') ? suits : registry
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const tEn = (key: StoreKey): string => en[key]
    render(<WhalePicksSection t={tEn} />)
    fireEvent.click(await screen.findByText(en.tabPlugins))
    expect(await screen.findByText('dsh-ui-attention')).toBeTruthy()
    expect(screen.getByText(en.founderScore + ' 5/5')).toBeTruthy()
    expect(screen.getByText('Founder note: daily driver.')).toBeTruthy()
    expect(screen.getByText(en.featured).textContent).toContain('[FEATURED]')
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
