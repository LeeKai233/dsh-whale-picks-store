# dsh-whale-picks-store

中文 | [English](README.md)

鲸选商店入口：在 DSH 设置侧栏「Agent 预设」下方加入鲸选区块——浏览套件与精选插件、九轴 ASCII meter 柱状兑现度图、创始人评分与手记、体检结论，一键复制安装命令。纯文本 UI，无 emoji。

鲸选合规 DSH 插件——见 [whalepicks.json](./whalepicks.json) 与[鲸选插件规范](https://github.com/LeeKai233/dsh-whale-picks/blob/main/spec/SPEC.md)。

## 安装

```sh
dsh plugin --profile web add dsh-whale-picks-store
# 重启一次 dsh web 使新的 bundle 层生效
dsh web
```

或从本地目录安装：

```sh
dsh plugin --profile web add file:/path/to/dsh-whale-picks-store
```

然后打开设置：鲸选入口就在「Agent 预设」正下方。

## 它做什么

- 把鲸选 registry（套件 + 插件）渲染成货架：编辑精选 / 已收录 / 候选池
- 已收录插件展示九轴 ASCII meter 柱状兑现度图（范式九目标机器轴，btop 风标题盒与渐变 meter）、创始人评分与手记、体检发现与规范门槛状态
- 一键复制确切的安装命令

## 它不做什么

- 不在 DSH 内执行安装/卸载（只复制命令——安装走 `dsh plugin add`，不与 dsh-market 抢赛道）
- 不收集、不上传任何本地数据（只读远端 registry）
- 不修改其他插件的设置或行为

## 数据来源

Cloudflare Workers（见 whale-picks 仓库的 docs/cloudflare.md），带 GitHub raw 兜底。在 `src/client/store-data.ts` 里配置 worker 地址。

## 许可证

MIT © 2026 Leslie (LeeKai233)
