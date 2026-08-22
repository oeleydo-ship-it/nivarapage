import type { PageSection } from '@uidesired/types'
import { describe, expect, it } from 'vitest'
import { applyPageStyleProfile, pageStyleProfile } from './lib/sectionDefaults'

function section(type: string, props: Record<string, unknown> = {}): PageSection {
  return { id: type, type, version: 1, hidden: false, props } as PageSection
}

/** Mirrors how a Northbook page is seeded: fade-up on scroll over 680ms. */
const motion = { animation: 'fade-up', animationTrigger: 'scroll', animationDuration: 680 }

const northbookPage: PageSection[] = [
  section('topbar.northbook', { animation: 'none' }),
  section('navbar.northbook', { animation: 'fade-down', animationTrigger: 'load' }),
  section('hero.northbook', { ...motion, animationTrigger: 'load' }),
  section('services.northbook', motion),
  section('inlinecta.northbook', motion),
  section('split.northbook', motion),
  section('personas.northbook', motion),
  section('contact.northbook', motion),
  section('footer.northbook', { animation: 'fade-up' }),
]

describe('page style profile', () => {
  it('picks up the template’s motion convention', () => {
    const profile = pageStyleProfile(northbookPage)
    expect(profile.animation).toBe('fade-up')
    expect(profile.animationDuration).toBe(680)
    expect(profile.animationTrigger).toBe('scroll')
  })

  it('ignores navbar, topbar and footer chrome when deciding', () => {
    // The topbar sets animation:none and the navbar fade-down; neither should win.
    const profile = pageStyleProfile(northbookPage)
    expect(profile.animation).not.toBe('none')
    expect(profile.animation).not.toBe('fade-down')
  })

  it('leaves per-section design choices alone', () => {
    const profile = pageStyleProfile([
      section('a', { ...motion, tone: 'dark', paddingTop: 120, textAlign: 'center' }),
      section('b', { ...motion, tone: 'dark', paddingTop: 120, textAlign: 'center' }),
    ])
    expect(profile).not.toHaveProperty('tone')
    expect(profile).not.toHaveProperty('paddingTop')
    expect(profile).not.toHaveProperty('textAlign')
  })

  it('does not let a single odd section become the convention', () => {
    const profile = pageStyleProfile([
      section('a', { animation: 'fade-up' }),
      section('b', { animation: 'zoom-in' }),
      section('c', { contentWidth: 'wide' }),
    ])
    // 1 of 2 for animation is below the agreement threshold.
    expect(profile).not.toHaveProperty('animation')
    // Only one section defines contentWidth, so there is nothing to agree on.
    expect(profile).not.toHaveProperty('contentWidth')
  })

  it('returns nothing for a page too short to have a convention', () => {
    expect(pageStyleProfile([section('a', motion)])).toEqual({})
    expect(pageStyleProfile([])).toEqual({})
    expect(pageStyleProfile(null)).toEqual({})
  })

  it('gives a core-library block the template’s settings on insert', () => {
    // `services.grid` ships with no motion props at all.
    const props: Record<string, unknown> = {}
    applyPageStyleProfile(props, northbookPage)
    expect(props.animation).toBe('fade-up')
    expect(props.animationTrigger).toBe('scroll')
    expect(props.animationDuration).toBe(680)
  })

  it('overrides a block default that disagrees with the page', () => {
    const props: Record<string, unknown> = { animation: 'zoom-in', animationDuration: 300 }
    applyPageStyleProfile(props, northbookPage)
    expect(props.animation).toBe('fade-up')
    expect(props.animationDuration).toBe(680)
  })

  it('keeps the block’s own content untouched', () => {
    const props: Record<string, unknown> = { heading: 'My heading', items: [{ title: 'One' }] }
    applyPageStyleProfile(props, northbookPage)
    expect(props.heading).toBe('My heading')
    expect(props.items).toEqual([{ title: 'One' }])
  })

  it('inherits typography when the page sets it consistently', () => {
    const page = [
      section('a', { headingFont: 'Figtree, sans-serif', headingWeight: 800 }),
      section('b', { headingFont: 'Figtree, sans-serif', headingWeight: 800 }),
      section('c', { headingFont: 'Figtree, sans-serif', headingWeight: 800 }),
    ]
    const props: Record<string, unknown> = {}
    applyPageStyleProfile(props, page)
    expect(props.headingFont).toBe('Figtree, sans-serif')
    expect(props.headingWeight).toBe(800)
  })
})
