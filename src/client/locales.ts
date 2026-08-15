/** Locale copy for the whale-picks store section. */
export interface StoreKey {
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
  flags: string
  repo: string
  gatePass: string
  gateFail: string
  dataSource: string
}

export const zh: StoreKey = {
  nav: '鲸选',
  subtitle: '敢装，值得装 —— 有品味的 DSH 精品商店',
  tabSuits: '🐳 套件',
  tabPlugins: '插件',
  loading: '正在从鲸选取货…',
  error: '鲸选 registry 加载失败（检查网络后重试）',
  retry: '重试',
  emptySuits: '暂无套件——等已收录插件攒到可以组合的数量，套件会出现在这里。宁缺毋滥。',
  emptyPlugins: '货架空着呢。',
  featured: '🏆 编辑精选',
  listed: '✅ 已收录',
  candidates: '🧪 候选池（待创始人亲测）',
  copy: '复制',
  copied: '已复制',
  install: '安装',
  flags: '项待复核',
  repo: '仓库',
  gatePass: '规范门槛 ✓',
  gateFail: '规范门槛 ✗（待补 whalepicks.json）',
  dataSource: '数据来源：鲸选 registry（每 10 分钟缓存）',
}

export const en: StoreKey = {
  nav: 'Whale Picks',
  subtitle: 'Install with confidence — the boutique store for DSH plugins',
  tabSuits: '🐳 Suits',
  tabPlugins: 'Plugins',
  loading: 'Loading the whale-picks shelves…',
  error: 'Failed to load the whale-picks registry (check your network and retry)',
  retry: 'Retry',
  emptySuits: 'No suits yet — once enough plugins are listed to compose, suits appear here. 宁缺毋滥.',
  emptyPlugins: 'The shelves are empty.',
  featured: '🏆 Featured',
  listed: '✅ Listed',
  candidates: '🧪 Candidates (awaiting the founder’s test)',
  copy: 'Copy',
  copied: 'Copied',
  install: 'Install',
  flags: 'flag(s) to review',
  repo: 'Repo',
  gatePass: 'spec gate ✓',
  gateFail: 'spec gate ✗ (whalepicks.json pending)',
  dataSource: 'Data: whale-picks registry (cached 10 min)',
}
