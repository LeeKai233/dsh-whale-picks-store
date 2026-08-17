/** Locale copy for the whale-picks store section. Pure text only — no emoji. */
export interface StoreKey {
  /** Active-locale marker ('zh' | 'en') so data fields can follow the UI language. */
  lang: string
  nav: string
  subtitle: string
  tabSuits: string
  tabPlugins: string
  loading: string
  error: string
  retry: string
  emptySuits: string
  emptyPlugins: string
  featured: string
  listed: string
  candidates: string
  copy: string
  copied: string
  install: string
  stars: string
  flags: string
  repo: string
  gatePass: string
  gateFail: string
  /** Titled-box heading over the nine-axis meter chart. */
  chartTitle: string
  /** Titled-box heading over the ASCII whale banner. */
  bannerTitle: string
  founderScore: string
  axisProducibility: string
  axisAdoptability: string
  axisBaseline: string
  axisDistribution: string
  axisComposition: string
  axisSafety: string
  axisFootprint: string
  axisFreshness: string
  axisRemedy: string
  dataSource: string
}

/**
 * Legend label keys in meter-chart order — index i is the label of
 * AXIS_KEYS[i] (meter-core.ts). The order contract is locked by a test.
 * Labels must stay short (<= 6 characters, locked by a test) so the
 * two-column grid keeps its fixed label column width.
 */
export const AXIS_LABEL_KEYS = [
  'axisProducibility', 'axisAdoptability', 'axisBaseline', 'axisDistribution',
  'axisComposition', 'axisSafety', 'axisFootprint', 'axisFreshness', 'axisRemedy',
] as const satisfies readonly (keyof StoreKey)[]

export const zh: StoreKey = {
  lang: 'zh',
  nav: '鲸选',
  subtitle: '敢装，值得装 —— 有品味的 DSH 精品商店',
  tabSuits: '套件',
  tabPlugins: '插件',
  loading: '正在从鲸选取货…',
  error: '鲸选 registry 加载失败（检查网络后重试）',
  retry: '重试',
  emptySuits: '暂无套件——等已收录插件攒到可以组合的数量，套件会出现在这里。宁缺毋滥。',
  emptyPlugins: '货架空着呢。',
  featured: '[FEATURED] 编辑精选',
  listed: '[LISTED] 已收录',
  candidates: '[CANDIDATE] 候选池（待创始人亲测）',
  copy: '复制',
  copied: '已复制',
  install: '安装',
  stars: 'stars',
  flags: '项待复核',
  repo: '仓库',
  gatePass: '规范门槛 PASS',
  gateFail: '规范门槛 FAIL（待补 whalepicks.json）',
  chartTitle: '九维兑现度',
  bannerTitle: 'WHALE PICKS',
  founderScore: '创始人评分',
  axisProducibility: '生产',
  axisAdoptability: '迁移',
  axisBaseline: '准入',
  axisDistribution: '分发',
  axisComposition: '组合',
  axisSafety: '安全',
  axisFootprint: '开销',
  axisFreshness: '保鲜',
  axisRemedy: '救济',
  dataSource: '数据来源：鲸选 registry（每 10 分钟缓存）',
}

export const en: StoreKey = {
  lang: 'en',
  nav: 'Whale Picks',
  subtitle: 'Install with confidence — the boutique store for DSH plugins',
  tabSuits: 'Suits',
  tabPlugins: 'Plugins',
  loading: 'Loading the whale-picks shelves…',
  error: 'Failed to load the whale-picks registry (check your network and retry)',
  retry: 'Retry',
  emptySuits: 'No suits yet — once enough plugins are listed to compose, suits appear here. 宁缺毋滥.',
  emptyPlugins: 'The shelves are empty.',
  featured: '[FEATURED] Featured',
  listed: '[LISTED] Listed',
  candidates: '[CANDIDATE] Candidates (awaiting the founder’s test)',
  copy: 'Copy',
  copied: 'Copied',
  install: 'Install',
  stars: 'stars',
  flags: 'flag(s) to review',
  repo: 'Repo',
  gatePass: 'spec gate PASS',
  gateFail: 'spec gate FAIL (whalepicks.json pending)',
  chartTitle: 'Nine-goal delivery',
  bannerTitle: 'WHALE PICKS',
  founderScore: 'Founder score',
  axisProducibility: 'Prod',
  axisAdoptability: 'Adop',
  axisBaseline: 'Base',
  axisDistribution: 'Dist',
  axisComposition: 'Comp',
  axisSafety: 'Safe',
  axisFootprint: 'Foot',
  axisFreshness: 'Fres',
  axisRemedy: 'Rem',
  dataSource: 'Data: whale-picks registry (cached 10 min)',
}
