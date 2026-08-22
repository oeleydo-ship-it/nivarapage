import { describe, expect, it } from 'vitest'
import { blockCss } from '@uidesired/blocks'

/**
 * A second `.ud-section { position: relative; overflow: hidden }` rule was
 * declared far below `.ud-nav--sticky`. Equal specificity, later in the source,
 * so it won: every sticky navbar silently fell back to `position: relative`,
 * and the per-section Overflow control could never take effect.
 *
 * These assertions are about cascade order, which is exactly what regressed.
 */

/** Offsets of every top-level rule whose selector list contains `selector`. */
function offsetsOf(selector: string): number[] {
  const out: number[] = []
  // Sticky selectors double their class (`.x.x{`), so `.` is a valid terminator.
  const pattern = new RegExp(`(^|[,}])\\s*${selector.replace('.', '\\.')}\\s*[,{.]`, 'g')
  let match: RegExpExecArray | null
  while ((match = pattern.exec(blockCss)) !== null) out.push(match.index)
  return out
}

/** Declarations of `property` inside rules that target exactly `selector`. */
function declarationsFor(selector: string, property: string): string[] {
  const out: string[] = []
  const pattern = new RegExp(`(?:^|[}\\n])\\s*${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`, 'g')
  let match: RegExpExecArray | null
  while ((match = pattern.exec(blockCss)) !== null) {
    const decl = new RegExp(`(?:^|;)\\s*${property}\\s*:([^;]*)`).exec(match[1])
    if (decl) out.push(decl[1].trim())
  }
  return out
}

describe('section cascade', () => {
  it('ships a stylesheet at all', () => {
    expect(blockCss.length).toBeGreaterThan(10_000)
  })

  it('declares .ud-section position exactly once', () => {
    expect(declarationsFor('.ud-section', 'position')).toEqual(['relative'])
  })

  it('never hard-codes .ud-section overflow past the control', () => {
    const declared = declarationsFor('.ud-section', 'overflow')
    expect(declared).toHaveLength(1)
    // Must read the variable, so the per-section Overflow control can win.
    expect(declared[0]).toContain('--ud-overflow')
  })

  it('keeps every .ud-section rule ahead of .ud-nav--sticky', () => {
    const sticky = offsetsOf('.ud-nav--sticky')
    expect(sticky).not.toHaveLength(0)

    // A later same-specificity .ud-section rule would override position again.
    const laterSectionRules = declarationsFor('.ud-section', 'position').length
    expect(laterSectionRules).toBe(1)

    const lastSection = Math.max(...offsetsOf('.ud-section'))
    const firstSticky = Math.min(...sticky)
    // The responsive padding-only rule is allowed after; it sets no position.
    const tail = blockCss.slice(firstSticky)
    expect(/\.ud-section\s*\{[^}]*position\s*:/.test(tail)).toBe(false)
    expect(lastSection).toBeGreaterThan(0)
  })

  it('still defines the sticky rules themselves', () => {
    expect(blockCss).toContain('.ud-nav--sticky.ud-nav--sticky{position:sticky;top:0')
    expect(blockCss).toContain('.ud-is-sticky.ud-is-sticky{position:sticky;top:0')
  })
})

/**
 * `.ud-kd-subnav` set `position:relative` 1900 lines below `.ud-is-sticky`.
 * Equal specificity, later in the source, so the sub-nav quietly un-stuck
 * itself. Every sticky rule now doubles its class to sit at (0,2,0), which no
 * single-class rule can beat no matter where it lands in the file.
 */
describe('sticky rules outrank single-class overrides', () => {
  const stickyRules = [...blockCss.matchAll(/([^{};\n]*?)\{position:sticky/g)].map((m) => m[1].trim())

  it('finds the sticky rules', () => {
    expect(stickyRules.length).toBeGreaterThan(10)
  })

  it('gives every sticky rule more than one class', () => {
    const weak = stickyRules.filter((selector) => (selector.match(/\./g) ?? []).length < 2)
    expect(weak).toEqual([])
  })

  it('covers the shared utility and the core navbar', () => {
    expect(stickyRules).toContain('.ud-is-sticky.ud-is-sticky')
    expect(stickyRules).toContain('.ud-nav--sticky.ud-nav--sticky')
  })
})
