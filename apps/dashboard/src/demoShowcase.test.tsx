import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, EDIT_PROP, getBlock } from '@uidesired/blocks'

/**
 * The block that shows off the ready-made templates: a screenshot, the words
 * that explain it, and a link people can actually click to go and look.
 */
const demo = {
  src: '',
  title: 'Voltera',
  description: 'A high-energy marketing agency site.',
  url: 'https://demo.example.com/voltera',
}

function renderShowcase(props: Record<string, unknown>) {
  return render(<BlockRenderer type="gallery.showcase" props={props} />)
}

describe('gallery.showcase', () => {
  it('is a gallery block that the palette will show', () => {
    const block = getBlock('gallery.showcase')
    expect(block).toBeTruthy()
    expect(block!.category).toBe('gallery')
    expect(block!.label).toBe('Demo showcase')
  })

  it('shows the words under the image and a link to the demo', () => {
    const { container } = renderShowcase({ items: [demo], buttonLabel: 'View demo' })

    expect(container.textContent).toContain('Voltera')
    expect(container.textContent).toContain('A high-energy marketing agency site.')

    const link = container.querySelector('a.ud-btn') as HTMLAnchorElement | null
    expect(link).toBeTruthy()
    expect(link!.getAttribute('href')).toBe('https://demo.example.com/voltera')
    expect(link!.textContent).toContain('View demo')
  })

  it('lets one demo override the shared button label', () => {
    const { container } = renderShowcase({
      buttonLabel: 'View demo',
      items: [demo, { ...demo, title: 'Halcyon', buttonLabel: 'Preview demo' }],
    })

    const labels = [...container.querySelectorAll('a.ud-btn')].map((node) => node.textContent?.trim())
    expect(labels).toEqual(['View demo', 'Preview demo'])
  })

  it('opens demos in a new tab unless told otherwise', () => {
    const { container: newTab } = renderShowcase({ items: [demo], openInNewTab: true })
    expect(newTab.querySelector('a.ud-btn')?.getAttribute('target')).toBe('_blank')

    const { container: sameTab } = renderShowcase({ items: [demo], openInNewTab: false })
    expect(sameTab.querySelector('a.ud-btn')?.getAttribute('target')).toBeNull()
  })

  it('hides the button on a published page when no demo has been linked', () => {
    const { container } = renderShowcase({ items: [{ ...demo, url: '' }] })

    // Nothing to click is worse than no button at all.
    expect(container.querySelector('a.ud-btn')).toBeNull()
    expect(container.textContent).toContain('Voltera')
  })

  it('keeps the button on the canvas so its label can be written first', () => {
    const { container } = renderShowcase({
      items: [{ ...demo, url: '' }],
      [EDIT_PROP]: { commit: () => {}, pickImage: () => {} },
    })

    expect(container.querySelector('a.ud-btn')).toBeTruthy()
  })

  it('ships defaults that already read as a showcase', () => {
    const block = getBlock('gallery.showcase')!
    const { container } = renderShowcase(block.defaultProps)

    expect(container.textContent).toContain('Ready-made designs')
    expect((block.defaultProps.items as unknown[]).length).toBeGreaterThanOrEqual(3)
    expect(block.defaultProps.buttonLabel).toBe('View demo')
  })
})
