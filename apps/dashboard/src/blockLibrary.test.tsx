import { render } from '@testing-library/react'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BLOCK_CATEGORIES, BlockRenderer, EDIT_PROP, PageRenderer, listBlocks } from '@uidesired/blocks'
import type { BlockField } from '@uidesired/types'

const blocks = listBlocks()

describe('block library', () => {
  it('covers every category', () => {
    for (const category of BLOCK_CATEGORIES) {
      expect(blocks.filter((block) => block.category === category).length).toBeGreaterThan(0)
    }
  })

  it('renders every block with its default props', () => {
    for (const block of blocks) {
      const { container, unmount } = render(<BlockRenderer type={block.type} props={block.defaultProps} />)
      expect(container.textContent, `${block.type} rendered nothing`).not.toBe('')
      expect(container.querySelector('[data-unknown-block]')).toBeNull()
      unmount()
    }
    // Renders the whole library (270+ blocks); the budget scales with it.
  }, 60_000)

  it('server-renders the same markup the published site uses', () => {
    const sections = blocks.map((block, index) => ({
      id: `s${index}`,
      type: block.type,
      version: block.version,
      hidden: false,
      props: block.defaultProps,
    }))
    const html = renderToStaticMarkup(<PageRenderer content={{ schemaVersion: 1, sections }} />)
    expect(html).toContain('data-page-renderer')
    // The shared stylesheet must ship with the page or blocks lose their layout.
    expect(html).toContain('data-uidesired-blocks')
    expect(html).toContain('container-type:inline-size')
    expect(html).not.toContain('Unknown block type')
    for (const block of blocks) {
      expect(html, `${block.type} produced no markup`).toContain(`data-section-type="${block.type}"`)
    }
  })

  it('pins the whole navigation block when sticky header is enabled', () => {
    const sticky = renderToStaticMarkup(
      <PageRenderer
        content={{
          schemaVersion: 1,
          sections: [
            { id: 'nav', type: 'navbar.lumen', props: { sticky: true, brand: 'Lumen & Lane' } },
            { id: 'hero', type: 'hero.lumen', props: { heading: 'Hello' } },
          ],
        }}
      />,
    )
    expect(sticky).toMatch(/data-section-type="navbar.lumen"[^>]*class="ud-sticky-header"/)
    expect(sticky).not.toMatch(/data-section-type="hero.lumen"[^>]*ud-sticky-header/)

    const unpinned = renderToStaticMarkup(
      <PageRenderer
        content={{
          schemaVersion: 1,
          sections: [{ id: 'nav', type: 'navbar.lumen', props: { sticky: false, brand: 'Lumen & Lane' } }],
        }}
      />,
    )
    expect(unpinned).not.toMatch(/data-section-type="navbar.lumen"[^>]*ud-sticky-header/)
  })

  it('keeps published markup free of inline editing attributes', () => {
    const published = blocks.map((block, index) => ({
      id: `s${index}`,
      type: block.type,
      version: block.version,
      hidden: false,
      props: block.defaultProps,
    }))
    const html = renderToStaticMarkup(<PageRenderer content={{ schemaVersion: 1, sections: published }} />)
    // The stylesheet always ships; only the block markup must stay editor-free.
    const markup = html.replace(/<style[\s\S]*?<\/style>/g, '')
    expect(markup).not.toContain('contenteditable')
    expect(markup).not.toContain('data-edit-path')
    expect(markup).not.toContain('ud-editable')
    expect(markup).not.toContain('ud-edit-image')
    expect(markup).not.toContain('__edit')
  })

  it('turns text into editable regions when the builder injects a binding', () => {
    const edit = { commit: () => {}, pickImage: () => {} }
    const missing: string[] = []
    for (const block of blocks) {
      const html = renderToStaticMarkup(
        <PageRenderer
          content={{
            schemaVersion: 1,
            sections: [
              {
                id: 'edit',
                type: block.type,
                version: block.version,
                hidden: false,
                props: { ...block.defaultProps, [EDIT_PROP]: edit },
              },
            ],
          }}
        />,
      )
      // The binding must never be serialised into the DOM.
      expect(html, `${block.type} leaked the binding`).not.toContain('__edit')
      if (!html.includes('data-edit-path')) missing.push(block.type)
    }
    // Every block must expose at least one region you can edit straight on the canvas.
    expect(missing, `blocks without inline editing: ${missing.join(', ')}`).toEqual([])
  }, 30_000)

  it('declares an editable schema with unique, grouped fields', () => {
    const groups = new Set(['content', 'design', 'layout', 'spacing', 'typography', 'animation', 'background'])
    for (const block of blocks) {
      const fields: BlockField[] = block.schema.fields
      expect(fields.length, `${block.type} has no fields`).toBeGreaterThan(3)
      const keys = fields.map((field) => field.key)
      expect(new Set(keys).size, `${block.type} has duplicate field keys`).toBe(keys.length)
      for (const field of fields) {
        expect(groups.has(field.group || 'content'), `${block.type}.${field.key} has an unknown group`).toBe(true)
        if (field.type === 'repeater') {
          expect(field.fields?.length, `${block.type}.${field.key} repeater has no child fields`).toBeGreaterThan(0)
        }
        if (field.type === 'select') {
          expect(field.options?.length, `${block.type}.${field.key} select has no options`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('exposes repeater editors for every list-shaped default prop', () => {
    for (const block of blocks) {
      for (const [key, value] of Object.entries(block.defaultProps)) {
        if (!Array.isArray(value)) continue
        const field = block.schema.fields.find((entry) => entry.key === key)
        expect(field?.type, `${block.type}.${key} has array defaults but no repeater field`).toBe('repeater')
      }
    }
  })

  it('exposes font and animation controls on every block', () => {
    for (const block of blocks) {
      const keys = new Set(block.schema.fields.map((field) => field.key))
      expect(keys.has('headingFont'), `${block.type} is missing heading font`).toBe(true)
      expect(keys.has('bodyFont'), `${block.type} is missing body font`).toBe(true)
      expect(keys.has('animation'), `${block.type} is missing animation`).toBe(true)
      const heading = block.schema.fields.find((field) => field.key === 'headingFont')
      expect(heading?.options?.length, `${block.type} heading font list is too small`).toBeGreaterThan(20)
    }

    const html = renderToStaticMarkup(
      <BlockRenderer
        type="hero.centered"
        props={{ heading: 'Hello', animation: 'fade-up', animationTrigger: 'load' }}
      />,
    )
    expect(html).toContain('ud-anim-fade-up')
    expect(html).toContain('data-ud-anim="load"')
  })
})
