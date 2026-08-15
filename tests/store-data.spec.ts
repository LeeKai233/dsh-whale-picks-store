import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchStoreData } from '../src/client/store-data.ts'

const pluginFixture = {
  schemaVersion: '1.1', dshVersion: '0.1.0-rc.6', updatedAt: '2026-08-15',
  plugins: [{
    id: 'dsh-ui-attention', name: 'dsh-ui-attention', repo: 'LeeKai233/dsh-ui-attention',
    npmName: 'dsh-ui-attention', install: 'dsh plugin --profile web add dsh-ui-attention',
    tier: 'featured', category: 'notifications', license: 'MIT', stars: 1,
    pushedAt: '2026-08-14T18:26:14Z', archived: false, manifestCompliant: true, radar: null,
    description: { zh: '提醒', en: 'alerts' }, reviewNotes: null,
    security: { scannedAt: '2026-08-15', reviewStatus: 'reviewed', redFlags: [] },
  }],
}
const suitsFixture = { schemaVersion: '1.0', updatedAt: '2026-08-15', suits: [] }

describe('fetchStoreData', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('parses the registry and suits', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const body = String(url).includes('suits.json') ? suitsFixture : pluginFixture
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const data = await fetchStoreData()
    expect(data.plugins.plugins).toHaveLength(1)
    expect(data.suits.suits).toHaveLength(0)
  })

  it('throws when every source fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    await expect(fetchStoreData()).rejects.toThrow('all registry sources failed')
  })
})
