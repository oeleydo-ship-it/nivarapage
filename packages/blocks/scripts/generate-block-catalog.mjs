/**
 * Serialises the block registry into a JSON catalog the Laravel API reads.
 *
 * Run from the repo root: `pnpm blocks:catalog`
 *
 * The output is committed so the API never needs Node at request time, and CI
 * can re-run this to detect drift after new blocks land. AI prompts and AI
 * output validation are both derived from this file, which is why it must be
 * generated from the registry rather than hand-maintained.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(here, '..')
// Bundled next to the package so Node still resolves react from its node_modules.
const bundlePath = resolve(packageRoot, 'node_modules/.block-catalog.mjs')

await build({
  stdin: {
    contents: `export { buildBlockCatalog } from ${JSON.stringify(resolve(packageRoot, 'src/catalog.ts'))}`,
    resolveDir: packageRoot,
    loader: 'ts',
  },
  outfile: bundlePath,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  jsx: 'automatic',
  logLevel: 'warning',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
})

try {
  const { buildBlockCatalog } = await import(pathToFileURL(bundlePath).href)
  const catalog = buildBlockCatalog()

  const target = resolve(packageRoot, '../../apps/api/resources/blocks/block-catalog.json')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${catalog.blocks.length} blocks to ${target}`)
} finally {
  rmSync(bundlePath, { force: true })
}
