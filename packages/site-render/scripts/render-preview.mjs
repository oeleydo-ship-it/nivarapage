/**
 * Renders a template's seeded pages to standalone HTML files, so a new block
 * family can be looked at without logging into the dashboard.
 *
 * Usage: node packages/site-render/scripts/render-preview.mjs <input.json> <outDir>
 *
 * The input is {theme, pages:[{name,slug,is_homepage,content}]} — the shape
 * `php artisan tinker` dumps from a Template. Output is one .html per page plus
 * an index.html linking them.
 */
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(here, '..')
const repoRoot = resolve(packageRoot, '../..')

// esbuild is a devDependency of @uidesired/blocks, not of this package.
const blocksRequire = createRequire(resolve(repoRoot, 'packages/blocks/package.json'))
const { build } = await import(pathToFileURL(blocksRequire.resolve('esbuild')).href)
const bundlePath = resolve(repoRoot, 'apps/dashboard/node_modules/.render-preview.mjs')

const [, , inputArg, outArg] = process.argv
if (!inputArg || !outArg) {
  console.error('usage: render-preview.mjs <input.json> <outDir>')
  process.exit(1)
}

await build({
  stdin: {
    contents: `export { renderSiteDocument } from ${JSON.stringify(resolve(packageRoot, 'src/render.tsx'))}`,
    resolveDir: repoRoot,
    loader: 'ts',
  },
  outfile: bundlePath,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  jsx: 'automatic',
  logLevel: 'warning',
  external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime'],
})

try {
  const { renderSiteDocument } = await import(pathToFileURL(bundlePath).href)
  const input = JSON.parse(readFileSync(resolve(inputArg), 'utf8'))
  const outDir = resolve(outArg)
  mkdirSync(outDir, { recursive: true })

  const site = {
    site_id: 1,
    name: 'Preview',
    status: 'published',
    host: 'preview.local',
    redirect_to_primary: false,
    theme: input.theme,
    branding_removed: true,
  }

  for (const page of input.pages) {
    const html = renderSiteDocument({
      site,
      page: { id: page.id ?? 1, name: page.name, slug: page.slug, is_homepage: page.is_homepage, content: page.content },
      menus: [],
      path: page.is_homepage ? '/' : `/${page.slug}`,
      host: 'preview.local',
    })
    // Links between pages are rooted at "/" in the seed; rewrite them to the
    // sibling files so the preview can be clicked through from disk.
    const local = html.replace(/href="\/(?!\/)([a-z0-9-]*)"/g, (_m, slug) => `href="${slug || 'home'}.html"`)
    writeFileSync(resolve(outDir, `${page.slug}.html`), local, 'utf8')
  }

  const list = input.pages
    .map((p) => `<li><a href="${p.slug}.html">${p.name}</a></li>`)
    .join('\n')
  writeFileSync(
    resolve(outDir, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Preview</title><ul>${list}</ul>`,
    'utf8',
  )
  console.log(`Rendered ${input.pages.length} pages to ${outDir}`)
} finally {
  rmSync(bundlePath, { force: true })
}
