/**
 * tsdown config for the dsh-whale-picks-store plugin (whale-picks compliant).
 * node half: minimal ESM lib; client half: CJS bundle wrapped in
 * window.__ModuleLoader__.load({id, factory}) with platform modules external.
 */
import { defineConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-whale-picks-store'

const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
] as const

const RUNTIME_STORE_EXEMPTION = '@deepseek-ai/dsh-client-runtime/client'

const NODE_EXTERNALS = ['@deepseek-ai/cordis']

export default defineConfig([
  {
    name: PLUGIN_ID,
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    dts: false,
    fixedExtension: false,
    clean: false,
    external: NODE_EXTERNALS,
  },
  {
    name: PLUGIN_ID + '/client',
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: [...PLATFORM_MODULES, RUNTIME_STORE_EXEMPTION],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
