/**
 * Browser half of dsh-whale-picks-store: registers the 鲸选 settings section
 * right below Agent Presets (settings.section order 25 > agent-presets' 20).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { WhalePicksSection } from './WhalePicksSection.tsx'
import { en, zh } from './locales.ts'
import type { StoreKey } from './locales.ts'

export { WhalePicksSection } from './WhalePicksSection.tsx'
export type { StoreKey } from './locales.ts'

/** Locale namespace owned by this plugin (section copy). */
const NS = 'whalePicks'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    whalePicks: StoreKey
  }
}

/** Required services: slot registry + locale. */
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'whale-picks-store: dictionaries')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'whale-picks',
    order: 25,
    label: () => ctx.locale.bind(NS)('nav'),
    locale: NS,
    inject: () => ({}),
  }, WhalePicksSection))
}
