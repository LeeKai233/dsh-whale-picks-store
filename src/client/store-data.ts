/**
 * Registry data layer: types mirroring the whale-picks registry schema, plus
 * a multi-source fetcher (Cloudflare Workers first when configured, GitHub
 * raw as the always-on fallback).
 */
export interface RadarAxis {
  value: number | null
  evidence: string
  updatedAt: string
}
export interface HumanAxis extends RadarAxis {
  source: 'founder' | 'community' | 'both'
  count: number
}
export interface Radar {
  human: HumanAxis
  security: RadarAxis
  compatibility: RadarAxis
  scope: RadarAxis
  cost: RadarAxis
  activity: RadarAxis
}
export interface Bilingual { zh: string; en: string }
export interface PluginEntry {
  id: string
  name: string
  repo: string
  npmName: string | null
  install: string | null
  tier: 'featured' | 'listed' | 'candidate'
  category: string
  license: string
  stars: number
  pushedAt: string
  archived: boolean
  manifestCompliant: boolean | null
  radar: Radar | null
  description: Bilingual
  reviewNotes: Bilingual | null
  security: {
    scannedAt: string
    reviewStatus: 'none' | 'pending-human' | 'reviewed'
    redFlags: string[]
  }
}
export interface Registry {
  schemaVersion: string
  dshVersion: string
  updatedAt: string
  plugins: PluginEntry[]
}
export interface Suit {
  id: string
  name: Bilingual
  description: Bilingual
  plugins: string[]
  synergy: Bilingual
  conflicts: string[]
  tier: 'featured' | 'listed' | 'candidate'
}
export interface SuitsRegistry {
  schemaVersion: string
  updatedAt: string
  suits: Suit[]
}

/** Deploy docs: docs/cloudflare.md in the whale-picks repo. */
const CF_BASE = ''
const GITHUB_BASE = 'https://raw.githubusercontent.com/LeeKai233/dsh-whale-picks/main/data'

async function getJson<T>(base: string, file: string): Promise<T> {
  const res = await fetch(base + '/' + file, { cache: 'no-store' })
  if (!res.ok) throw new Error(file + ': HTTP ' + res.status)
  return res.json() as Promise<T>
}

export async function fetchStoreData(): Promise<{ plugins: Registry; suits: SuitsRegistry }> {
  const bases = [...(CF_BASE ? [CF_BASE] : []), GITHUB_BASE]
  let lastError: unknown = null
  for (const base of bases) {
    try {
      const [plugins, suits] = await Promise.all([
        getJson<Registry>(base, 'plugins.json'),
        getJson<SuitsRegistry>(base, 'suits.json'),
      ])
      return { plugins, suits }
    } catch (err) {
      lastError = err
    }
  }
  throw new Error('all registry sources failed: ' + String(lastError))
}
