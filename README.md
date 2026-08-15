# dsh-whale-picks-store

[中文](README.zh.md) | English

The 鲸选 store entry inside DSH: a settings section right below Agent Presets that shows the whale-picks shelves — suits and curated plugins with six-axis radars, pass findings and one-click-copy install commands.

A whale-picks compliant DSH plugin — see [whalepicks.json](./whalepicks.json) and the [whale-picks SPEC](https://github.com/LeeKai233/dsh-whale-picks/blob/main/spec/SPEC.md).

## Install

```sh
dsh plugin --profile web add dsh-whale-picks-store
# restart dsh web once so the new bundle layer takes effect
dsh web
```

Or from a local checkout:

```sh
dsh plugin --profile web add file:/path/to/dsh-whale-picks-store
```

Then open Settings: the 鲸选 entry sits right below Agent Presets.

## What it does

- Renders the whale-picks registry (suits + plugins) as store shelves: featured / listed / candidates
- Six-axis radar per listed plugin, machine-pass findings and spec-gate status
- One-click copy of the exact install command

## What it does NOT do

- It does not install or uninstall anything inside DSH (copy only — install via `dsh plugin add`, keeping it out of dsh-market's lane)
- It does not collect or upload any local data (it only reads the remote registry)
- It does not modify other plugins' settings or behavior

## Data source

Cloudflare Workers (see the whale-picks repo's docs/cloudflare.md) with a GitHub-raw fallback. Configure the worker URL in `src/client/store-data.ts`.

## License

MIT © 2026 Leslie (LeeKai233)
