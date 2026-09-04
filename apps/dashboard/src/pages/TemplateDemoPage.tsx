import type { Template, TemplatePage, ThemeTokens } from '@uidesired/types'
import { BlockStyles, PageRenderer, themeTokensToStyle } from '@uidesired/blocks'
import { useQuery } from '@tanstack/react-query'
import { useMemo, type CSSProperties, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GoogleFonts } from '../components/GoogleFonts'
import { publicTemplatesApi } from '../lib/endpoints'
import { isTemplateInternalPath, templateDemoPath } from '../lib/templatePreview'

/**
 * A live, shareable demo of a ready-made template.
 *
 * Deliberately outside RequireAuth: this is what the marketing site links to,
 * so someone with no account can click through a real template — every page,
 * the real theme, the real blocks — before deciding to sign up. It reads the
 * public template endpoints rather than the dashboard ones for the same
 * reason.
 */
function asPages(value: Template['pages']): TemplatePage[] {
  if (!Array.isArray(value)) return []
  const pages: TemplatePage[] = []
  for (const page of value) {
    if (!page || typeof page !== 'object' || !('slug' in page)) continue
    const slug = (page as { slug?: unknown }).slug
    if (typeof slug !== 'string') continue
    pages.push(page as TemplatePage)
  }
  return pages
}

function pageContent(page: TemplatePage | undefined) {
  const content = page?.content_json
  const sections = content?.sections?.filter((section) => section.type && !section.hidden) ?? []
  return { schemaVersion: content?.schemaVersion ?? 1, sections }
}

export function TemplateDemoPage() {
  const { slug = '', pageSlug } = useParams()
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['public-template', slug],
    queryFn: () => publicTemplatesApi.get(slug),
    enabled: Boolean(slug),
  })

  const template = query.data
  const pages = useMemo(() => asPages(template?.pages), [template?.pages])
  const current = useMemo(() => {
    if (pageSlug) return pages.find((page) => page.slug === pageSlug) ?? pages.find((page) => page.is_homepage)
    return pages.find((page) => page.is_homepage) ?? pages[0]
  }, [pageSlug, pages])
  const content = pageContent(current)
  const theme = (template?.theme_tokens || undefined) as ThemeTokens | undefined
  const background = typeof theme?.background === 'string' ? theme.background : '#ffffff'

  // The demo is a real site, so its links are real paths. Keep them inside the
  // demo instead of navigating the visitor out of it.
  function onSiteClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement | null)?.closest('a')
    if (!target) return
    const href = target.getAttribute('href') || ''
    if (!isTemplateInternalPath(href)) return
    event.preventDefault()
    const next = href.replace(/^\//, '')
    navigate(templateDemoPath(slug, next || 'home'))
  }

  if (query.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500">Loading demo…</div>
  }

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-zinc-700">
        <p className="text-sm">This demo is not available.</p>
        <Link to="/register" className="text-sm text-blue-600 hover:underline">
          Start building your own site
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-zinc-200 bg-white/95 px-4 py-2.5 text-sm backdrop-blur">
        <span className="font-medium text-zinc-900">{template.name}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Demo
        </span>
        <nav className="flex flex-wrap gap-1 md:ml-3">
          {pages.map((page) => {
            const active = current?.slug === page.slug
            return (
              <Link
                key={page.slug}
                to={templateDemoPath(template.slug, page.slug)}
                className={`rounded-full px-3 py-1 text-xs ${
                  active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {page.name}
              </Link>
            )
          })}
        </nav>
        <Link
          to={`/register?template=${encodeURIComponent(template.slug)}`}
          className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
        >
          Use this template
        </Link>
      </header>

      <div
        className="canvas-theme min-h-[calc(100vh-46px)]"
        style={{ background, ...(themeTokensToStyle(theme) as CSSProperties) }}
        onClick={onSiteClick}
      >
        <GoogleFonts theme={theme} content={content} />
        <BlockStyles />
        {content.sections.length ? (
          <PageRenderer content={content} theme={theme} includeStyles={false} siteName={template.name} />
        ) : (
          <p className="p-10 text-center text-sm text-zinc-500">This page has no content yet.</p>
        )}
      </div>
    </div>
  )
}
