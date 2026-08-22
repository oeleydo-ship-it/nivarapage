import { fontStacksFromContent, googleFontCatalogHref, googleFontHref } from '@uidesired/blocks/theme'
import type { PageContent, ThemeTokens } from '@uidesired/types'
import { useEffect } from 'react'

const LINK_ID = 'uidesired-google-fonts'

/** Loads the same Google Fonts stylesheet the public renderer uses. */
export function GoogleFonts({
  theme,
  content,
}: {
  theme?: Partial<ThemeTokens> | null
  content?: PageContent | { sections?: Array<{ props?: Record<string, unknown> }> } | null
}) {
  const used = googleFontHref(
    typeof theme?.headingFont === 'string' ? theme.headingFont : 'Inter',
    typeof theme?.bodyFont === 'string' ? theme.bodyFont : 'Inter',
    typeof theme?.monoFont === 'string' ? theme.monoFont : null,
    typeof theme?.serifFont === 'string' ? theme.serifFont : null,
    ...fontStacksFromContent(content),
  )
  const href = googleFontCatalogHref() || used

  useEffect(() => {
    if (!href) return
    const ensure = (id: string, rel: string, extras: Record<string, string> = {}) => {
      let node = document.getElementById(id) as HTMLLinkElement | null
      if (!node) {
        node = document.createElement('link')
        node.id = id
        node.rel = rel
        for (const [key, value] of Object.entries(extras)) node.setAttribute(key, value)
        document.head.appendChild(node)
      }
      return node
    }
    ensure('uidesired-fonts-preconnect', 'preconnect', { href: 'https://fonts.googleapis.com' })
    ensure('uidesired-fonts-gstatic', 'preconnect', { href: 'https://fonts.gstatic.com', crossorigin: '' })
    const link = ensure(LINK_ID, 'stylesheet')
    if (link.href !== href) link.href = href
  }, [href])

  return null
}
