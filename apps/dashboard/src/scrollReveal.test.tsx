import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PageRenderer } from '@uidesired/blocks'

/**
 * Sections with a scroll animation start at opacity 0 and are revealed by an
 * IntersectionObserver adding `.ud-anim-in`. A footer that never gets that class
 * renders as a blank strip, so these pin down the observer's configuration and
 * the two cases that used to leave sections permanently invisible.
 */
type ObserverInstance = {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  observed: Element[]
  unobserved: Element[]
}

let instances: ObserverInstance[] = []

class FakeIntersectionObserver {
  observed: Element[] = []
  unobserved: Element[] = []

  constructor(
    public callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit = {},
  ) {
    instances.push(this as unknown as ObserverInstance)
  }

  observe(node: Element) {
    this.observed.push(node)
  }

  unobserve(node: Element) {
    this.unobserved.push(node)
  }

  disconnect() {}
  takeRecords() {
    return []
  }
}

function entryFor(target: Element, opts: { isIntersecting: boolean; top: number; bottom: number }) {
  return {
    target,
    isIntersecting: opts.isIntersecting,
    boundingClientRect: { top: opts.top, bottom: opts.bottom } as DOMRectReadOnly,
    rootBounds: { top: 0, bottom: 800 } as DOMRectReadOnly,
    intersectionRatio: opts.isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    time: 0,
  } as unknown as IntersectionObserverEntry
}

const content = {
  schemaVersion: 1 as const,
  sections: [
    { id: 'a', type: 'articles.kindred', version: 1, hidden: false, props: { animation: 'fade-up', animationTrigger: 'scroll' } },
    { id: 'f', type: 'footer.kindred', version: 1, hidden: false, props: { animation: 'fade-up', animationTrigger: 'scroll' } },
  ],
}

beforeEach(() => {
  instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('scroll reveal', () => {
  it('observes against the viewport when there is no scroll container', () => {
    render(<PageRenderer content={content} />)
    expect(instances.length).toBeGreaterThan(0)
    // A non-scrolling ancestor made the percentage rootMargin scale with the
    // whole document, which pushed the last section out of range.
    expect(instances[0].options.root ?? null).toBeNull()
  })

  it('keeps the bottom margin in pixels so it cannot scale with page height', () => {
    render(<PageRenderer content={content} />)
    const margin = String(instances[0].options.rootMargin ?? '')
    expect(margin).not.toMatch(/-\s*\d+(\.\d+)?%/)
    expect(margin).toMatch(/px/)
  })

  it('reveals a section once it intersects', () => {
    const { container } = render(<PageRenderer content={content} />)
    const io = instances[0]
    const node = io.observed[0]
    expect(node.classList.contains('ud-anim-in')).toBe(false)
    io.callback([entryFor(node, { isIntersecting: true, top: 100, bottom: 500 })], io as unknown as IntersectionObserver)
    expect(node.classList.contains('ud-anim-in')).toBe(true)
    expect(container.querySelectorAll('.ud-anim-in').length).toBe(1)
  })

  it('reveals a section that was scrolled straight past', () => {
    render(<PageRenderer content={content} />)
    const io = instances[0]
    const node = io.observed[0]
    // Above the viewport and not intersecting: a fast scroll or anchor jump.
    io.callback([entryFor(node, { isIntersecting: false, top: -900, bottom: -400 })], io as unknown as IntersectionObserver)
    expect(node.classList.contains('ud-anim-in')).toBe(true)
  })

  it('leaves a section below the fold hidden until it is reached', () => {
    render(<PageRenderer content={content} />)
    const io = instances[0]
    const node = io.observed[0]
    io.callback([entryFor(node, { isIntersecting: false, top: 1200, bottom: 1800 })], io as unknown as IntersectionObserver)
    expect(node.classList.contains('ud-anim-in')).toBe(false)
  })

  it('reveals everything when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { container } = render(<PageRenderer content={content} />)
    const scrollSections = container.querySelectorAll('[data-ud-anim="scroll"]')
    expect(scrollSections.length).toBeGreaterThan(0)
    scrollSections.forEach((node) => expect(node.classList.contains('ud-anim-in')).toBe(true))
  })
})
