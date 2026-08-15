import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WhalePicksSection } from '../src/client/WhalePicksSection.tsx'
import { zh } from '../src/client/locales.ts'
import type { StoreKey } from '../src/client/locales.ts'

const t = (key: StoreKey): string => zh[key]

const registry = {
  schemaVersion: '1.1', dshVersion: '0.1.0-rc.6', updatedAt: '2026-08-15',
  plugins: [
    {
      id: 'dsh-ui-attention', name: 'dsh-ui-attention', repo: 'LeeKai233/dsh-ui-attention',
      npmName: 'dsh-ui-attention', install: 'dsh plugin --profile web add dsh-ui-attention',
      tier: 'featured', category: 'notifications', license: 'MIT', stars: 1,
      pushedAt: '2026-08-14T18:26:14Z', archived: false, manifestCompliant: true, radar: null,
      description: { zh: '后台提醒', en: 'alerts' }, reviewNotes: null,
      security: { scannedAt: '2026-08-15', reviewStatus: 'reviewed', redFlags: [] },
    },
    {
      id: 'dsh-whale-picks-store', name: 'dsh-whale-picks-store', repo: 'LeeKai233/dsh-whale-picks-store',
      npmName: null, install: 'dsh plugin --profile web add dsh-whale-picks-store',
      tier: 'candidate', category: 'discovery', license: 'MIT', stars: 0,
      pushedAt: '2026-08-15T10:00:00Z', archived: false, manifestCompliant: true, radar: null,
      description: { zh: '鲸选商店', en: 'store' }, reviewNotes: null,
      security: { scannedAt: '2026-08-15', reviewStatus: 'pending-human', redFlags: [] },
    },
  ],
}
const suits = { schemaVersion: '1.0', updatedAt: '2026-08-15', suits: [] }

describe('WhalePicksSection', () => {
  afterEach(() => { vi.unstubAllGlobals() })

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

  it('shows the visible error state instead of a blank shelf', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    render(<WhalePicksSection t={t} />)
    expect(await screen.findByText(zh.error)).toBeTruthy()
    expect(screen.getByText(zh.retry)).toBeTruthy()
  })
})
