import type { Template, ThemeTokens } from '@uidesired/types'
import { BlockStyles, PageRenderer, themeTokensToStyle } from '@uidesired/blocks'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { GoogleFonts } from './GoogleFonts'

/** Desktop width each homepage is rendered at before scaling into the card. */
const RENDER_WIDTH = 1280

export const TEMPLATE_PREVIEW_HEIGHT = 280

function token(tokens: Template['theme_tokens'] | undefined, key: keyof ThemeTokens, fallback: string): string {
  const value = tokens?.[key]
  return typeof value === 'string' && value.trim() ? value : fallback
}

function usePreviewBox() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const measure = () => setWidth(node.clientWidth || 0)
    measure()
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    resize?.observe(node)

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return () => resize?.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '280px' },
    )
    observer.observe(node)

    return () => {
      resize?.disconnect()
      observer.disconnect()
    }
  }, [])

  return { ref, inView, width }
}

/** Loads block CSS and Google Fonts once for a grid of live template previews. */
export function TemplatePreviewAssets() {
  return (
    <>
      <BlockStyles />
      <GoogleFonts />
    </>
  )
}

export function TemplateThemePreview({ template }: { template: Pick<Template, 'name' | 'theme_tokens'> }) {
  const tokens = template.theme_tokens
  const primary = token(tokens, 'primary', '#2563eb')
  const secondary = token(tokens, 'secondary', '#0f172a')
  const accent = token(tokens, 'accent', '#f59e0b')
  const background = token(tokens, 'background', '#111827')
  const headingFont = token(tokens, 'headingFont', 'Inter, system-ui, sans-serif')
  const headingSize = Number(tokens?.headingWeight) >= 700 ? 700 : 600

  return (
    <div
      className="flex h-full min-h-[140px] flex-col justify-between overflow-hidden px-4 py-3"
      style={{
        background: `linear-gradient(145deg, ${secondary} 0%, ${background} 72%)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        {[primary, accent, background].map((color, index) => (
          <span key={`${color}-${index}`} className="size-3.5 rounded-full ring-1 ring-white/20" style={{ background: color }} />
        ))}
        <span className="ml-auto truncate text-[10px] uppercase tracking-[0.16em] text-white/50">
          {headingFont.split(',')[0]}
        </span>
      </div>
      <div
        className="truncate text-lg leading-tight text-white"
        style={{ fontFamily: headingFont, fontWeight: headingSize }}
      >
        {template.name}
      </div>
    </div>
  )
}

/**
 * Scaled live homepage: the same blocks and theme used after Apply template.
 * Falls back to a theme swatch when the API has no homepage content.
 */
export function TemplateLivePreview({
  template,
  height = TEMPLATE_PREVIEW_HEIGHT,
}: {
  template: Template
  height?: number
}) {
  const { ref, inView, width } = usePreviewBox()
  const sections = template.preview?.sections?.filter((section) => section.type && !section.hidden) ?? []
  const theme = (template.theme_tokens || undefined) as ThemeTokens | undefined
  const background = token(template.theme_tokens, 'background', '#ffffff')
  const ready = inView && width > 0
  const scale = width > 0 ? width / RENDER_WIDTH : 0

  if (!sections.length) {
    return (
      <div className="overflow-hidden border-b border-white/5" style={{ height }}>
        <TemplateThemePreview template={template} />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="template-live-preview pointer-events-none select-none overflow-hidden border-b border-white/5"
      style={{ height, background }}
    >
      {ready ? (
        <div
          className="canvas-theme"
          style={{
            width: RENDER_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            ...(themeTokensToStyle(theme) as CSSProperties),
          }}
        >
          <PageRenderer
            content={{ schemaVersion: template.preview?.schemaVersion ?? 1, sections }}
            theme={theme}
            includeStyles={false}
            siteName={template.name}
          />
        </div>
      ) : (
        <div className="h-full w-full animate-pulse" style={{ background }} />
      )}
    </div>
  )
}
