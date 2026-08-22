import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { BlockRenderer, listBlocks } from '@uidesired/blocks'

/**
 * Every navigation block must offer a sticky header, and the toggle has to do
 * something. `navbar.counsel` used to declare the field and never read it, so
 * the second assertion here is the one that earns its keep.
 */
const navBlocks = listBlocks().filter((block) => block.category === 'navigation')

function fieldsOf(block: (typeof navBlocks)[number]) {
  const schema = block.schema as { fields?: Array<{ key: string; label: string; group?: string }> } | undefined
  return schema?.fields ?? []
}

function classesWith(block: (typeof navBlocks)[number], sticky: boolean): string {
  const { container, unmount } = render(
    <BlockRenderer type={block.type} props={{ ...block.defaultProps, sticky }} />,
  )
  const html = [...container.querySelectorAll('[class]')]
    .map((node) => node.getAttribute('class') ?? '')
    .join(' ')
  unmount()
  return html
}

describe('sticky header across navigation blocks', () => {
  it('has navigation blocks to check', () => {
    expect(navBlocks.length).toBeGreaterThan(20)
  })

  it('offers a sticky toggle on every navigation block', () => {
    const missing = navBlocks.filter((block) => !fieldsOf(block).some((f) => f.key === 'sticky'))
    expect(missing.map((b) => b.type)).toEqual([])
  })

  it('puts the toggle in the content group, not layout', () => {
    const misplaced = navBlocks
      .map((block) => ({ type: block.type, field: fieldsOf(block).find((f) => f.key === 'sticky') }))
      .filter((row) => row.field && row.field.group !== 'content')
    expect(misplaced.map((r) => `${r.type}:${r.field?.group}`)).toEqual([])
  })

  it('labels it the same way everywhere', () => {
    const labels = new Set(
      navBlocks.map((block) => fieldsOf(block).find((f) => f.key === 'sticky')?.label).filter(Boolean),
    )
    expect([...labels]).toEqual(['Sticky header'])
  })

  it('actually changes the rendered markup when toggled', () => {
    const inert: string[] = []
    for (const block of navBlocks) {
      const on = classesWith(block, true)
      const off = classesWith(block, false)
      if (on === off || !/sticky/i.test(on)) inert.push(block.type)
    }
    expect(inert).toEqual([])
  })

  it('does not leave a sticky class behind when switched off', () => {
    const stuck = navBlocks.filter((block) => /sticky/i.test(classesWith(block, false)))
    expect(stuck.map((b) => b.type)).toEqual([])
  })
})
