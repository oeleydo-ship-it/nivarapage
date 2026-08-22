import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, getBlock } from '@uidesired/blocks'

/**
 * `showcase.tessera` used to render `bleed`, which skips `.ud-container`
 * entirely — so the shared Content width control was inert on it and the cards
 * ran edge to edge while every other section sat at the site container.
 *
 * Narrow / Default / Wide must now put the grid inside the container (Default
 * resolving to the theme's own `--container-width`, so the block lines up with
 * the rest of the page), and only Full may bleed.
 */
const WIDTHS = {
  narrow: '760px',
  default: 'var(--container-width, 1120px)',
  wide: '1360px',
  full: '100%',
} as const

function renderShowcase(contentWidth?: string) {
  const block = getBlock('showcase.tessera')!
  const { container, unmount } = render(
    <BlockRenderer
      type="showcase.tessera"
      props={{ ...block.defaultProps, ...(contentWidth ? { contentWidth } : {}) }}
    />,
  )
  const section = container.querySelector('section')!
  const result = {
    maxWidth: section.style.getPropertyValue('--ud-max').trim(),
    boxed: section.classList.contains('ud-ts-showcase--boxed'),
    bleed: section.classList.contains('ud-ts-showcase--bleed'),
    hasContainer: !!section.querySelector(':scope > .ud-container'),
    gridInContainer: !!section.querySelector('.ud-container .ud-ts-showcase__grid'),
    columns: section.querySelector('.ud-ts-showcase__grid')?.getAttribute('data-count'),
  }
  unmount()
  return result
}

describe('tessera showcase content width', () => {
  it('offers all four widths on the block', () => {
    const field = getBlock('showcase.tessera')!.schema.fields.find((f) => f.key === 'contentWidth')
    expect(field?.group).toBe('layout')
    expect(field?.options?.map((o) => o.value)).toEqual(['narrow', 'default', 'wide', 'full'])
  })

  it.each(['narrow', 'default', 'wide'] as const)('constrains %s to the shared container', (width) => {
    const out = renderShowcase(width)
    expect(out.maxWidth).toBe(WIDTHS[width])
    expect(out.boxed).toBe(true)
    expect(out.bleed).toBe(false)
    expect(out.gridInContainer).toBe(true)
  })

  it('aligns Default to the site-wide container width', () => {
    // Not a hard-coded pixel value: it reads the theme token, which is what
    // makes the block line up with every other section on the page.
    expect(renderShowcase('default').maxWidth).toContain('--container-width')
  })

  it('falls back to Default when nothing is set', () => {
    const unset = renderShowcase()
    expect(unset.maxWidth).toBe(WIDTHS.default)
    expect(unset.boxed).toBe(true)
  })

  it('bleeds edge to edge only on Full', () => {
    const out = renderShowcase('full')
    expect(out.bleed).toBe(true)
    expect(out.boxed).toBe(false)
    expect(out.hasContainer).toBe(false)
  })

  it('keeps the three-column default independent of width', () => {
    for (const width of ['narrow', 'default', 'wide', 'full'] as const) {
      expect(renderShowcase(width).columns).toBe('3')
    }
  })
})
