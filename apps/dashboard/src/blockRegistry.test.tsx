import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, blockCss, blockRegistry, getBlock } from '@uidesired/blocks'

describe('blockRegistry', () => {
  it('only renders known types and shows a safe placeholder for unknown types', () => {
    expect(getBlock('hero.centered')).toBeTruthy()
    expect(Object.keys(blockRegistry).includes('navbar.simple')).toBe(true)

    const { rerender } = render(<BlockRenderer type="hero.centered" props={{ heading: 'Hello' }} />)
    expect(screen.getByText('Hello')).toBeTruthy()

    rerender(<BlockRenderer type={'not.a.real.block' + Math.random()} props={{ evil: 'eval' }} />)
    expect(screen.getByText(/Unknown block type/)).toBeTruthy()
    expect(document.body.innerHTML.includes('eval(')).toBe(false)
  })

  it('lets Nivara blocks use the spacing values set by the editor', () => {
    const { container } = render(
      <BlockRenderer
        type="hero.moksha"
        props={{ heading: 'Nivara', paddingTop: 148, paddingBottom: 118 }}
      />,
    )
    const section = container.querySelector('.ud-mk-hero') as HTMLElement

    expect(section.style.getPropertyValue('--ud-pt')).toBe('148px')
    expect(section.style.getPropertyValue('--ud-pb')).toBe('118px')
    expect(blockCss).toContain(
      '.ud-mk-hero{position:relative;display:grid;align-items:center;padding-block:var(--ud-pt,5rem) var(--ud-pb,5rem) !important;',
    )
    expect(blockCss).toContain(
      '.ud-mk-about{padding-block:var(--ud-pt,108px) var(--ud-pb,126px);',
    )
  })

  it('applies saved styles to one text element without changing its siblings', () => {
    const { container } = render(
      <BlockRenderer
        type="hero.moksha"
        props={{
          heading: 'Styled heading',
          description: 'Unchanged description',
          elementStyles: {
            heading: { color: '#c026d3', fontSize: 72, fontWeight: '500', textAlign: 'right', letterSpacing: 1.5 },
          },
        }}
      />,
    )
    const heading = container.querySelector('h1') as HTMLElement
    const description = container.querySelector('.ud-lead') as HTMLElement | null

    expect(heading.style.color).toBe('rgb(192, 38, 211)')
    expect(heading.style.fontSize).toBe('72px')
    expect(heading.style.fontWeight).toBe('500')
    expect(heading.style.textAlign).toBe('right')
    expect(heading.style.letterSpacing).toBe('1.5px')
    expect(description?.style.color || '').toBe('')
  })

  it('gives every registered block the expanded shared design controls', () => {
    const required = ['headingColor', 'paddingInline', 'sectionMinHeight', 'borderWidth', 'backgroundType']
    for (const block of Object.values(blockRegistry)) {
      const keys = new Set(block.schema.fields.map((field) => field.key))
      for (const key of required) expect(keys.has(key), `${block.type} is missing ${key}`).toBe(true)
    }
  })
})
