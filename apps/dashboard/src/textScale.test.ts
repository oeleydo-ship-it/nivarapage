import { describe, expect, it } from 'vitest'
import { textScaleMultiplier, themeTokensToCssVars } from '@uidesired/blocks'

/**
 * Text size is authored as a percentage because that is what reads well in the
 * Theme panel, but CSS has to multiply lengths by a plain number. Everything
 * about the site-wide type scale hangs off that conversion.
 */
describe('site-wide text scale', () => {
  it('turns the percentage people type into the multiplier CSS needs', () => {
    expect(textScaleMultiplier('100%')).toBe(1)
    expect(textScaleMultiplier('110%')).toBe(1.1)
    expect(textScaleMultiplier('85%')).toBe(0.85)
  })

  it('accepts a bare multiplier so a hand-written or generated theme still works', () => {
    expect(textScaleMultiplier('1.15')).toBe(1.15)
    expect(textScaleMultiplier(1.2)).toBe(1.2)
  })

  it('clamps values that would break the layout rather than restyle it', () => {
    expect(textScaleMultiplier('400%')).toBe(1.6)
    expect(textScaleMultiplier('10%')).toBe(0.75)
  })

  it('ignores anything that is not a size at all', () => {
    for (const value of ['', '   ', 'large', null, undefined, {}, '0%']) {
      expect(textScaleMultiplier(value)).toBeNull()
    }
  })

  it('emits the multiplier as a CSS variable alongside the other tokens', () => {
    const vars = themeTokensToCssVars({ textScale: '112%', containerWidth: '1240px' } as never)

    expect(vars['--ud-font-scale']).toBe('1.12')
    expect(vars['--container-width']).toBe('1240px')
  })

  it('leaves the variable out when the theme does not set a size', () => {
    // Blocks fall back to var(--ud-font-scale,1), so an absent token must mean
    // "unchanged" rather than a zero that would collapse every font size.
    expect(themeTokensToCssVars({ containerWidth: '1120px' } as never)['--ud-font-scale']).toBeUndefined()
  })
})
