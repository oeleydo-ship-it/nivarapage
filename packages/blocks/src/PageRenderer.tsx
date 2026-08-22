'use client'

import type { ThemeTokens } from '@uidesired/types'
import { useEffect } from 'react'
import { BlockRenderer } from './BlockRenderer'
import { bool } from './primitives'
import { FormPageProvider } from './public-form'
import { NavigationProvider, type NavLinkItem } from './navigation'
import { getBlock } from './registry'
import { SiteProvider } from './site'
import { mergeResponsiveProps, responsiveSectionCss, type PreviewDevice } from './responsive'
import { BlockStyles } from './styles'
import { ThemeSchemeProvider, tokensForScheme, useThemeScheme } from './theme-scheme'
import { themeTokensToStyle } from './theme'

/**
 * Loose shape of stored page JSON. Payloads come from the API, so every field is
 * treated as optional and unknown block types fall back to a safe placeholder.
 */
export type RenderableContent = {
  schemaVersion?: number
  sections?: Array<{
    id?: string
    type: string
    version?: number
    hidden?: boolean
    props?: Record<string, unknown>
  }>
}

export function PageRenderer({
  content,
  theme,
  navigation,
  pageId,
  siteName,
  includeStyles = true,
  formApiBase,
  previewDevice = 'desktop',
}: {
  content?: RenderableContent | null
  theme?: ThemeTokens
  navigation?: NavLinkItem[] | null
  pageId?: string | number | null
  siteName?: string | null
  /** Set to false when the stylesheet is already rendered higher in the tree. */
  includeStyles?: boolean
  /** Public form HTTP prefix. Dashboard uses `/api/v1/public/forms`. */
  formApiBase?: string
  /** Builder canvas width. Published pages stay on desktop props and use CSS media queries. */
  previewDevice?: PreviewDevice
}) {
  const sections = content?.sections ?? []
  useScrollAnimations(sections)

  return (
    <SiteProvider name={siteName}>
      <ThemeSchemeProvider theme={theme} siteName={siteName}>
        <NavigationProvider items={navigation}>
          <FormPageProvider pageId={pageId} formApiBase={formApiBase}>
            {includeStyles ? <BlockStyles /> : null}
            <ThemedPage theme={theme} sections={sections} previewDevice={previewDevice} />
          </FormPageProvider>
        </NavigationProvider>
      </ThemeSchemeProvider>
    </SiteProvider>
  )
}

function ThemedPage({
  theme,
  sections,
  previewDevice,
}: {
  theme?: ThemeTokens
  sections: NonNullable<RenderableContent['sections']>
  previewDevice: PreviewDevice
}) {
  const { scheme } = useThemeScheme()
  const resolved = tokensForScheme(theme, scheme)
  const pattern = typeof resolved?.surfacePattern === 'string' ? resolved.surfacePattern : undefined

  return (
    <div
      data-page-renderer
      data-color-scheme={scheme}
      data-surface-pattern={pattern || undefined}
      style={resolved ? themeTokensToStyle(resolved) : undefined}
    >
      {sections
        .filter((section) => !section.hidden)
        .map((section, index) => {
          const stored = section.props ?? {}
          const css = section.id ? responsiveSectionCss(section.id, stored) : ''
          return (
            <div
              key={section.id ?? index}
              data-section-id={section.id}
              data-section-type={section.type}
              className={sectionIsStickyHeader(section) ? 'ud-sticky-header' : undefined}
            >
              {css ? <style data-ud-responsive={section.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
              <BlockRenderer type={section.type} props={mergeResponsiveProps(stored, previewDevice)} theme={resolved} />
            </div>
          )
        })}
    </div>
  )
}

/**
 * Navigation bars live inside a per-section wrapper. That wrapper is only as
 * tall as the bar, so `position: sticky` on the header itself has nowhere to
 * travel. Pin the wrapper instead when Sticky header is on.
 *
 * Most navs treat a missing value as on (`bool(sticky, true)`). Families that
 * default off store `sticky: false` on the block.
 */
function sectionIsStickyHeader(section: { type: string; props?: Record<string, unknown> }) {
  const block = getBlock(section.type)
  const value = section.props && Object.prototype.hasOwnProperty.call(section.props, 'sticky')
    ? section.props.sticky
    : block?.defaultProps?.sticky
  const navHeader = /^(navbar\.|generated\.nav$|topbar\.|subnav\.)/.test(section.type)
  return bool(value, navHeader)
}

/**
 * The element a page actually scrolls in. The builder canvas marks itself with
 * `data-canvas-scroll`; elsewhere we look for a genuinely scrollable ancestor
 * and otherwise fall back to the viewport (`null`).
 */
function scrollRootFor(root: Element): Element | null {
  const canvas = root.closest('[data-canvas-scroll]')
  if (canvas instanceof Element) return canvas
  let node = root.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

function useScrollAnimations(sections: RenderableContent['sections']) {
  const signature = (sections ?? [])
    .map((section) => `${section.id}:${section.props?.animation}:${section.props?.animationTrigger}`)
    .join('|')

  useEffect(() => {
    const roots = document.querySelectorAll('[data-page-renderer]')
    const observers: IntersectionObserver[] = []
    const cleanups: Array<() => void> = []
    const reveal = (node: Element) => node.classList.add('ud-anim-in')

    // Without IntersectionObserver every scroll section would stay at opacity 0.
    if (typeof IntersectionObserver === 'undefined') {
      roots.forEach((root) => root.querySelectorAll('[data-ud-anim="scroll"]').forEach(reveal))
      return
    }

    roots.forEach((root) => {
      const nodes = root.querySelectorAll<HTMLElement>('[data-ud-anim="scroll"]')
      if (!nodes.length) return
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // A section the reader has already scrolled past will never
            // intersect again, so a fast scroll or an anchor jump would leave it
            // stuck at opacity 0. Treat "above the viewport" as seen.
            const bounds = entry.rootBounds
            const scrolledPast = Boolean(bounds) && entry.boundingClientRect.bottom <= bounds!.top
            if (!entry.isIntersecting && !scrolledPast) continue
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        },
        {
          // Observe against the real scroll container, or the viewport. Using an
          // arbitrary ancestor made the percentage rootMargin scale with the
          // whole document, so on long pages the bottom section (the footer)
          // fell outside the margin and never revealed.
          root: scrollRootFor(root),
          threshold: 0.05,
          rootMargin: '0px 0px -48px 0px',
        },
      )
      nodes.forEach((node) => io.observe(node))
      observers.push(io)

      // Jumping straight past a section (anchor link, restored scroll position)
      // moves it from below the fold to above it without ever crossing a
      // threshold, so the observer stays silent and the section is stuck at
      // opacity 0. This sweep reveals anything that has reached the viewport.
      const pending = new Set<HTMLElement>(Array.from(nodes))
      const sweep = () => {
        const limit = window.innerHeight
        for (const node of Array.from(pending)) {
          if (node.getBoundingClientRect().top < limit) {
            reveal(node)
            io.unobserve(node)
            pending.delete(node)
          }
        }
        if (!pending.size) detach()
      }
      const onScroll = () => {
        if (frame) return
        frame = requestAnimationFrame(() => {
          frame = 0
          sweep()
        })
      }
      let frame = 0
      const detach = () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (frame) cancelAnimationFrame(frame)
        frame = 0
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
      cleanups.push(detach)
    })

    return () => {
      observers.forEach((io) => io.disconnect())
      cleanups.forEach((detach) => detach())
    }
  }, [signature])
}
