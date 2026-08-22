import type { Template, TemplatePage, ThemeTokens } from '@uidesired/types'
import { BlockStyles, PageRenderer, themeTokensToStyle } from '@uidesired/blocks'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useMemo, type CSSProperties, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GoogleFonts } from '../components/GoogleFonts'
import { templatesApi } from '../lib/endpoints'
import { isTemplateInternalPath, templatePreviewPath } from '../lib/templatePreview'

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

export function TemplateFullPreviewPage() {
  const { slug = '', pageSlug } = useParams()
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['template', slug],
    queryFn: () => templatesApi.get(slug),
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

  function onSiteClick(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement | null)?.closest('a')
    if (!target) return
    const href = target.getAttribute('href') || ''
    if (!isTemplateInternalPath(href)) return
    event.preventDefault()
    const next = href.replace(/^\//, '')
    navigate(templatePreviewPath(slug, next || 'home'))
  }

  if (query.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">Loading preview…</div>
  }

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-300">
        <p>This template is not available.</p>
        <Link to="/templates" className="text-sm text-blue-400 hover:underline">
          Back to templates
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 text-sm text-zinc-300 backdrop-blur">
        <Link to="/templates" className="font-medium text-zinc-400 hover:text-white">
          Templates
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-white">{template.name}</span>
        <span className="text-zinc-500">preview</span>
        <nav className="flex flex-wrap gap-1 md:ml-4">
          {pages.map((page) => {
            const href = templatePreviewPath(template.slug, page.slug)
            const active = current?.slug === page.slug
            return (
              <Link
                key={page.slug}
                to={href}
                className={`rounded-full px-3 py-1 text-xs ${active ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
              >
                {page.name}
              </Link>
            )
          })}
        </nav>
        <Link to={`/sites/new?template=${encodeURIComponent(slug)}`} className="ml-auto text-xs text-blue-400 hover:underline">
          Use this template
        </Link>
      </header>
      <div className="canvas-theme min-h-[calc(100vh-52px)]" style={{ background, ...(themeTokensToStyle(theme) as CSSProperties) }} onClick={onSiteClick}>
        <GoogleFonts theme={theme} content={content} />
        <BlockStyles />
        {content.sections.length ? (
          <PageRenderer content={content} theme={theme} includeStyles={false} siteName={template.name} />
        ) : (
          <p className="p-10 text-center text-sm text-zinc-500">This template has no homepage content yet.</p>
        )}
      </div>
    </div>
  )
}

export function TemplatePreviewLink({
  slug,
  className = '',
}: {
  slug: string
  className?: string
}) {
  return (
    <a
      href={templatePreviewPath(slug)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 ${className}`}
    >
      <ExternalLink size={14} />
      Preview
    </a>
  )
}
