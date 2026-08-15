/**
 * The whale-picks settings section: the store shelves inside DSH.
 * Two tabs — 🐳 suits and plugins (featured / listed / candidates) — with
 * six-axis radar, pass findings, gate status and copyable install commands.
 * Read-only: installation stays `dsh plugin add` (see whalepicks.json scope).
 */
import { useCallback, useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { fetchStoreData } from './store-data.ts'
import type { PluginEntry, Registry, Suit, SuitsRegistry } from './store-data.ts'
import { radarSvg } from './radar.ts'
import type { StoreKey } from './locales.ts'

type Props = PropsLocale<StoreKey> & { close?: () => void }
type T = (key: StoreKey) => string

const TIER_ORDER: PluginEntry['tier'][] = ['featured', 'listed', 'candidate']
const TIER_KEY = { featured: 'featured', listed: 'listed', candidate: 'candidates' } as const

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' },
  header: { display: 'flex', flexDirection: 'column', gap: 2 },
  subtitle: { fontSize: 12, opacity: 0.7 },
  tabs: { display: 'flex', gap: 8 },
  tab: { padding: '6px 12px', borderRadius: 6, border: '1px solid var(--dsw-alias-border, #333c4f)', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 13 },
  tabActive: { background: 'rgba(77,107,254,0.18)', borderColor: '#4D6BFE' },
  group: { display: 'flex', flexDirection: 'column', gap: 10 },
  groupTitle: { fontSize: 13, fontWeight: 600, opacity: 0.85 },
  card: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 8, border: '1px solid var(--dsw-alias-border, #333c4f)', background: 'var(--dsw-specific-panel-fill, transparent)' },
  cardHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: 600, fontSize: 14, textDecoration: 'none' },
  meta: { fontSize: 11, opacity: 0.65, whiteSpace: 'nowrap' },
  desc: { fontSize: 12.5, opacity: 0.9, lineHeight: 1.5 },
  radarRow: { display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' },
  radarBox: { flexShrink: 0 },
  side: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, opacity: 0.8 },
  warn: { color: '#FFB900' },
  installRow: { display: 'flex', alignItems: 'center', gap: 8 },
  code: { flex: 1, fontSize: 11, fontFamily: 'monospace', padding: '4px 8px', borderRadius: 4, background: 'rgba(127,140,160,0.12)', overflowWrap: 'anywhere' },
  button: { padding: '4px 10px', borderRadius: 6, border: '1px solid var(--dsw-alias-border, #333c4f)', background: 'rgba(77,107,254,0.15)', color: 'inherit', cursor: 'pointer', fontSize: 12 },
  empty: { fontSize: 12.5, opacity: 0.7, lineHeight: 1.6 },
  error: { fontSize: 12.5, color: '#ff7a7a', display: 'flex', alignItems: 'center', gap: 8 },
  footer: { fontSize: 10.5, opacity: 0.5 },
}

function copyText(text: string): boolean {
  try {
    if (navigator.clipboard?.writeText) { void navigator.clipboard.writeText(text); return true }
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch {
    return false
  }
}

function PluginCard({ p, t }: { p: PluginEntry; t: T }): JSX.Element {
  const [copied, setCopied] = useState(false)
  const desc = (p.description?.zh || p.description?.en || '').slice(0, 220)
  const flags = p.security?.redFlags ?? []
  const svg = radarSvg(p.radar, p.id)
  const gate = p.manifestCompliant === true ? t('gatePass') : t('gateFail')
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <a style={styles.name} href={'https://github.com/' + p.repo} target="_blank" rel="noreferrer">{p.name}</a>
        <span style={styles.meta}>{p.stars}⭐ · {p.license} · {gate}</span>
      </div>
      <div style={styles.desc}>{desc}</div>
      <div style={styles.radarRow}>
        {svg ? <div style={styles.radarBox} dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        <div style={styles.side}>
          {flags.length ? <div style={styles.warn}>⚠️ {flags.length} {t('flags')}</div> : null}
          {p.tier === 'candidate' ? <div>{t('candidates')}</div> : null}
        </div>
      </div>
      {p.install ? (
        <div style={styles.installRow}>
          <code style={styles.code}>{p.install}</code>
          <button
            style={styles.button}
            onClick={() => { if (copyText(p.install as string)) setCopied(true) }}
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function SuitCard({ s, t }: { s: Suit; t: T }): JSX.Element {
  const desc = s.description?.zh || s.description?.en || ''
  const synergy = s.synergy?.zh || s.synergy?.en || ''
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.name}>{s.name?.zh || s.name?.en}</span>
        <span style={styles.meta}>{s.plugins.join(' + ')}</span>
      </div>
      <div style={styles.desc}>{desc}</div>
      <div style={styles.desc}><b>1+1&gt;2：</b>{synergy}</div>
    </div>
  )
}

export function WhalePicksSection(props: Props): JSX.Element {
  const t = props.locale
  const [tab, setTab] = useState<'suits' | 'plugins'>('suits')
  const [data, setData] = useState<{ plugins: Registry | null; suits: SuitsRegistry | null }>({ plugins: null, suits: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchStoreData().then(
      (next) => { setData(next); setLoading(false) },
      (err) => { setError(String(err)); setLoading(false) },
    )
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div style={styles.empty}>{t('loading')}</div>
  if (error || !data.plugins) {
    return (
      <div style={styles.error}>
        <span>{t('error')}</span>
        <button style={styles.button} onClick={load}>{t('retry')}</button>
      </div>
    )
  }

  const suits = data.suits?.suits ?? []
  const byTier = (tier: PluginEntry['tier']): PluginEntry[] => (data.plugins?.plugins ?? []).filter((p) => p.tier === tier)

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'suits' ? styles.tabActive : {}) }} onClick={() => setTab('suits')}>{t('tabSuits')}</button>
          <button style={{ ...styles.tab, ...(tab === 'plugins' ? styles.tabActive : {}) }} onClick={() => setTab('plugins')}>{t('tabPlugins')}</button>
        </div>
        <div style={styles.subtitle}>{t('subtitle')}</div>
      </div>
      {tab === 'suits' ? (
        suits.length ? (
          <div style={styles.group}>{suits.map((s) => <SuitCard key={s.id} s={s} t={t} />)}</div>
        ) : (
          <div style={styles.empty}>{t('emptySuits')}</div>
        )
      ) : (
        TIER_ORDER.map((tier) => {
          const entries = byTier(tier)
          if (!entries.length) return null
          return (
            <div key={tier} style={styles.group}>
              <div style={styles.groupTitle}>{t(TIER_KEY[tier])}</div>
              {entries.map((p) => <PluginCard key={p.id} p={p} t={t} />)}
            </div>
          )
        })
      )}
      <div style={styles.footer}>{t('dataSource')}</div>
    </div>
  )
}
