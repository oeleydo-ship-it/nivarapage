import { describe, expect, it } from 'vitest'
import { blockCss, listBlocks } from '@uidesired/blocks'

/**
 * Quarry must recolour entirely from Theme settings.
 *
 * The family was authored against a green-and-lime reference, and it is easy to
 * paste a literal from that palette into a rule. Any such literal survives a
 * theme change and leaves one stubbornly green pill on an otherwise blue page,
 * so the stylesheet is asserted to be free of them.
 */
function quarryCss(): string {
  const start = blockCss.indexOf('/* ------------------------------------------------------------------- Quarry')
  expect(start).toBeGreaterThan(-1)
  // The family is the last block in the sheet; take everything from its header.
  return blockCss.slice(start)
}

/** Hex literals that are neither a token fallback nor a neutral black/white. */
function stubbornColours(css: string): string[] {
  const out: string[] = []
  for (const line of css.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('*') || trimmed.startsWith('/*')) continue
    for (const hex of trimmed.match(/#[0-9a-fA-F]{3,8}/g) ?? []) {
      const value = hex.toLowerCase()
      // Neutrals are legitimate: white text on a dark band, a black mix for hover.
      if (['#fff', '#ffffff', '#000', '#000000'].includes(value)) continue
      // `var(--color-x, #fallback)` only applies when the theme has no value.
      const isFallback = new RegExp(`var\\(\\s*--[\\w-]+\\s*,\\s*${value}\\s*\\)`, 'i').test(trimmed)
      if (isFallback) continue
      out.push(`${trimmed.split('{')[0].trim()} -> ${hex}`)
    }
  }
  return out
}

describe('quarry recolours from the theme', () => {
  it('ships the family stylesheet', () => {
    expect(quarryCss().length).toBeGreaterThan(4000)
  })

  it('bakes in no palette literals outside token fallbacks', () => {
    expect(stubbornColours(quarryCss())).toEqual([])
  })

  it('never hard-codes the reference green or lime anywhere', () => {
    // The colours the reference site used. None may appear, fallback or not.
    for (const literal of ['#cdf03a', '#2f4a17', '#20320f', '#16180f', '#f4f4ee', '#6b6f5f']) {
      expect(quarryCss().toLowerCase()).not.toContain(literal)
    }
  })

  it('names accent classes by role, not by colour', () => {
    // `--lime` / `is-lime` read as a lie once the accent is sky blue.
    expect(quarryCss()).not.toMatch(/ud-qr-[\w-]*lime/)
    expect(quarryCss()).not.toContain('--qr-lime')
    expect(quarryCss()).not.toContain('--qr-forest')
  })

  it('drives every accent surface from --qr-accent', () => {
    const css = quarryCss()
    for (const rule of ['.ud-qr-mark', '.ud-qr-eyebrow__dot', '.ud-qr-btn--accent', '.ud-qr-pixels__cell.is-accent']) {
      const match = new RegExp(`${rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`).exec(css)
      expect(match, `${rule} should exist`).not.toBeNull()
      expect(match![1]).toContain('--qr-accent')
    }
  })

  it('keeps text on the accent following the theme, not the dark scopes', () => {
    const css = quarryCss()
    // The dark scopes flip --qr-ink to white; accent-backed text uses its own
    // token so it stays readable whatever the accent becomes.
    expect(css).toContain('--qr-on-accent:var(--color-text')
    expect(css).toMatch(/\.ud-qr-btn--accent\{[^}]*color:var\(--qr-on-accent\)/)
  })

  it('exposes no colour props on the blocks themselves', () => {
    // Colour belongs to the theme. A per-block colour default would pin one
    // section to the old palette when the theme changes.
    const quarry = listBlocks().filter((block) => block.type.endsWith('.quarry'))
    expect(quarry.length).toBeGreaterThan(10)
    const pinned = quarry.flatMap((block) =>
      Object.entries(block.defaultProps)
        .filter(([, value]) => typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value))
        .map(([key]) => `${block.type}.${key}`),
    )
    expect(pinned).toEqual([])
  })
})
