import { describe, expect, it } from 'vitest'
import { setAtPath } from '../lib/props'

describe('setAtPath', () => {
  it('writes a top-level prop without touching the rest', () => {
    const props = { heading: 'Old', tone: 'dark' }
    const next = setAtPath(props, ['heading'], 'New')
    expect(next).toEqual({ heading: 'New', tone: 'dark' })
    expect(props.heading).toBe('Old')
  })

  it('creates a list when the missing container is indexed', () => {
    // An object here would store `{ "0": … }`, which the blocks read as "no
    // items" and replace with their demo content, losing the edit.
    const next = setAtPath({ heading: 'H' }, ['items', 0, 'title'], 'First')
    expect(Array.isArray(next.items)).toBe(true)
    expect(next.items).toEqual([{ title: 'First' }])
  })

  it('edits an existing item in place and clones the array', () => {
    const props = { items: [{ title: 'One' }, { title: 'Two' }] }
    const next = setAtPath(props, ['items', 1, 'title'], 'Changed')
    expect(next.items).toEqual([{ title: 'One' }, { title: 'Changed' }])
    expect(props.items[1].title).toBe('Two')
  })

  it('still creates plain objects for named segments', () => {
    const next = setAtPath({}, ['seo', 'title'], 'Hello')
    expect(Array.isArray(next.seo)).toBe(false)
    expect(next.seo).toEqual({ title: 'Hello' })
  })
})
